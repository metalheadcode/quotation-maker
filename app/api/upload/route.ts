import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateImageFile,
  generateFilePath,
  uploadFile,
} from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "company-logos";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }

    // Generate unique path
    const path = generateFilePath(user.id, file.name);

    // Upload file using the server client
    const { data, error } = await uploadFile(bucket, path, file, supabase);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data?.url,
      path: data?.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
