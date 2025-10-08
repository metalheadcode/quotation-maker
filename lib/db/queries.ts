import { sql } from '../db';
import { CompanyInfoDB } from '../types/quotation';

// Types
export interface User {
  id: string;
  primary_email: string;
  primary_email_verified: boolean;
  display_name?: string;
  profile_image_url?: string;
  signed_up_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: number;
  user_id?: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Quotation {
  id: number;
  user_id?: string;
  client_id: number;
  quotation_number: string;
  date: Date;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type NewClient = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type NewQuotation = Omit<Quotation, 'id' | 'created_at' | 'updated_at'>;
export type NewCompanyInfo = Omit<CompanyInfoDB, 'id' | 'createdAt' | 'updatedAt'>;

// User Queries
export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM neon_auth.users_sync
    WHERE id = ${id}
  `;
  return result[0] as User || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM neon_auth.users_sync
    WHERE primary_email = ${email}
  `;
  return result[0] as User || null;
}

// Client Queries
export async function getClients(userId?: string): Promise<Client[]> {
  if (userId) {
    const result = await sql`
      SELECT * FROM clients
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result as Client[];
  }

  const result = await sql`
    SELECT * FROM clients
    ORDER BY created_at DESC
  `;
  return result as Client[];
}

export async function getClientById(id: number): Promise<Client | null> {
  const result = await sql`
    SELECT * FROM clients
    WHERE id = ${id}
  `;
  return result[0] as Client || null;
}

export async function createClient(client: NewClient): Promise<Client> {
  const result = await sql`
    INSERT INTO clients (user_id, name, email, company, phone, address)
    VALUES (${client.user_id || null}, ${client.name}, ${client.email || null}, ${client.company || null}, ${client.phone || null}, ${client.address || null})
    RETURNING *
  `;
  return result[0] as Client;
}

export async function updateClient(id: number, client: Partial<NewClient>): Promise<Client | null> {
  const result = await sql`
    UPDATE clients
    SET
      name = COALESCE(${client.name || null}, name),
      email = COALESCE(${client.email || null}, email),
      company = COALESCE(${client.company || null}, company),
      phone = COALESCE(${client.phone || null}, phone),
      address = COALESCE(${client.address || null}, address),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Client || null;
}

export async function deleteClient(id: number): Promise<void> {
  await sql`
    DELETE FROM clients
    WHERE id = ${id}
  `;
}

// Quotation Queries
export async function getQuotations(userId?: string): Promise<Quotation[]> {
  if (userId) {
    const result = await sql`
      SELECT * FROM quotations
      WHERE user_id = ${userId}
      ORDER BY date DESC
    `;
    return result as Quotation[];
  }

  const result = await sql`
    SELECT * FROM quotations
    ORDER BY date DESC
  `;
  return result as Quotation[];
}

export async function getQuotationById(id: number): Promise<Quotation | null> {
  const result = await sql`
    SELECT * FROM quotations
    WHERE id = ${id}
  `;
  return result[0] as Quotation || null;
}

export async function getQuotationsByClientId(clientId: number): Promise<Quotation[]> {
  const result = await sql`
    SELECT * FROM quotations
    WHERE client_id = ${clientId}
    ORDER BY date DESC
  `;
  return result as Quotation[];
}

export async function createQuotation(quotation: NewQuotation): Promise<Quotation> {
  const result = await sql`
    INSERT INTO quotations (
      user_id, client_id, quotation_number, date, items,
      subtotal, tax, total, status, notes
    )
    VALUES (
      ${quotation.user_id || null},
      ${quotation.client_id},
      ${quotation.quotation_number},
      ${quotation.date},
      ${JSON.stringify(quotation.items)},
      ${quotation.subtotal},
      ${quotation.tax},
      ${quotation.total},
      ${quotation.status},
      ${quotation.notes || null}
    )
    RETURNING *
  `;
  return result[0] as Quotation;
}

export async function updateQuotation(id: number, quotation: Partial<NewQuotation>): Promise<Quotation | null> {
  // Get current quotation
  const current = await getQuotationById(id);
  if (!current) return null;

  // Merge with updates
  const updated = {
    client_id: quotation.client_id ?? current.client_id,
    quotation_number: quotation.quotation_number ?? current.quotation_number,
    date: quotation.date ?? current.date,
    items: quotation.items ?? current.items,
    subtotal: quotation.subtotal ?? current.subtotal,
    tax: quotation.tax ?? current.tax,
    total: quotation.total ?? current.total,
    status: quotation.status ?? current.status,
    notes: quotation.notes ?? current.notes,
  };

  const result = await sql`
    UPDATE quotations
    SET
      client_id = ${updated.client_id},
      quotation_number = ${updated.quotation_number},
      date = ${updated.date},
      items = ${JSON.stringify(updated.items)},
      subtotal = ${updated.subtotal},
      tax = ${updated.tax},
      total = ${updated.total},
      status = ${updated.status},
      notes = ${updated.notes},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Quotation || null;
}

export async function deleteQuotation(id: number): Promise<void> {
  await sql`
    DELETE FROM quotations
    WHERE id = ${id}
  `;
}

// Generate unique quotation number
export async function generateQuotationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await sql`
    SELECT quotation_number
    FROM quotations
    WHERE quotation_number LIKE ${`QT-${year}-%`}
    ORDER BY quotation_number DESC
    LIMIT 1
  `;

  if (result.length === 0) {
    return `QT-${year}-0001`;
  }

  const lastNumber = result[0].quotation_number;
  const match = lastNumber.match(/QT-\d{4}-(\d+)/);

  if (match) {
    const nextNumber = parseInt(match[1], 10) + 1;
    return `QT-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  return `QT-${year}-0001`;
}


// Company Info Queries
export async function getCompanyInfos(userId: string): Promise<CompanyInfoDB[]> {
  const result = await sql`
    SELECT 
      id, 
      user_id as "userId",
      name,
      registration_number as "registrationNumber",
      address,
      email,
      phone,
      is_default as "isDefault",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM company_info
    WHERE user_id = ${userId}
    ORDER BY is_default DESC, created_at DESC
  `;
  return result as CompanyInfoDB[];
}

export async function getCompanyInfoById(id: number, userId: string): Promise<CompanyInfoDB | null> {
  const result = await sql`
    SELECT 
      id, 
      user_id as "userId",
      name,
      registration_number as "registrationNumber",
      address,
      email,
      phone,
      is_default as "isDefault",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM company_info
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return result[0] as CompanyInfoDB || null;
}

export async function getDefaultCompanyInfo(userId: string): Promise<CompanyInfoDB | null> {
  const result = await sql`
    SELECT 
      id, 
      user_id as "userId",
      name,
      registration_number as "registrationNumber",
      address,
      email,
      phone,
      is_default as "isDefault",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM company_info
    WHERE user_id = ${userId} AND is_default = true
    LIMIT 1
  `;
  return result[0] as CompanyInfoDB || null;
}

export async function createCompanyInfo(companyInfo: NewCompanyInfo): Promise<CompanyInfoDB> {
  // If this is being set as default, unset any existing default
  if (companyInfo.isDefault) {
    await sql`
      UPDATE company_info
      SET is_default = false
      WHERE user_id = ${companyInfo.userId}
    `;
  }

  const result = await sql`
    INSERT INTO company_info (
      user_id, name, registration_number, address, email, phone, is_default
    )
    VALUES (
      ${companyInfo.userId},
      ${companyInfo.name},
      ${companyInfo.registrationNumber || null},
      ${companyInfo.address},
      ${companyInfo.email},
      ${companyInfo.phone},
      ${companyInfo.isDefault || false}
    )
    RETURNING 
      id, 
      user_id as "userId",
      name,
      registration_number as "registrationNumber",
      address,
      email,
      phone,
      is_default as "isDefault",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return result[0] as CompanyInfoDB;
}

export async function updateCompanyInfo(
  id: number, 
  userId: string,
  companyInfo: Partial<NewCompanyInfo>
): Promise<CompanyInfoDB | null> {
  // Get current company info
  const current = await getCompanyInfoById(id, userId);
  if (!current) return null;

  // If this is being set as default, unset any existing default
  if (companyInfo.isDefault) {
    await sql`
      UPDATE company_info
      SET is_default = false
      WHERE user_id = ${userId} AND id != ${id}
    `;
  }

  // Merge with updates
  const updated = {
    name: companyInfo.name ?? current.name,
    registrationNumber: companyInfo.registrationNumber ?? current.registrationNumber,
    address: companyInfo.address ?? current.address,
    email: companyInfo.email ?? current.email,
    phone: companyInfo.phone ?? current.phone,
    isDefault: companyInfo.isDefault ?? current.isDefault,
  };

  const result = await sql`
    UPDATE company_info
    SET
      name = ${updated.name},
      registration_number = ${updated.registrationNumber},
      address = ${updated.address},
      email = ${updated.email},
      phone = ${updated.phone},
      is_default = ${updated.isDefault},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING 
      id, 
      user_id as "userId",
      name,
      registration_number as "registrationNumber",
      address,
      email,
      phone,
      is_default as "isDefault",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return result[0] as CompanyInfoDB || null;
}

export async function deleteCompanyInfo(id: number, userId: string): Promise<void> {
  await sql`
    DELETE FROM company_info
    WHERE id = ${id} AND user_id = ${userId}
  `;
}
