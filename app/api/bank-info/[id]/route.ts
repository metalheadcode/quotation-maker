import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/bank-info/[id] - Get a specific bank account
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

    const { data: bankAccount, error } = await supabase
      .from("bank_info")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Bank account not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank account" },
      { status: 500 }
    );
  }
}

// PUT /api/bank-info/[id] - Update a bank account
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
    const { bank_name, account_number, account_name, is_default } = body;

    const updateData: Record<string, unknown> = {};
    if (bank_name !== undefined) updateData.bank_name = bank_name;
    if (account_number !== undefined) updateData.account_number = account_number;
    if (account_name !== undefined) updateData.account_name = account_name;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data: updatedBankAccount, error } = await supabase
      .from("bank_info")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Bank account not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(updatedBankAccount);
  } catch (error) {
    console.error("Error updating bank account:", error);
    return NextResponse.json(
      { error: "Failed to update bank account" },
      { status: 500 }
    );
  }
}

// DELETE /api/bank-info/[id] - Delete a bank account
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
      .from("bank_info")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Bank account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json(
      { error: "Failed to delete bank account" },
      { status: 500 }
    );
  }
}
