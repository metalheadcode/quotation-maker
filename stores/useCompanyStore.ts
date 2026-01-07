import { create } from "zustand";
import { CompanyInfo } from "@/lib/types/quotation";

export interface CompanyWithId extends CompanyInfo {
  id: string;
  isDefault?: boolean;
}

interface CompanyStore {
  companies: CompanyWithId[];
  selectedCompany: CompanyWithId | null;
  isLoading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  addCompany: (company: CompanyInfo) => Promise<CompanyWithId | null>;
  updateCompany: (id: string, company: CompanyInfo) => Promise<void>;
  selectCompany: (id: string) => void;
  hasCompany: () => boolean;
  // Legacy compatibility
  company: CompanyWithId | null;
  setCompany: (company: CompanyInfo) => Promise<void>;
  fetchCompany: () => Promise<void>;
  clearCompany: () => void;
}

const defaultCompany: CompanyInfo = {
  name: "",
  registrationNumber: "",
  address: "",
  email: "",
  phone: "",
};

export const useCompanyStore = create<CompanyStore>()((set, get) => ({
  companies: [],
  selectedCompany: null,
  isLoading: false,
  error: null,

  // Legacy getter for backward compatibility
  get company() {
    return get().selectedCompany;
  },

  fetchCompanies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/company-info");
      if (!response.ok) {
        if (response.status === 401) {
          set({ companies: [], selectedCompany: null, isLoading: false });
          return;
        }
        throw new Error("Failed to fetch companies");
      }
      const apiCompanies = await response.json();
      const companies: CompanyWithId[] = apiCompanies.map((c: {
        id: string;
        name: string;
        registration_number?: string | null;
        address: string;
        email: string;
        phone: string;
        is_default?: boolean | null;
      }) => ({
        id: c.id,
        name: c.name,
        registrationNumber: c.registration_number || "",
        address: c.address,
        email: c.email,
        phone: c.phone,
        isDefault: c.is_default || false,
      }));

      // Select default company or first one
      const defaultCompany = companies.find(c => c.isDefault) || companies[0] || null;

      set({
        companies,
        selectedCompany: defaultCompany,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
      set({ error: "Failed to fetch companies", isLoading: false });
    }
  },

  // Legacy alias
  fetchCompany: async () => {
    return get().fetchCompanies();
  },

  addCompany: async (companyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/company-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyData.name,
          registration_number: companyData.registrationNumber,
          address: companyData.address,
          email: companyData.email,
          phone: companyData.phone,
          is_default: get().companies.length === 0, // First company is default
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save company");
      }
      const savedCompany = await response.json();
      const newCompany: CompanyWithId = {
        id: savedCompany.id,
        name: savedCompany.name,
        registrationNumber: savedCompany.registration_number || "",
        address: savedCompany.address,
        email: savedCompany.email,
        phone: savedCompany.phone,
        isDefault: savedCompany.is_default || false,
      };

      set((state) => ({
        companies: [...state.companies, newCompany],
        selectedCompany: newCompany,
        isLoading: false,
      }));

      return newCompany;
    } catch (error) {
      console.error("Error saving company:", error);
      set({ error: "Failed to save company", isLoading: false });
      throw error;
    }
  },

  // Legacy alias
  setCompany: async (companyData) => {
    await get().addCompany(companyData);
  },

  updateCompany: async (id, companyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/company-info/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyData.name,
          registration_number: companyData.registrationNumber,
          address: companyData.address,
          email: companyData.email,
          phone: companyData.phone,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update company");
      }
      const updatedCompany = await response.json();
      const mapped: CompanyWithId = {
        id: updatedCompany.id,
        name: updatedCompany.name,
        registrationNumber: updatedCompany.registration_number || "",
        address: updatedCompany.address,
        email: updatedCompany.email,
        phone: updatedCompany.phone,
        isDefault: updatedCompany.is_default || false,
      };

      set((state) => ({
        companies: state.companies.map(c => c.id === id ? mapped : c),
        selectedCompany: state.selectedCompany?.id === id ? mapped : state.selectedCompany,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating company:", error);
      set({ error: "Failed to update company", isLoading: false });
      throw error;
    }
  },

  selectCompany: (id) => {
    const company = get().companies.find(c => c.id === id);
    if (company) {
      set({ selectedCompany: company });
    }
  },

  clearCompany: () => set({ selectedCompany: null }),

  hasCompany: () => {
    const { selectedCompany } = get();
    return selectedCompany !== null && selectedCompany.name !== "";
  },
}));

export { defaultCompany };
