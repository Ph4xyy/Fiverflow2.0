// src/hooks/useSmtpSettings.ts
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  enabled?: boolean;
};

export function useSmtpSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SmtpSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("user_smtp_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) setSettings(data as SmtpSettings);
      setLoading(false);
    };
    fetchSettings();
  }, [user?.id]); // 🔥 FIXED: Only depend on user.id to prevent infinite loops

  const save = async (newSettings: SmtpSettings) => {
    if (!user || !supabase) return;
    const { error } = await supabase
      .from("user_smtp_settings")
      .upsert({
        user_id: user.id,
        ...newSettings,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
    setSettings(newSettings);
  };

  return { settings, save, loading };
}
