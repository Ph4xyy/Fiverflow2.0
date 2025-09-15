// src/pages/InvoicesLayout.tsx
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

const InvoicesLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTab = (p: string) => location.pathname === p;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
          <nav className="flex flex-wrap gap-4">
            {[
              { path: "/invoices", label: "Dashboard" },
              { path: "/invoices/sent", label: "Factures envoyées" },
              { path: "/invoices/create", label: "Envoyer une facture" },
              { path: "/invoices/templates", label: "Templates" },
            ].map((t) => (
              <button
                key={t.path}
                onClick={() => navigate(t.path)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  isTab(t.path)
                    ? "border-blue-600 text-blue-600 dark:border-accent-blue dark:text-accent-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <Outlet />
      </div>
    </Layout>
  );
};

export default InvoicesLayout;
