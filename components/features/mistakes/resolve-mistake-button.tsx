"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveMistakeAction } from "@/actions/mistake-actions";

export function ResolveMistakeButton({ mistakeId }: { mistakeId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => resolveMistakeAction(mistakeId))}
    >
      <Check className="h-3.5 w-3.5" /> Mark resolved
    </Button>
  );
}
