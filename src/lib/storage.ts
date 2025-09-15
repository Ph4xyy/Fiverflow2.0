// Utilitaires Storage (public/privé auto)
// - getFileUrl: retourne une URL affichable (publicUrl ou signedUrl)
// - deleteFile: supprime un fichier par path

import { supabase } from "@/lib/supabase";

export async function getFileUrl(
  path: string | null | undefined,
  expiresInSeconds = 60 * 60
): Promise<string | null> {
  if (!path) return null;

  // Tente publicUrl (bucket public)
  const { data: pub } = supabase.storage.from("invoice-assets").getPublicUrl(path);
  if (pub?.publicUrl) return pub.publicUrl;

  // Fallback: signed URL (bucket privé)
  const { data: signed, error } = await supabase.storage
    .from("invoice-assets")
    .createSignedUrl(path, expiresInSeconds);

  if (error || !signed?.signedUrl) return null;
  return signed.signedUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from("invoice-assets").remove([path]);
  if (error) throw error;
}
