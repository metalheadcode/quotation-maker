import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/invoices - Get all invoices for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      invoice_number,
      po_number,
      invoice_date,
      due_date,
      status,
      project_title,
      // From company snapshot
      from_company_name,
      from_company_registration,
      from_company_address,
      from_company_email,
      from_company_phone,
      from_company_logo_url,
      company_info_id,
      // To client snapshot
      client_name,
      client_company,
      client_address,
      client_email,
      client_phone,
      client_id,
      // Items and calculations
      items,
      subtotal,
      discount_value,
      sst_rate,
      sst_amount,
      shipping,
      total,
      // Additional
      terms,
      notes,
      // Bank info (required)
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_info_id,
      // Payment tracking
      paid_date,
      paid_amount,
      payment_reference,
      // Reference to quotation
      quotation_id,
    } = body;

    // Validate required bank info
    if (!bank_name || !bank_account_number || !bank_account_name) {
      return NextResponse.json(
        { error: "Bank information is required for invoices" },
        { status: 400 }
      );
    }

    const invoiceData = {
      user_id: user.id,
      invoice_number: invoice_number || `#INV${Date.now()}`,
      po_number: po_number || null,
      invoice_date: invoice_date || new Date().toISOString().split("T")[0],
      due_date:
        due_date ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      status: status || "draft",
      project_title,
      from_company_name,
      from_company_registration,
      from_company_address,
      from_company_email,
      from_company_phone,
      from_company_logo_url,
      company_info_id,
      client_name,
      client_company,
      client_address,
      client_email,
      client_phone,
      client_id,
      items: items || [],
      subtotal: subtotal || 0,
      discount_value: discount_value || 0,
      sst_rate: sst_rate || 0,
      sst_amount: sst_amount || 0,
      shipping: shipping || 0,
      total: total || 0,
      terms,
      notes,
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_info_id,
      paid_date: paid_date || null,
      paid_amount: paid_amount || null,
      payment_reference: payment_reference || null,
      quotation_id: quotation_id || null,
    };

    const { data, error } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
