import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/quotations/draft - Get all draft quotations for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: drafts, error } = await supabase
      .from("quotations")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST /api/quotations/draft - Create or update a draft quotation
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
      id, // Optional: if provided, update existing draft
      quotation_number,
      date,
      valid_until,
      project_title,
      // From company snapshot
      from_company_name,
      from_company_registration,
      from_company_address,
      from_company_email,
      from_company_phone,
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
      discount_type,
      discount_value,
      discount_amount,
      tax_rate,
      tax_amount,
      shipping,
      total,
      // Additional
      terms,
      notes,
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_info_id,
    } = body;

    const draftData = {
      user_id: user.id,
      quotation_number: quotation_number || `DRAFT-${Date.now()}`,
      date: date || new Date().toISOString().split("T")[0],
      valid_until: valid_until || null, // Convert empty string to null for date field
      project_title,
      from_company_name,
      from_company_registration,
      from_company_address,
      from_company_email,
      from_company_phone,
      company_info_id,
      client_name,
      client_company,
      client_address,
      client_email,
      client_phone,
      client_id,
      items: items || [],
      subtotal: subtotal || 0,
      discount_type,
      discount_value,
      discount_amount,
      tax_rate,
      tax_amount,
      shipping: shipping || 0,
      total: total || 0,
      terms,
      notes,
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_info_id,
      status: "draft",
    };

    let result;

    if (id) {
      // Update existing draft
      const { data, error } = await supabase
        .from("quotations")
        .update(draftData)
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("status", "draft")
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from("quotations")
        .insert(draftData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result, { status: id ? 200 : 201 });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
