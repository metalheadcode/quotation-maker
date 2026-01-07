import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/bank-info - Get all bank accounts for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bankAccounts, error } = await supabase
      .from("bank_info")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(bankAccounts);
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}

// POST /api/bank-info - Create a new bank account
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
    const { bank_name, account_number, account_name, is_default } = body;

    if (!bank_name || !account_number || !account_name) {
      return NextResponse.json(
        { error: "Missing required fields: bank_name, account_number, account_name" },
        { status: 400 }
      );
    }

    const { data: bankAccount, error } = await supabase
      .from("bank_info")
      .insert({
        user_id: user.id,
        bank_name,
        account_number,
        account_name,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(bankAccount, { status: 201 });
  } catch (error) {
    console.error("Error creating bank account:", error);
    return NextResponse.json(
      { error: "Failed to create bank account" },
      { status: 500 }
    );
  }
}
