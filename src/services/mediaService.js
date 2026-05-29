import { requireSupabase } from "../lib/supabaseClient.js";
import { uploadToCloudinary } from "../lib/cloudinaryClient.js";

const TABLE = "media_files";

async function getCurrentUserId(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id || null;
}

export async function uploadAndStoreMedia(file, metadata) {
  const upload = await uploadToCloudinary(file, metadata);
  const supabase = requireSupabase();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    throw new Error("You must be signed in before uploading media.");
  }
  const payload = {
    module: metadata.module,
    related_record_id: metadata.relatedRecordId || null,
    project_id: metadata.projectId || null,
    public_id: upload.public_id,
    secure_url: upload.secure_url,
    resource_type: upload.resource_type,
    folder: upload.folder || metadata.folder || null,
    caption: metadata.caption || null,
    metadata: {
      bytes: upload.bytes,
      format: upload.format,
      width: upload.width,
      height: upload.height,
      originalName: file.name
    },
    uploaded_by: userId
  };
  const { data, error } = await supabase.from(TABLE).insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function listMedia(moduleName, recordId) {
  const supabase = requireSupabase();
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false }).limit(100);
  if (moduleName) query = query.eq("module", moduleName);
  if (recordId) query = query.eq("related_record_id", recordId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
