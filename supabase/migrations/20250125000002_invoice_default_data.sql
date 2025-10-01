/*
  # Invoice System Default Data

  1. Default Invoice Templates
    - Create default templates for new users
    - Include basic and professional templates

  2. Sample Data (Optional)
    - Create sample invoices for testing
    - Only for development/demo purposes

  3. Functions
    - Helper functions for common operations
    - Utility functions for invoice management
*/

-- Insert default invoice templates
INSERT INTO invoice_templates (id, user_id, name, is_default, schema, variables)
VALUES 
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- System template (no real user)
    'Minimal',
    true,
    '{
      "style": {
        "primaryColor": "#2563eb",
        "secondaryColor": "#111827",
        "fontFamily": "helvetica",
        "logoUrl": null,
        "logoWidth": 120,
        "pageSize": "A4",
        "margin": 48,
        "tableStripe": true
      },
      "sections": {
        "header": {"visible": true, "label": "INVOICE"},
        "sellerInfo": {"visible": true},
        "clientInfo": {"visible": true, "label": "Billed to:"},
        "items": {"visible": true, "label": "Items"},
        "totals": {"visible": true},
        "notes": {"visible": true, "label": "Notes"},
        "footer": {"visible": true, "label": "Thank you for your business."}
      },
      "labels": {
        "invoiceTitle": "INVOICE",
        "invoiceNumber": "Invoice #",
        "issueDate": "Issue date",
        "dueDate": "Due date",
        "billedTo": "Billed to:",
        "items": "Items",
        "qty": "Qty",
        "unitPrice": "Unit",
        "lineTotal": "Total",
        "subtotal": "Subtotal",
        "discount": "Discount",
        "tax": "Tax",
        "total": "TOTAL",
        "notes": "Notes"
      },
      "variables": [
        "{{company.name}}",
        "{{company.logoUrl}}",
        "{{client.name}}",
        "{{invoice.number}}",
        "{{invoice.date}}",
        "{{invoice.due_date}}",
        "{{lineItems[i].description}}",
        "{{totals.subtotal}}",
        "{{totals.total}}"
      ]
    }'::jsonb,
    ARRAY[
      '{{company.name}}',
      '{{company.logoUrl}}',
      '{{client.name}}',
      '{{invoice.number}}',
      '{{invoice.date}}',
      '{{invoice.due_date}}',
      '{{lineItems[i].description}}',
      '{{totals.subtotal}}',
      '{{totals.total}}'
    ]
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- System template (no real user)
    'Professional',
    false,
    '{
      "style": {
        "primaryColor": "#1f2937",
        "secondaryColor": "#374151",
        "fontFamily": "times",
        "logoUrl": null,
        "logoWidth": 150,
        "pageSize": "A4",
        "margin": 40,
        "tableStripe": false
      },
      "sections": {
        "header": {"visible": true, "label": "INVOICE"},
        "sellerInfo": {"visible": true},
        "clientInfo": {"visible": true, "label": "Bill To:"},
        "items": {"visible": true, "label": "Description of Services"},
        "totals": {"visible": true},
        "notes": {"visible": true, "label": "Payment Terms"},
        "footer": {"visible": true, "label": "Thank you for your business. We appreciate your trust in our services."}
      },
      "labels": {
        "invoiceTitle": "INVOICE",
        "invoiceNumber": "Invoice Number:",
        "issueDate": "Date Issued:",
        "dueDate": "Payment Due:",
        "billedTo": "Bill To:",
        "items": "Description of Services",
        "qty": "Hours",
        "unitPrice": "Rate",
        "lineTotal": "Amount",
        "subtotal": "Subtotal",
        "discount": "Discount",
        "tax": "Tax",
        "total": "TOTAL AMOUNT DUE",
        "notes": "Payment Terms"
      },
      "variables": [
        "{{company.name}}",
        "{{company.logoUrl}}",
        "{{company.address}}",
        "{{company.phone}}",
        "{{company.email}}",
        "{{client.name}}",
        "{{client.address}}",
        "{{client.email}}",
        "{{invoice.number}}",
        "{{invoice.date}}",
        "{{invoice.due_date}}",
        "{{lineItems[i].description}}",
        "{{lineItems[i].quantity}}",
        "{{lineItems[i].unit_price}}",
        "{{lineItems[i].line_total}}",
        "{{totals.subtotal}}",
        "{{totals.discount}}",
        "{{totals.tax}}",
        "{{totals.total}}"
      ]
    }'::jsonb,
    ARRAY[
      '{{company.name}}',
      '{{company.logoUrl}}',
      '{{company.address}}',
      '{{company.phone}}',
      '{{company.email}}',
      '{{client.name}}',
      '{{client.address}}',
      '{{client.email}}',
      '{{invoice.number}}',
      '{{invoice.date}}',
      '{{invoice.due_date}}',
      '{{lineItems[i].description}}',
      '{{lineItems[i].quantity}}',
      '{{lineItems[i].unit_price}}',
      '{{lineItems[i].line_total}}',
      '{{totals.subtotal}}',
      '{{totals.discount}}',
      '{{totals.tax}}',
      '{{totals.total}}'
    ]
  )
ON CONFLICT DO NOTHING;

-- Create function to get default template for a user
CREATE OR REPLACE FUNCTION get_default_invoice_template(user_id UUID)
RETURNS UUID AS $$
DECLARE
  template_id UUID;
BEGIN
  -- First, try to get user's own default template
  SELECT id INTO template_id
  FROM invoice_templates
  WHERE invoice_templates.user_id = get_default_invoice_template.user_id
    AND is_default = TRUE
  LIMIT 1;

  -- If no user template found, get the system default
  IF template_id IS NULL THEN
    SELECT id INTO template_id
    FROM invoice_templates
    WHERE invoice_templates.user_id = '00000000-0000-0000-0000-000000000000'
      AND is_default = TRUE
    LIMIT 1;
  END IF;

  RETURN template_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to create a new invoice with auto-generated number
CREATE OR REPLACE FUNCTION create_invoice_with_number(
  p_user_id UUID,
  p_client_id UUID,
  p_issue_date DATE,
  p_due_date DATE,
  p_currency TEXT DEFAULT 'USD',
  p_notes TEXT DEFAULT NULL,
  p_terms TEXT DEFAULT NULL,
  p_template_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  invoice_id UUID;
  invoice_number TEXT;
  default_template_id UUID;
BEGIN
  -- Generate invoice number
  invoice_number := generate_invoice_number(p_user_id);
  
  -- Get default template if none provided
  IF p_template_id IS NULL THEN
    default_template_id := get_default_invoice_template(p_user_id);
  ELSE
    default_template_id := p_template_id;
  END IF;

  -- Create invoice
  INSERT INTO invoices (
    user_id,
    number,
    client_id,
    issue_date,
    due_date,
    currency,
    notes,
    terms,
    template_id
  )
  VALUES (
    p_user_id,
    invoice_number,
    p_client_id,
    p_issue_date,
    p_due_date,
    p_currency,
    p_notes,
    p_terms,
    default_template_id
  )
  RETURNING id INTO invoice_id;

  RETURN invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to add item to invoice
CREATE OR REPLACE FUNCTION add_invoice_item(
  p_invoice_id UUID,
  p_description TEXT,
  p_quantity DECIMAL(10,2) DEFAULT 1,
  p_unit_price DECIMAL(10,2) DEFAULT 0,
  p_position INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  item_id UUID;
  next_position INTEGER;
  line_total DECIMAL(10,2);
BEGIN
  -- Calculate line total
  line_total := p_quantity * p_unit_price;
  
  -- Get next position if not provided
  IF p_position IS NULL THEN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO next_position
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;
  ELSE
    next_position := p_position;
  END IF;

  -- Insert item
  INSERT INTO invoice_items (
    invoice_id,
    description,
    quantity,
    unit_price,
    line_total,
    position
  )
  VALUES (
    p_invoice_id,
    p_description,
    p_quantity,
    p_unit_price,
    line_total,
    next_position
  )
  RETURNING id INTO item_id;

  RETURN item_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get invoice with all related data
CREATE OR REPLACE FUNCTION get_invoice_full(p_invoice_id UUID, p_user_id UUID)
RETURNS TABLE (
  invoice_id UUID,
  invoice_number TEXT,
  client_id UUID,
  client_name TEXT,
  client_platform TEXT,
  status invoice_status,
  currency TEXT,
  issue_date DATE,
  due_date DATE,
  subtotal DECIMAL(10,2),
  tax_rate DECIMAL(5,2),
  discount DECIMAL(10,2),
  total DECIMAL(10,2),
  notes TEXT,
  terms TEXT,
  tags TEXT[],
  template_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  items JSONB,
  payments JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as invoice_id,
    i.number as invoice_number,
    i.client_id,
    c.name as client_name,
    c.platform as client_platform,
    i.status,
    i.currency,
    i.issue_date,
    i.due_date,
    i.subtotal,
    i.tax_rate,
    i.discount,
    i.total,
    i.notes,
    i.terms,
    i.tags,
    i.template_id,
    i.created_at,
    i.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ii.id,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'line_total', ii.line_total,
            'position', ii.position
          )
          ORDER BY ii.position
        )
        FROM invoice_items ii
        WHERE ii.invoice_id = i.id
      ),
      '[]'::jsonb
    ) as items,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ip.id,
            'amount', ip.amount,
            'payment_date', ip.payment_date,
            'payment_method', ip.payment_method,
            'reference', ip.reference,
            'notes', ip.notes
          )
          ORDER BY ip.payment_date DESC
        )
        FROM invoice_payments ip
        WHERE ip.invoice_id = i.id
      ),
      '[]'::jsonb
    ) as payments
  FROM invoices i
  JOIN clients c ON i.client_id = c.id
  WHERE i.id = p_invoice_id
    AND i.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark invoice as paid
CREATE OR REPLACE FUNCTION mark_invoice_paid(
  p_invoice_id UUID,
  p_user_id UUID,
  p_payment_amount DECIMAL(10,2),
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_payment_method TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  invoice_exists BOOLEAN;
  current_total DECIMAL(10,2);
  paid_amount DECIMAL(10,2);
BEGIN
  -- Check if invoice exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM invoices 
    WHERE id = p_invoice_id AND user_id = p_user_id
  ) INTO invoice_exists;

  IF NOT invoice_exists THEN
    RETURN FALSE;
  END IF;

  -- Get current total
  SELECT total INTO current_total
  FROM invoices
  WHERE id = p_invoice_id;

  -- Get current paid amount
  SELECT COALESCE(SUM(amount), 0) INTO paid_amount
  FROM invoice_payments
  WHERE invoice_id = p_invoice_id;

  -- Add payment record
  INSERT INTO invoice_payments (
    invoice_id,
    amount,
    payment_date,
    payment_method,
    reference,
    notes
  )
  VALUES (
    p_invoice_id,
    p_payment_amount,
    p_payment_date,
    p_payment_method,
    p_reference,
    p_notes
  );

  -- Update invoice status if fully paid
  IF (paid_amount + p_payment_amount) >= current_total THEN
    UPDATE invoices
    SET status = 'paid', updated_at = NOW()
    WHERE id = p_invoice_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check for overdue invoices
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
  overdue_count INTEGER;
BEGIN
  -- Update overdue invoices
  UPDATE invoices
  SET status = 'overdue', updated_at = NOW()
  WHERE status IN ('draft', 'sent')
    AND due_date < CURRENT_DATE;

  -- Count overdue invoices
  SELECT COUNT(*) INTO overdue_count
  FROM invoices
  WHERE status = 'overdue';

  RETURN overdue_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_default_invoice_template(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invoice_with_number(UUID, UUID, DATE, DATE, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_invoice_item(UUID, TEXT, DECIMAL, DECIMAL, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_invoice_full(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_invoice_paid(UUID, UUID, DECIMAL, DATE, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_overdue_invoices() TO authenticated;




