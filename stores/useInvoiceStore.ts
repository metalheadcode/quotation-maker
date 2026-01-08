import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  InvoiceData,
  InvoiceDataWithIds,
  Invoice,
  InvoiceStatus,
} from "@/lib/types/invoice";
import { QuotationData } from "@/lib/types/quotation";

type SaveStatus = "idle" | "saving" | "saved" | "error";

// Generate random alphanumeric string
const generateRandomAlphanumeric = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface InvoiceStore {
  // State
  invoices: Invoice[];
  currentInvoiceId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isLoadingInvoices: boolean;

  // Methods
  fetchInvoices: () => Promise<void>;
  generateInvoiceNumber: () => string;
  saveInvoice: (data: InvoiceDataWithIds) => Promise<string | null>;
  loadInvoiceById: (id: string) => Promise<InvoiceDataWithIds | null>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  setCurrentInvoiceId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  clearCurrentInvoice: () => void;
  createInvoiceFromQuotation: (
    quotationId: string,
    bankInfo: { bankName: string; accountNumber: string; accountName: string },
    bankInfoId: string,
    poNumber?: string
  ) => Promise<InvoiceDataWithIds | null>;
}

// Helper to convert form data to API format
const formDataToApiFormat = (data: InvoiceDataWithIds) => ({
  invoice_number: data.invoiceNumber,
  po_number: data.poNumber || null,
  invoice_date: data.invoiceDate,
  due_date: data.dueDate,
  status: data.status,
  project_title: data.projectTitle,
  from_company_name: data.from.name,
  from_company_registration: data.from.registrationNumber,
  from_company_address: data.from.address,
  from_company_email: data.from.email,
  from_company_phone: data.from.phone,
  from_company_logo_url: data.from.logoUrl || null,
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
  sst_rate: data.sstRate,
  sst_amount: data.sstAmount,
  shipping: data.shipping,
  total: data.total,
  terms: data.terms?.join("\n"),
  notes: data.notes?.join("\n"),
  bank_name: data.bankInfo.bankName,
  bank_account_number: data.bankInfo.accountNumber,
  bank_account_name: data.bankInfo.accountName,
  bank_info_id: data.bankInfoId || null,
  paid_date: data.paidDate || null,
  paid_amount: data.paidAmount || null,
  payment_reference: data.paymentReference || null,
  quotation_id: data.quotationId || null,
});

// Helper to convert API response to form data
const apiToFormData = (
  apiData: Record<string, unknown>
): InvoiceDataWithIds => ({
  invoiceNumber: (apiData.invoice_number as string) || "",
  poNumber: (apiData.po_number as string) || "",
  invoiceDate: (apiData.invoice_date as string) || "",
  dueDate: (apiData.due_date as string) || "",
  status: (apiData.status as InvoiceStatus) || "draft",
  projectTitle: (apiData.project_title as string) || "",
  from: {
    name: (apiData.from_company_name as string) || "",
    registrationNumber: (apiData.from_company_registration as string) || "",
    address: (apiData.from_company_address as string) || "",
    email: (apiData.from_company_email as string) || "",
    phone: (apiData.from_company_phone as string) || "",
    logoUrl: (apiData.from_company_logo_url as string) || "",
  },
  to: {
    name: (apiData.client_name as string) || "",
    registrationNumber: (apiData.client_company as string) || "",
    address: (apiData.client_address as string) || "",
    email: (apiData.client_email as string) || "",
    phone: (apiData.client_phone as string) || "",
  },
  items: (apiData.items as InvoiceData["items"]) || [],
  subtotal: (apiData.subtotal as number) || 0,
  discount: (apiData.discount_value as number) || 0,
  sstRate: (apiData.sst_rate as number) || 0,
  sstAmount: (apiData.sst_amount as number) || 0,
  shipping: (apiData.shipping as number) || 0,
  total: (apiData.total as number) || 0,
  terms: ((apiData.terms as string) || "").split("\n").filter(Boolean),
  notes: ((apiData.notes as string) || "").split("\n").filter(Boolean),
  bankInfo: {
    bankName: (apiData.bank_name as string) || "",
    accountNumber: (apiData.bank_account_number as string) || "",
    accountName: (apiData.bank_account_name as string) || "",
  },
  paidDate: (apiData.paid_date as string) || undefined,
  paidAmount: (apiData.paid_amount as number) || undefined,
  paymentReference: (apiData.payment_reference as string) || undefined,
  quotationId: (apiData.quotation_id as string) || undefined,
  // Include IDs for restoring dropdown selections
  clientId: (apiData.client_id as string) || undefined,
  companyInfoId: (apiData.company_info_id as string) || undefined,
  bankInfoId: (apiData.bank_info_id as string) || undefined,
});

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      // State
      invoices: [],
      currentInvoiceId: null,
      saveStatus: "idle" as SaveStatus,
      lastSavedAt: null,
      isLoadingInvoices: false,

      generateInvoiceNumber: () => {
        return `#INV-${generateRandomAlphanumeric(6)}`;
      },

      fetchInvoices: async () => {
        set({ isLoadingInvoices: true });
        try {
          const response = await fetch("/api/invoices");
          if (!response.ok) {
            if (response.status === 401) {
              set({ invoices: [], isLoadingInvoices: false });
              return;
            }
            throw new Error("Failed to fetch invoices");
          }
          const apiInvoices = await response.json();
          const invoices: Invoice[] = apiInvoices.map(
            (d: Record<string, unknown>) => ({
              id: d.id as string,
              invoiceNumber: (d.invoice_number as string) || "",
              poNumber: (d.po_number as string) || "",
              projectTitle: (d.project_title as string) || "Untitled",
              clientName: (d.client_name as string) || "",
              total: (d.total as number) || 0,
              status: (d.status as InvoiceStatus) || "draft",
              invoiceDate: (d.invoice_date as string) || "",
              dueDate: (d.due_date as string) || "",
              paidDate: (d.paid_date as string) || undefined,
              createdAt: (d.created_at as string) || new Date().toISOString(),
              updatedAt: (d.updated_at as string) || new Date().toISOString(),
              data: apiToFormData(d),
            })
          );
          set({ invoices, isLoadingInvoices: false });
        } catch (error) {
          console.error("Error fetching invoices:", error);
          set({ isLoadingInvoices: false });
        }
      },

      saveInvoice: async (data) => {
        const { currentInvoiceId } = get();
        set({ saveStatus: "saving" });

        try {
          const apiData = formDataToApiFormat(data);
          const isUpdate = !!currentInvoiceId;
          const url = isUpdate
            ? `/api/invoices/${currentInvoiceId}`
            : "/api/invoices";
          const method = isUpdate ? "PUT" : "POST";

          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiData),
          });

          if (!response.ok) {
            throw new Error("Failed to save invoice");
          }

          const savedInvoice = await response.json();
          const invoiceId = savedInvoice.id as string;

          // Update invoices list
          const formData = apiToFormData(savedInvoice);
          const invoiceEntry: Invoice = {
            id: invoiceId,
            invoiceNumber: savedInvoice.invoice_number || "",
            poNumber: savedInvoice.po_number || "",
            projectTitle: savedInvoice.project_title || "Untitled",
            clientName: savedInvoice.client_name || "",
            total: savedInvoice.total || 0,
            status: savedInvoice.status || "draft",
            invoiceDate: savedInvoice.invoice_date || "",
            dueDate: savedInvoice.due_date || "",
            paidDate: savedInvoice.paid_date || undefined,
            createdAt: savedInvoice.created_at || new Date().toISOString(),
            updatedAt: savedInvoice.updated_at || new Date().toISOString(),
            data: formData,
          };

          set((state) => {
            const existingIndex = state.invoices.findIndex(
              (d) => d.id === invoiceId
            );
            const newInvoices =
              existingIndex >= 0
                ? state.invoices.map((d) =>
                    d.id === invoiceId ? invoiceEntry : d
                  )
                : [invoiceEntry, ...state.invoices];

            return {
              invoices: newInvoices,
              currentInvoiceId: invoiceId,
              saveStatus: "saved",
              lastSavedAt: new Date(),
            };
          });

          return invoiceId;
        } catch (error) {
          console.error("Error saving invoice:", error);
          set({ saveStatus: "error" });
          return null;
        }
      },

      loadInvoiceById: async (id) => {
        try {
          const response = await fetch(`/api/invoices/${id}`);
          if (!response.ok) {
            throw new Error("Failed to load invoice");
          }
          const apiInvoice = await response.json();
          const formData = apiToFormData(apiInvoice);
          set({ currentInvoiceId: id });
          return formData;
        } catch (error) {
          console.error("Error loading invoice:", error);
          return null;
        }
      },

      deleteInvoice: async (id) => {
        try {
          const response = await fetch(`/api/invoices/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            throw new Error("Failed to delete invoice");
          }

          set((state) => ({
            invoices: state.invoices.filter((d) => d.id !== id),
            currentInvoiceId:
              state.currentInvoiceId === id ? null : state.currentInvoiceId,
          }));
        } catch (error) {
          console.error("Error deleting invoice:", error);
          throw error;
        }
      },

      updateInvoiceStatus: async (id, status) => {
        try {
          const response = await fetch(`/api/invoices/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (!response.ok) {
            throw new Error("Failed to update invoice status");
          }

          set((state) => ({
            invoices: state.invoices.map((inv) =>
              inv.id === id ? { ...inv, status } : inv
            ),
          }));
        } catch (error) {
          console.error("Error updating invoice status:", error);
          throw error;
        }
      },

      setCurrentInvoiceId: (id) => set({ currentInvoiceId: id }),

      setSaveStatus: (status) => set({ saveStatus: status }),

      clearCurrentInvoice: () =>
        set({
          currentInvoiceId: null,
          saveStatus: "idle",
          lastSavedAt: null,
        }),

      createInvoiceFromQuotation: async (
        quotationId,
        bankInfo,
        bankInfoId,
        poNumber
      ) => {
        try {
          // Fetch the quotation data
          const response = await fetch(`/api/quotations/${quotationId}`);
          if (!response.ok) {
            throw new Error("Failed to load quotation");
          }
          const quotationData = await response.json();

          // Generate random invoice number
          const { generateInvoiceNumber } = get();
          const invoiceNumber = generateInvoiceNumber();

          // Create invoice data from quotation
          const today = new Date();
          const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

          const invoiceData: InvoiceDataWithIds = {
            invoiceNumber,
            poNumber: poNumber || "",
            invoiceDate: today.toISOString().split("T")[0],
            dueDate: dueDate.toISOString().split("T")[0],
            status: "draft",
            projectTitle: quotationData.project_title || "",
            from: {
              name: quotationData.from_company_name || "",
              registrationNumber:
                quotationData.from_company_registration || "",
              address: quotationData.from_company_address || "",
              email: quotationData.from_company_email || "",
              phone: quotationData.from_company_phone || "",
              logoUrl: quotationData.from_company_logo_url || "",
            },
            to: {
              name: quotationData.client_name || "",
              registrationNumber: quotationData.client_company || "",
              address: quotationData.client_address || "",
              email: quotationData.client_email || "",
              phone: quotationData.client_phone || "",
            },
            items: (quotationData.items as QuotationData["items"]) || [],
            subtotal: quotationData.subtotal || 0,
            discount: quotationData.discount_value || 0,
            sstRate: 0, // Default to no SST, user can enable
            sstAmount: 0,
            shipping: quotationData.shipping || 0,
            total: quotationData.total || 0,
            terms: [
              "Payment is due within 30 days of invoice date.",
              "Please include the invoice number as payment reference.",
            ],
            notes: ((quotationData.notes as string) || "")
              .split("\n")
              .filter(Boolean),
            bankInfo,
            quotationId,
            quotationNumber: quotationData.quotation_number || "",
            clientId: quotationData.client_id || undefined,
            companyInfoId: quotationData.company_info_id || undefined,
            bankInfoId,
          };

          return invoiceData;
        } catch (error) {
          console.error("Error creating invoice from quotation:", error);
          return null;
        }
      },
    }),
    {
      name: "invoice-storage",
      storage: createJSONStorage(() => localStorage),
      // Don't persist invoices array - it comes from Supabase
      // No sequential counter to persist with random generation
      partialize: () => ({}),
    }
  )
);
