"use client";

import { Cloud, CloudOff, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

export function SaveStatusIndicator({
  status,
  lastSavedAt,
  className,
}: SaveStatusIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusContent = () => {
    switch (status) {
      case "saving":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Saving...</span>
          </>
        );
      case "saved":
        return (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600">
              Saved {lastSavedAt ? `at ${formatTime(lastSavedAt)}` : ""}
            </span>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">Save failed</span>
          </>
        );
      case "idle":
      default:
        return (
          <>
            {lastSavedAt ? (
              <>
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Last saved at {formatTime(lastSavedAt)}
                </span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Not saved</span>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm transition-all duration-200",
        className
      )}
    >
      {getStatusContent()}
    </div>
  );
}
