/** Fixed header (64px) + sticky section ribbon (~52px) + breathing room. */
export const SCROLL_OFFSET = 128;

export function scrollToId(id: string, offset: number = SCROLL_OFFSET) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}
