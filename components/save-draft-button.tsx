"use client";

import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveDraftButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SaveDraftButton({
  onClick,
  isLoading = false,
  disabled = false,
  className,
}: SaveDraftButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn("gap-2", className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isLoading ? "Saving..." : "Save Draft"}
    </Button>
  );
}
