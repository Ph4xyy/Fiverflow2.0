// src/pages/InvoicesLayout.tsx
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const InvoicesLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTab = (p: string) => location.pathname === p;

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default InvoicesLayout;
