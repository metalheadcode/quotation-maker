import { z } from "zod";
import { companyInfoSchema, quotationItemSchema } from "./quotation";

export const invoiceBankInfoSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
});

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid", "overdue"]);

export const invoiceDataSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  poNumber: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: invoiceStatusSchema,
  from: companyInfoSchema,
  to: companyInfoSchema,
  projectTitle: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  subtotal: z.number(),
  discount: z.number().min(0),
  sstRate: z.number().min(0).max(100),
  sstAmount: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number(),
  terms: z.array(z.string()),
  notes: z.array(z.string()),
  bankInfo: invoiceBankInfoSchema, // Required for invoices
  paidDate: z.string().optional(),
  paidAmount: z.number().optional(),
  paymentReference: z.string().optional(),
  quotationId: z.string().optional(),
  quotationNumber: z.string().optional(),
});

export type InvoiceBankInfoFormData = z.infer<typeof invoiceBankInfoSchema>;
export type InvoiceFormData = z.infer<typeof invoiceDataSchema>;
