import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CompanyInfo } from "@/lib/types/quotation";

interface CompanyStore {
  company: CompanyInfo | null;
  setCompany: (company: CompanyInfo) => void;
  clearCompany: () => void;
  hasCompany: () => boolean;
}

const defaultCompany: CompanyInfo = {
  name: "",
  registrationNumber: "",
  address: "",
  email: "",
  phone: "",
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      company: null,

      setCompany: (company) => set({ company }),

      clearCompany: () => set({ company: null }),

      hasCompany: () => {
        const { company } = get();
        return company !== null && company.name !== "";
      },
    }),
    {
      name: "quotation-company-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { defaultCompany };
