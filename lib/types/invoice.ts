import { QuotationItem, CompanyInfo } from "./quotation";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceBankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  poNumber?: string; // Client's PO reference (e.g., POMS-2512821314)
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  from: CompanyInfo;
  to: CompanyInfo;
  projectTitle: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  sstRate: number; // Malaysian SST (0 or 6)
  sstAmount: number;
  shipping: number;
  total: number;
  terms: string[];
  notes: string[];
  bankInfo: InvoiceBankInfo; // MANDATORY for invoices
  // Payment tracking
  paidDate?: string;
  paidAmount?: number;
  paymentReference?: string;
  // References
  quotationId?: string;
  quotationNumber?: string;
}

export interface InvoiceDataWithIds extends InvoiceData {
  clientId?: string;
  companyInfoId?: string;
  bankInfoId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string;
  projectTitle: string;
  clientName: string;
  total: number;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
  data: InvoiceData;
}

// Default invoice data for creating new invoice
export const defaultInvoiceData: InvoiceData = {
  invoiceNumber: "",
  poNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // 30 days from now
  status: "draft",
  from: {
    name: "",
    registrationNumber: "",
    address: "",
    email: "",
    phone: "",
  },
  to: {
    name: "",
    registrationNumber: "",
    address: "",
    email: "",
    phone: "",
  },
  projectTitle: "",
  items: [],
  subtotal: 0,
  discount: 0,
  sstRate: 0,
  sstAmount: 0,
  shipping: 0,
  total: 0,
  terms: ["Payment is due within 30 days of invoice date."],
  notes: [],
  bankInfo: {
    bankName: "",
    accountNumber: "",
    accountName: "",
  },
};
