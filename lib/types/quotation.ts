export interface QuotationItem {
  id: string;
  description: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  total: number;
}

export interface CompanyInfo {
  name: string;
  registrationNumber: string;
  address: string;
  email: string;
  phone: string;
}

export interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  from: CompanyInfo;
  to: CompanyInfo;
  projectTitle: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  terms: string[];
  notes: string[];
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}
