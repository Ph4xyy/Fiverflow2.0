import React, { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getFileUrl, deleteFile } from "@/lib/storage";
import toast from "react-hot-toast";

type Props = {
  /** Path stocké en base, ex: "logos/<uid>/<uuid>.png" */
  path?: string | null;
  /** Callback pour mettre à jour le path en base */
  onChange: (path: string | null) => void;
  /** (optionnel) taille max en Mo */
  maxSizeMB?: number;
};

const LogoUploader: React.FC<Props> = ({ path, onChange, maxSizeMB = 5 }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  // Charge l’URL d’aperçu à partir du path (publicUrl ou signedUrl)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!path) {
        setPreviewUrl(null);
        return;
      }
      const url = await getFileUrl(path);
      if (alive) setPreviewUrl(url);
    })();
    return () => {
      alive = false;
    };
  }, [path]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    // Taille max
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Fichier trop lourd (max ${maxSizeMB} Mo).`);
      resetInput();
      return;
    }

    // Mode DEMO : pas de supabase configuré → data URL locale
    if (!isSupabaseConfigured || !supabase) {
      const local = URL.createObjectURL(file);
      setPreviewUrl(local);
      onChange(null); // pas de path en mode demo
      toast.success("Logo défini (demo)");
      resetInput();
      return;
    }

    try {
      setLoading(true);

      // Session requise
      const { data: s, error: se } = await supabase.auth.getSession();
      if (se) throw se;
      const session = s?.session;
      if (!session) {
        toast.error("Tu dois être connecté pour uploader un logo.");
        return;
      }

      // Construire un path unique et sûr
      const userId = session.user.id;
      const extFromType = file.type?.split("/").pop() || "png";
      const extFromName = file.name.includes(".") ? file.name.split(".").pop() : "";
      const ext = (extFromName || extFromType || "png")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "png";

      const unique =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const newPath = `logos/${userId}/${unique}.${ext}`;

      // Upload (pas d'upsert pour éviter policy UPDATE)
      const { error: uploadError } = await supabase.storage
        .from("invoice-assets")
        .upload(newPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      // Si un ancien logo existait, on peut le supprimer (optionnel)
      if (path) {
        try {
          await deleteFile(path);
        } catch (delErr) {
          // non bloquant : on log mais on ne casse pas le flow
          console.warn("[LogoUploader] delete previous file failed:", delErr);
        }
      }

      // Met à jour le path en base (parent) + met l’aperçu
      onChange(newPath);
      const url = await getFileUrl(newPath);
      setPreviewUrl(url);

      toast.success("Logo uploadé");
    } catch (err: any) {
      console.error("[LogoUploader]", err);
      const msg =
        err?.message?.includes("row-level security") || err?.message?.includes("RLS")
          ? "Accès refusé par les règles RLS du bucket. Vérifie tes policies Storage."
          : err?.message || "Upload impossible";
      toast.error(msg);
      // Reset preview on error
      setPreviewUrl(null);
    } finally {
      setLoading(false);
      resetInput();
    }
  };

  const onRemove = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // demo
      setPreviewUrl(null);
      onChange(null);
      return;
    }

    try {
      setLoading(true);
      if (path) {
        await deleteFile(path);
      }
      setPreviewUrl(null);
      onChange(null);
      toast.success("Logo supprimé");
    } catch (err: any) {
      console.error("[LogoUploader] delete", err);
      toast.error(err?.message || "Suppression impossible");
    } finally {
      setLoading(false);
      resetInput();
    }
  };

  return (
    <div>
      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Logo</div>

      {previewUrl ? (
        <div className="flex items-center gap-3">
          <img src={previewUrl} alt="logo" className="h-10 object-contain" />
          <button
            type="button"
            onClick={onRemove}
            className="px-2 py-1.5 rounded border border-gray-300 dark:border-slate-700 text-sm"
            disabled={loading}
          >
            Retirer
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={onFile}
          disabled={loading}
        />
      )}
    </div>
  );
};

export default LogoUploader;
