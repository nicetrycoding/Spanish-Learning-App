"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function OptionCard({
  selected,
  onClick,
  title,
  description,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/60",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        {description && <span className="block text-sm text-muted-foreground">{description}</span>}
      </span>
    </button>
  );
}
