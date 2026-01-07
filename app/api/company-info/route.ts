import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/company-info - Get all company infos for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: companyInfos, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase
    const transformed = companyInfos?.map((info) => ({
      id: info.id,
      userId: info.user_id,
      name: info.name,
      registrationNumber: info.registration_number,
      address: info.address,
      email: info.email,
      phone: info.phone,
      isDefault: info.is_default,
      logoUrl: info.logo_url,
      createdAt: info.created_at,
      updatedAt: info.updated_at,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching company infos:", error);
    return NextResponse.json(
      { error: "Failed to fetch company infos" },
      { status: 500 }
    );
  }
}

// POST /api/company-info - Create a new company info
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
    const { name, registration_number, address, email, phone, is_default, logo_url } =
      body;

    if (!name || !address || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: name, address, email, phone" },
        { status: 400 }
      );
    }

    const { data: companyInfo, error } = await supabase
      .from("company_info")
      .insert({
        user_id: user.id,
        name,
        registration_number: registration_number || null,
        address,
        email,
        phone,
        is_default: is_default || false,
        logo_url: logo_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase
    const transformed = {
      id: companyInfo.id,
      userId: companyInfo.user_id,
      name: companyInfo.name,
      registrationNumber: companyInfo.registration_number,
      address: companyInfo.address,
      email: companyInfo.email,
      phone: companyInfo.phone,
      isDefault: companyInfo.is_default,
      logoUrl: companyInfo.logo_url,
      createdAt: companyInfo.created_at,
      updatedAt: companyInfo.updated_at,
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error("Error creating company info:", error);
    return NextResponse.json(
      { error: "Failed to create company info" },
      { status: 500 }
    );
  }
}
