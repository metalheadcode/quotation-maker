import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuotationData } from "@/lib/types/quotation";

export interface DraftQuotation {
  id: string;
  quotationNumber: string;
  projectTitle: string;
  updatedAt: string;
  data: QuotationData;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface QuotationStore {
  // Local draft (legacy - for backwards compatibility)
  draft: QuotationData | null;
  lastQuotationNumber: number;

  // Supabase drafts
  drafts: DraftQuotation[];
  currentDraftId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isLoadingDrafts: boolean;

  // Local draft methods (legacy)
  saveDraft: (data: QuotationData) => void;
  clearDraft: () => void;
  hasDraft: () => boolean;
  getNextQuotationNumber: () => string;
  incrementQuotationNumber: () => void;

  // Supabase draft methods
  fetchDrafts: () => Promise<void>;
  saveDraftToSupabase: (data: QuotationDataWithIds) => Promise<string | null>;
  loadDraftById: (id: string) => Promise<QuotationDataWithIds | null>;
  deleteDraftFromSupabase: (id: string) => Promise<void>;
  setCurrentDraftId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  clearCurrentDraft: () => void;
}

// Extended data with IDs for saving to database
export interface QuotationDataWithIds extends QuotationData {
  clientId?: string;
  companyInfoId?: string;
  bankInfoId?: string;
}

// Helper to convert form data to API format
const formDataToApiFormat = (data: QuotationDataWithIds) => ({
  quotation_number: data.quotationNumber,
  date: data.date,
  valid_until: data.validUntil,
  project_title: data.projectTitle,
  from_company_name: data.from.name,
  from_company_registration: data.from.registrationNumber,
  from_company_address: data.from.address,
  from_company_email: data.from.email,
  from_company_phone: data.from.phone,
  company_info_id: data.companyInfoId || null,
  client_name: data.to.name,
  client_company: data.to.registrationNumber,
  client_address: data.to.address,
  client_email: data.to.email,
  client_phone: data.to.phone,
  client_id: data.clientId || null,
  items: data.items,
  subtotal: data.subtotal,
  discount_value: data.discount,
  tax_amount: data.tax,
  shipping: data.shipping,
  total: data.total,
  terms: data.terms?.join("\n"),
  notes: data.notes?.join("\n"),
  bank_name: data.bankInfo?.bankName,
  bank_account_number: data.bankInfo?.accountNumber,
  bank_account_name: data.bankInfo?.accountName,
  bank_info_id: data.bankInfoId || null,
});

// Helper to convert API response to form data (includes IDs for restoring selections)
const apiToFormData = (apiData: Record<string, unknown>): QuotationDataWithIds => ({
  quotationNumber: (apiData.quotation_number as string) || "",
  date: (apiData.date as string) || "",
  validUntil: (apiData.valid_until as string) || "",
  projectTitle: (apiData.project_title as string) || "",
  from: {
    name: (apiData.from_company_name as string) || "",
    registrationNumber: (apiData.from_company_registration as string) || "",
    address: (apiData.from_company_address as string) || "",
    email: (apiData.from_company_email as string) || "",
    phone: (apiData.from_company_phone as string) || "",
  },
  to: {
    name: (apiData.client_name as string) || "",
    registrationNumber: (apiData.client_company as string) || "",
    address: (apiData.client_address as string) || "",
    email: (apiData.client_email as string) || "",
    phone: (apiData.client_phone as string) || "",
  },
  items: (apiData.items as QuotationData["items"]) || [],
  subtotal: (apiData.subtotal as number) || 0,
  discount: (apiData.discount_value as number) || 0,
  tax: (apiData.tax_amount as number) || 0,
  shipping: (apiData.shipping as number) || 0,
  total: (apiData.total as number) || 0,
  terms: ((apiData.terms as string) || "").split("\n").filter(Boolean),
  notes: ((apiData.notes as string) || "").split("\n").filter(Boolean),
  bankInfo: {
    bankName: (apiData.bank_name as string) || "",
    accountNumber: (apiData.bank_account_number as string) || "",
    accountName: (apiData.bank_account_name as string) || "",
  },
  // Include IDs for restoring dropdown selections when loading drafts
  clientId: (apiData.client_id as string) || undefined,
  companyInfoId: (apiData.company_info_id as string) || undefined,
  bankInfoId: (apiData.bank_info_id as string) || undefined,
});

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      // Local state
      draft: null,
      lastQuotationNumber: 0,

      // Supabase state
      drafts: [],
      currentDraftId: null,
      saveStatus: "idle" as SaveStatus,
      lastSavedAt: null,
      isLoadingDrafts: false,

      // Local draft methods
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

      // Supabase draft methods
      fetchDrafts: async () => {
        set({ isLoadingDrafts: true });
        try {
          const response = await fetch("/api/quotations/draft");
          if (!response.ok) {
            if (response.status === 401) {
              set({ drafts: [], isLoadingDrafts: false });
              return;
            }
            throw new Error("Failed to fetch drafts");
          }
          const apiDrafts = await response.json();
          const drafts: DraftQuotation[] = apiDrafts.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            quotationNumber: (d.quotation_number as string) || "",
            projectTitle: (d.project_title as string) || "Untitled",
            updatedAt: (d.updated_at as string) || new Date().toISOString(),
            data: apiToFormData(d),
          }));
          set({ drafts, isLoadingDrafts: false });
        } catch (error) {
          console.error("Error fetching drafts:", error);
          set({ isLoadingDrafts: false });
        }
      },

      saveDraftToSupabase: async (data) => {
        const { currentDraftId } = get();
        set({ saveStatus: "saving" });

        try {
          const apiData = formDataToApiFormat(data);
          const response = await fetch("/api/quotations/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...apiData,
              id: currentDraftId, // Pass ID if updating existing draft
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save draft");
          }

          const savedDraft = await response.json();
          const newDraftId = savedDraft.id as string;

          // Update drafts list
          const formData = apiToFormData(savedDraft);
          const draftEntry: DraftQuotation = {
            id: newDraftId,
            quotationNumber: savedDraft.quotation_number || "",
            projectTitle: savedDraft.project_title || "Untitled",
            updatedAt: savedDraft.updated_at || new Date().toISOString(),
            data: formData,
          };

          set((state) => {
            const existingIndex = state.drafts.findIndex((d) => d.id === newDraftId);
            const newDrafts =
              existingIndex >= 0
                ? state.drafts.map((d) => (d.id === newDraftId ? draftEntry : d))
                : [draftEntry, ...state.drafts];

            return {
              drafts: newDrafts,
              currentDraftId: newDraftId,
              saveStatus: "saved",
              lastSavedAt: new Date(),
            };
          });

          return newDraftId;
        } catch (error) {
          console.error("Error saving draft:", error);
          set({ saveStatus: "error" });
          return null;
        }
      },

      loadDraftById: async (id) => {
        try {
          const response = await fetch(`/api/quotations/draft/${id}`);
          if (!response.ok) {
            throw new Error("Failed to load draft");
          }
          const apiDraft = await response.json();
          const formData = apiToFormData(apiDraft);
          set({ currentDraftId: id });
          return formData;
        } catch (error) {
          console.error("Error loading draft:", error);
          return null;
        }
      },

      deleteDraftFromSupabase: async (id) => {
        try {
          const response = await fetch(`/api/quotations/draft/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            throw new Error("Failed to delete draft");
          }

          set((state) => ({
            drafts: state.drafts.filter((d) => d.id !== id),
            currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
          }));
        } catch (error) {
          console.error("Error deleting draft:", error);
          throw error;
        }
      },

      setCurrentDraftId: (id) => set({ currentDraftId: id }),

      setSaveStatus: (status) => set({ saveStatus: status }),

      clearCurrentDraft: () =>
        set({
          currentDraftId: null,
          saveStatus: "idle",
          lastSavedAt: null,
        }),
    }),
    {
      name: "quotation-draft-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastQuotationNumber: state.lastQuotationNumber,
        // Don't persist drafts array - it comes from Supabase
      }),
    }
  )
);
