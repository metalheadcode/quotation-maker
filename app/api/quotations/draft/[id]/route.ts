import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/quotations/draft/[id] - Get a specific draft
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

    const { data: draft, error } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "draft")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Draft not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

// DELETE /api/quotations/draft/[id] - Delete a specific draft
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
      .from("quotations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "draft");

    if (error) throw error;

    return NextResponse.json(
      { message: "Draft deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
