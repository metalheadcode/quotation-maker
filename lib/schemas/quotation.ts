import { z } from "zod";

export const companyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  registrationNumber: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

export const quotationItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  pricePerUnit: z.number().min(0, "Price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  total: z.number(),
});

export const bankInfoSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});

export const quotationDataSchema = z.object({
  quotationNumber: z.string().min(1, "Quotation number is required"),
  date: z.string().min(1, "Date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  from: companyInfoSchema,
  to: companyInfoSchema,
  projectTitle: z.string().min(1, "Project title is required"),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  subtotal: z.number(),
  discount: z.number().min(0),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number(),
  terms: z.array(z.string()),
  notes: z.array(z.string()),
  bankInfo: bankInfoSchema,
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type QuotationItemFormData = z.infer<typeof quotationItemSchema>;
export type QuotationFormData = z.infer<typeof quotationDataSchema>;
