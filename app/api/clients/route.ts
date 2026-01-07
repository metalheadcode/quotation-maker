import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/clients - Get all clients for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase
    const transformed = clients?.map((client) => ({
      id: client.id,
      userId: client.user_id,
      name: client.name,
      registrationNumber: client.company,
      address: client.address,
      email: client.email,
      phone: client.phone,
      isFavorite: client.is_favorite,
      lastUsed: client.last_used_at,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
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
    const { name, company, address, email, phone, is_favorite } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        name,
        company: company || null,
        address: address || null,
        email: email || null,
        phone: phone || null,
        is_favorite: is_favorite || false,
        last_used_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase
    const transformed = {
      id: client.id,
      userId: client.user_id,
      name: client.name,
      registrationNumber: client.company,
      address: client.address,
      email: client.email,
      phone: client.phone,
      isFavorite: client.is_favorite,
      lastUsed: client.last_used_at,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
