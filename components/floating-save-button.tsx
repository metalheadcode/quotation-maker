"use client";

import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveStatusIndicator } from "@/components/save-status-indicator";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface FloatingSaveButtonProps {
  isVisible: boolean;
  isSaving: boolean;
  onSave: () => void;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

export function FloatingSaveButton({
  isVisible,
  isSaving,
  onSave,
  saveStatus,
  lastSavedAt,
  className,
}: FloatingSaveButtonProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 bg-background border rounded-lg shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
        className
      )}
    >
      <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
      <Button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSaving ? "Saving..." : "Save Draft"}
      </Button>
    </div>
  );
}
