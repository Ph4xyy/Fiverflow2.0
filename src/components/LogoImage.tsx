import React, { useEffect, useState, useRef } from "react";
import { getFileUrl } from "@/lib/storage";

type Props = {
  path?: string | null;
  alt?: string;
  className?: string;
  /** durée de validité pour l'URL signée (secondes) */
  ttl?: number;
};

const LogoImage: React.FC<Props> = ({ path, alt = "logo", className, ttl = 3600 }) => {
  const [url, setUrl] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    if (!path) {
      setUrl(null);
      return;
    }
    const u = await getFileUrl(path, ttl);
    setUrl(u);
  };

  useEffect(() => {
    load();

    // si URL signée, on la régénère ~5 min avant l'expiration
    if (timer.current) clearTimeout(timer.current);
    if (path) {
      const refreshInMs = Math.max((ttl - 300) * 1000, 30_000); // jamais < 30s
      timer.current = setTimeout(load, refreshInMs);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ttl]);

  // si l'URL signée a expiré pendant que l'image était affichée, on retente
  const onError = () => {
    load();
  };

  if (!url) return null;
  return <img src={url} alt={alt} className={className} onError={onError} />;
};

export default LogoImage;
