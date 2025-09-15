// src/components/LogoDisplayPrivate.tsx
import React, { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Props = {
  /** ex: "logos/<uid>/<uuid>.png" (valeur stockée en DB) */
  path?: string | null;
  alt?: string;
  className?: string;
  /** durée de validité de l'URL signée (secondes) */
  ttl?: number;
};

const LogoDisplayPrivate: React.FC<Props> = ({ path, alt = "Logo", className, ttl = 3600 }) => {
  const [url, setUrl] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const load = async () => {
    if (!alive.current) return;

    // Pas de path → rien à afficher
    if (!path) {
      setUrl(null);
      return;
    }

    // Supabase non configuré → ne tente pas l’appel (évite crash)
    if (!isSupabaseConfigured || !supabase) {
      setUrl(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .storage
        .from("invoice-assets")
        .createSignedUrl(path, ttl);

      if (error || !data?.signedUrl) {
        setUrl(null);
        return;
      }

      // Cache-buster pour éviter de voir l’ancien fichier après remplacement
      const cb = Date.now();
      const signed = data.signedUrl + (data.signedUrl.includes("?") ? "&" : "?") + `cb=${cb}`;
      if (alive.current) setUrl(signed);
    } catch (e) {
      console.warn("[LogoDisplayPrivate] createSignedUrl failed:", e);
      if (alive.current) setUrl(null);
    }
  };

  useEffect(() => {
    alive.current = true;
    load();

    // Régénère ~5min avant expiration
    if (timer.current) clearTimeout(timer.current);
    if (path) {
      const refreshInMs = Math.max((ttl - 300) * 1000, 30_000);
      timer.current = setTimeout(load, refreshInMs);
    }

    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ttl]);

  const handleError = () => load();

  if (!url) return null;
  return <img src={url} alt={alt} className={className} onError={handleError} />;
};

export default LogoDisplayPrivate;
