import { useEffect, useRef, useCallback } from "react";
import { useQuotationStore, QuotationDataWithIds } from "@/stores/useQuotationStore";

interface UseAutoSaveOptions {
  /** Delay in milliseconds before auto-saving (default: 2000) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save succeeds */
  onSaveSuccess?: (draftId: string) => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt: Date | null;
  currentDraftId: string | null;
  triggerSave: () => Promise<void>;
}

/**
 * Hook for auto-saving quotation draft data to Supabase
 * @param formData - The current form data to save (with optional IDs)
 * @param options - Configuration options
 */
export function useAutoSave(
  formData: QuotationDataWithIds | null,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const { delay = 2000, enabled = true, onSaveStart, onSaveSuccess, onSaveError } = options;

  const {
    saveStatus,
    lastSavedAt,
    currentDraftId,
    saveDraftToSupabase,
    setSaveStatus,
  } = useQuotationStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>("");
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Trigger save manually
  const triggerSave = useCallback(async () => {
    if (!formData) return;

    onSaveStart?.();

    try {
      const draftId = await saveDraftToSupabase(formData);
      if (isMountedRef.current && draftId) {
        onSaveSuccess?.(draftId);
      }
    } catch (error) {
      if (isMountedRef.current) {
        onSaveError?.(error as Error);
      }
    }
  }, [formData, saveDraftToSupabase, onSaveStart, onSaveSuccess, onSaveError]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !formData) {
      return;
    }

    // Serialize form data for comparison
    const serializedData = JSON.stringify(formData);

    // Skip if data hasn't changed
    if (serializedData === lastDataRef.current) {
      return;
    }

    // Update last data reference
    lastDataRef.current = serializedData;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set status to idle while waiting for debounce
    // Only if not already saving
    if (saveStatus !== "saving") {
      setSaveStatus("idle");
    }

    // Schedule save after delay
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      onSaveStart?.();

      try {
        const draftId = await saveDraftToSupabase(formData);
        if (isMountedRef.current && draftId) {
          onSaveSuccess?.(draftId);
        }
      } catch (error) {
        if (isMountedRef.current) {
          onSaveError?.(error as Error);
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    formData,
    delay,
    enabled,
    saveDraftToSupabase,
    setSaveStatus,
    saveStatus,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  ]);

  return {
    saveStatus,
    lastSavedAt,
    currentDraftId,
    triggerSave,
  };
}
