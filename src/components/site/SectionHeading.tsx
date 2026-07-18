import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            invert ? "text-gold/80" : "text-gold",
          )}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className={cn(
          "mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight",
          invert ? "text-surface-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg leading-relaxed",
            invert ? "text-surface-foreground/70" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
