export type TemplateSectionKey =
  | "header"
  | "sellerInfo"
  | "clientInfo"
  | "items"
  | "totals"
  | "notes"
  | "footer";

export type TemplateStyle = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string | null; // storage path or direct URL
  logoPath?: string | null; // optional explicit storage path
  logoWidth?: number; // px
  pageSize?: "A4" | "LETTER";
  margin?: number; // px
  tableStripe?: boolean;
  tableStripeColor?: string; // hex color for table stripes
  tableStripeOpacity?: number; // 0-100 opacity percentage
  // Typography controls
  titleSize?: number; // pt
  bodySize?: number; // pt
  tableHeaderSize?: number; // pt
};

export type TemplateSchema = {
  style: TemplateStyle;
  sections: Partial<Record<TemplateSectionKey, { visible: boolean; label?: string }>>;
  labels?: {
    invoiceTitle?: string;
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
    billedTo?: string;
    items?: string;
    qty?: string;
    unitPrice?: string;
    lineTotal?: string;
    subtotal?: string;
    discount?: string;
    tax?: string;
    total?: string;
    notes?: string;
    footer?: string;
  };
  // placeholders disponibles (info)
  variables?: string[];
};

export type InvoiceTemplate = {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  schema: TemplateSchema;
  variables: string[];
  created_at: string;
  updated_at: string;
};
