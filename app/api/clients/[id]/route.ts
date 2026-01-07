import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/clients/[id] - Get a specific client
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

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }
      throw error;
    }

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

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
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
    const { name, company, address, email, phone, is_favorite, last_used_at } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
    if (last_used_at !== undefined) updateData.last_used_at = last_used_at;

    const { data: updatedClient, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Transform snake_case to camelCase
    const transformed = {
      id: updatedClient.id,
      userId: updatedClient.user_id,
      name: updatedClient.name,
      registrationNumber: updatedClient.company,
      address: updatedClient.address,
      email: updatedClient.email,
      phone: updatedClient.phone,
      isFavorite: updatedClient.is_favorite,
      lastUsed: updatedClient.last_used_at,
      createdAt: updatedClient.created_at,
      updatedAt: updatedClient.updated_at,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
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
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Client deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
