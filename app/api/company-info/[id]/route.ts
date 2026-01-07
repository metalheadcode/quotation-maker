import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFile, extractPathFromUrl } from "@/lib/supabase/storage";

// GET /api/company-info/[id] - Get a specific company info
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

    const { data: companyInfo, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company info not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Failed to fetch company info" },
      { status: 500 }
    );
  }
}

// PUT /api/company-info/[id] - Update a company info
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
    const { name, registration_number, address, email, phone, is_default, logo_url } =
      body;

    const { data: updatedCompanyInfo, error } = await supabase
      .from("company_info")
      .update({
        name,
        registration_number,
        address,
        email,
        phone,
        is_default,
        logo_url,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company info not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(updatedCompanyInfo);
  } catch (error) {
    console.error("Error updating company info:", error);
    return NextResponse.json(
      { error: "Failed to update company info" },
      { status: 500 }
    );
  }
}

// DELETE /api/company-info/[id] - Delete a company info
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

    // First, get the company info to check if it has a logo
    const { data: companyInfo } = await supabase
      .from("company_info")
      .select("logo_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    // Delete logo from storage if exists
    if (companyInfo?.logo_url) {
      const logoPath = extractPathFromUrl(companyInfo.logo_url, "company-logos");
      if (logoPath) {
        await deleteFile("company-logos", logoPath);
      }
    }

    // Delete the company info record
    const { error } = await supabase
      .from("company_info")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Company info deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting company info:", error);
    return NextResponse.json(
      { error: "Failed to delete company info" },
      { status: 500 }
    );
  }
}
