-- Drive Smart TX — live schema introspection (READ-ONLY).
-- Paste QUERY 1 into Supabase → SQL Editor and send back the single result cell.
-- Catalog-only: it cannot modify anything and cannot fail on a missing column.

-- ============================================================
-- QUERY 1 — full current state of the public schema
-- ============================================================
select jsonb_pretty(jsonb_build_object(
  'tables', (
    select jsonb_agg(t order by t->>'table')
    from (
      select jsonb_build_object(
        'table', c.relname,
        'rls_enabled', c.relrowsecurity,
        'columns', (
          select jsonb_agg(jsonb_build_object(
            'name', a.attname,
            'type', format_type(a.atttypid, a.atttypmod),
            'not_null', a.attnotnull,
            'default', pg_get_expr(ad.adbin, ad.adrelid)
          ) order by a.attnum)
          from pg_attribute a
          left join pg_attrdef ad on ad.adrelid = a.attrelid and ad.adnum = a.attnum
          where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
        ),
        'constraints', (
          select jsonb_agg(jsonb_build_object(
            'name', con.conname,
            'kind', con.contype::text,
            'definition', pg_get_constraintdef(con.oid)
          ) order by con.conname)
          from pg_constraint con where con.conrelid = c.oid
        ),
        'policies', (
          select jsonb_agg(jsonb_build_object(
            'name', p.polname,
            'cmd', p.polcmd::text,
            'roles', case
              when 0 = any(p.polroles) then jsonb_build_array('PUBLIC')
              else (select jsonb_agg(pr.rolname order by pr.rolname)
                    from pg_roles pr where pr.oid = any(p.polroles))
            end,
            'using', pg_get_expr(p.polqual, p.polrelid),
            'with_check', pg_get_expr(p.polwithcheck, p.polrelid)
          ) order by p.polname)
          from pg_policy p where p.polrelid = c.oid
        ),
        'grants', (
          select jsonb_agg(distinct g.grantee || '=' || g.privilege_type)
          from information_schema.role_table_grants g
          where g.table_schema = 'public'
            and g.table_name = c.relname
            and g.grantee in ('anon', 'authenticated', 'service_role')
        ),
        'indexes', (
          select jsonb_agg(i.indexdef order by i.indexname)
          from pg_indexes i
          where i.schemaname = 'public' and i.tablename = c.relname
        )
      ) as t
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
    ) sub
  ),
  'triggers', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'name', tg.tgname,
      'definition', pg_get_triggerdef(tg.oid)
    ) order by c.relname, tg.tgname), '[]'::jsonb)
    from pg_trigger tg
    join pg_class c on c.oid = tg.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not tg.tgisinternal
  ),
  'functions', (
    select coalesce(jsonb_agg(p.proname order by p.proname), '[]'::jsonb)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  )
)) as schema_dump;


-- ============================================================
-- QUERY 2 (optional) — current data / pipeline health
-- If a column is missing this errors out; that error is itself useful info.
-- ============================================================
select
  (select count(*) from rental_leads)          as leads,
  (select count(*) from qualification_results)  as results,
  (select count(*) from processing_events)      as events,
  (select jsonb_agg(x) from (
     select processing_status, count(*) from rental_leads group by 1 order by 1
   ) x) as by_processing_status,
  (select jsonb_agg(x) from (
     select lead_status, count(*) from rental_leads group by 1 order by 1
   ) x) as by_lead_status,
  (select jsonb_agg(x) from (
     select final_status, ai_priority, count(*)
     from qualification_results group by 1, 2 order by 1, 2
   ) x) as by_final_status,
  (select jsonb_agg(x) from (
     select step_name, status, count(*)
     from processing_events group by 1, 2 order by 1, 2
   ) x) as by_event;
