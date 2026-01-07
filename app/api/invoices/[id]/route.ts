import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update a specific invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build update data - only include fields that are provided
    const updateData: Record<string, unknown> = {};

    // Simple field updates
    const simpleFields = [
      "invoice_number",
      "po_number",
      "invoice_date",
      "due_date",
      "status",
      "project_title",
      "from_company_name",
      "from_company_registration",
      "from_company_address",
      "from_company_email",
      "from_company_phone",
      "from_company_logo_url",
      "company_info_id",
      "client_name",
      "client_company",
      "client_address",
      "client_email",
      "client_phone",
      "client_id",
      "items",
      "subtotal",
      "discount_value",
      "sst_rate",
      "sst_amount",
      "shipping",
      "total",
      "terms",
      "notes",
      "bank_name",
      "bank_account_number",
      "bank_account_name",
      "bank_info_id",
      "paid_date",
      "paid_amount",
      "payment_reference",
      "quotation_id",
    ];

    for (const field of simpleFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Ensure bank info is not removed
    if (
      updateData.bank_name === "" ||
      updateData.bank_account_number === "" ||
      updateData.bank_account_name === ""
    ) {
      return NextResponse.json(
        { error: "Bank information cannot be empty for invoices" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete a specific invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Invoice deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
