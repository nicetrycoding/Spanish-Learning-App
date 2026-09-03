import { cn } from "@/lib/utils";

/** Wordmark. A compass/path glyph — "find your way through the language" — rather than a mascot. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif-display text-lg font-semibold tracking-tight", className)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke="var(--primary)" strokeWidth="1.6" />
        <path d="M15.5 8.5 12.8 12.8 8.5 15.5l2.7-4.3 4.3-2.7Z" fill="var(--primary)" />
      </svg>
      Sendero
    </span>
  );
}
