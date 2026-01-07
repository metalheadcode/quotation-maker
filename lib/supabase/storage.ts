import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./client";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): UploadError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      message: "Invalid file type. Allowed: JPG, PNG, WebP, SVG",
      code: "INVALID_TYPE",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      message: "File too large. Maximum size is 5MB",
      code: "FILE_TOO_LARGE",
    };
  }

  return null;
}

/**
 * Generate a unique file path for uploads
 */
export function generateFilePath(
  userId: string,
  fileName: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = prefix
    ? `${prefix}/${userId}/${timestamp}-${sanitizedName}`
    : `${userId}/${timestamp}-${sanitizedName}`;
  return path;
}

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file to upload
 * @param supabaseClient - Optional Supabase client (uses browser client if not provided)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  supabaseClient?: SupabaseClient
): Promise<{ data: UploadResult | null; error: UploadError | null }> {
  const supabase = supabaseClient || createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.name,
      },
    };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    data: {
      url: publicUrl,
      path: data.path,
    },
    error: null,
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: UploadError | null }> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    return {
      error: {
        message: error.message,
        code: error.name,
      },
    };
  }

  return { error: null };
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * Extract the file path from a Supabase Storage URL
 */
export function extractPathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(
      new RegExp(`/storage/v1/object/public/${bucket}/(.+)`)
    );
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}
