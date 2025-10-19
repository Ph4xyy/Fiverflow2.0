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
      <Outlet />
    </Layout>
  );
};

export default InvoicesLayout;
