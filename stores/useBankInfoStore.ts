import { create } from "zustand";

export interface BankInfo {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BankInfoStore {
  bankAccounts: BankInfo[];
  selectedBankAccount: BankInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchBankAccounts: () => Promise<void>;
  addBankAccount: (data: Omit<BankInfo, "id" | "createdAt" | "updatedAt">) => Promise<BankInfo | null>;
  updateBankAccount: (id: string, data: Partial<Omit<BankInfo, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  selectBankAccount: (id: string) => void;
  setDefaultBankAccount: (id: string) => Promise<void>;
}

// Helper to map API response to BankInfo type
const mapApiBankInfo = (apiBankInfo: {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}): BankInfo => ({
  id: apiBankInfo.id,
  bankName: apiBankInfo.bank_name,
  accountNumber: apiBankInfo.account_number,
  accountName: apiBankInfo.account_name,
  isDefault: apiBankInfo.is_default || false,
  createdAt: apiBankInfo.created_at || new Date().toISOString(),
  updatedAt: apiBankInfo.updated_at || new Date().toISOString(),
});

export const useBankInfoStore = create<BankInfoStore>()((set, get) => ({
  bankAccounts: [],
  selectedBankAccount: null,
  isLoading: false,
  error: null,

  fetchBankAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/bank-info");
      if (!response.ok) {
        if (response.status === 401) {
          set({ bankAccounts: [], selectedBankAccount: null, isLoading: false });
          return;
        }
        throw new Error("Failed to fetch bank accounts");
      }
      const apiBankAccounts = await response.json();
      const bankAccounts = apiBankAccounts.map(mapApiBankInfo);

      // Select default bank account or first one
      const defaultAccount = bankAccounts.find((b: BankInfo) => b.isDefault) || bankAccounts[0] || null;

      set({
        bankAccounts,
        selectedBankAccount: defaultAccount,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      set({ error: "Failed to fetch bank accounts", isLoading: false });
    }
  },

  addBankAccount: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/bank-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_name: data.bankName,
          account_number: data.accountNumber,
          account_name: data.accountName,
          is_default: data.isDefault || get().bankAccounts.length === 0,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add bank account");
      }
      const savedBankAccount = await response.json();
      const newBankAccount = mapApiBankInfo(savedBankAccount);

      set((state) => ({
        bankAccounts: [newBankAccount, ...state.bankAccounts],
        selectedBankAccount: newBankAccount,
        isLoading: false,
      }));

      return newBankAccount;
    } catch (error) {
      console.error("Error adding bank account:", error);
      set({ error: "Failed to add bank account", isLoading: false });
      throw error;
    }
  },

  updateBankAccount: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/bank-info/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_name: data.bankName,
          account_number: data.accountNumber,
          account_name: data.accountName,
          is_default: data.isDefault,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update bank account");
      }
      const updatedBankAccount = await response.json();
      const mapped = mapApiBankInfo(updatedBankAccount);

      set((state) => ({
        bankAccounts: state.bankAccounts.map((b) => (b.id === id ? mapped : b)),
        selectedBankAccount: state.selectedBankAccount?.id === id ? mapped : state.selectedBankAccount,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating bank account:", error);
      set({ error: "Failed to update bank account", isLoading: false });
      throw error;
    }
  },

  deleteBankAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/bank-info/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete bank account");
      }

      set((state) => {
        const newBankAccounts = state.bankAccounts.filter((b) => b.id !== id);
        return {
          bankAccounts: newBankAccounts,
          selectedBankAccount:
            state.selectedBankAccount?.id === id
              ? newBankAccounts[0] || null
              : state.selectedBankAccount,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error deleting bank account:", error);
      set({ error: "Failed to delete bank account", isLoading: false });
      throw error;
    }
  },

  selectBankAccount: (id) => {
    const bankAccount = get().bankAccounts.find((b) => b.id === id);
    if (bankAccount) {
      set({ selectedBankAccount: bankAccount });
    }
  },

  setDefaultBankAccount: async (id) => {
    await get().updateBankAccount(id, { isDefault: true });
    // Refresh to get updated default states
    await get().fetchBankAccounts();
  },
}));
