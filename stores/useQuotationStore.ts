import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuotationData } from "@/lib/types/quotation";

interface QuotationStore {
  draft: QuotationData | null;
  lastQuotationNumber: number;
  saveDraft: (data: QuotationData) => void;
  clearDraft: () => void;
  hasDraft: () => boolean;
  getNextQuotationNumber: () => string;
  incrementQuotationNumber: () => void;
}

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      draft: null,
      lastQuotationNumber: 0,

      saveDraft: (data) => set({ draft: data }),

      clearDraft: () => set({ draft: null }),

      hasDraft: () => get().draft !== null,

      getNextQuotationNumber: () => {
        const { lastQuotationNumber } = get();
        const nextNumber = lastQuotationNumber + 1;
        return `#QUO${String(nextNumber).padStart(6, "0")}`;
      },

      incrementQuotationNumber: () => {
        set((state) => ({
          lastQuotationNumber: state.lastQuotationNumber + 1,
        }));
      },
    }),
    {
      name: "quotation-draft-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
