// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

import { useState } from 'react';

export interface UserPermissions {
  role: string;
  plan: string;
  can_access_admin: boolean;
  can_create_invoices: boolean;
  can_create_templates: boolean;
  can_export_data: boolean;
  can_manage_clients: boolean;
  can_manage_tasks: boolean;
  max_invoices_per_month: number;
  max_clients: number;
}

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    permissions,
    loading,
    error,
    hasPlan: (requiredPlan: string) => true,
    canAccess: (permission: keyof UserPermissions) => true,
    getMaxLimit: (limitType: 'invoices' | 'clients') => 100
  };
};
