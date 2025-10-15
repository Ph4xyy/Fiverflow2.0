/*
  # Admin Policies for Global Access
  
  1. Admin Policies
    - Add admin policies for all main tables to allow admins to view all data
    - Admins can access users, clients, orders, invoices, tasks, time_entries, etc.
    - Policies check if user role = 'admin' before granting access
  
  2. Tables Covered
    - users
    - clients  
    - orders
    - invoices
    - invoice_items
    - invoice_templates
    - invoice_payments
    - tasks
    - time_entries
    - referrals
    - referral_logs
    - subscriptions
    - user_payout_details
    - payout_requests
*/

-- Admin policy for users table
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for clients table
CREATE POLICY "Admins can view all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for orders table
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for invoices table
CREATE POLICY "Admins can view all invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for invoice_items table
CREATE POLICY "Admins can view all invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for invoice_templates table
CREATE POLICY "Admins can view all invoice templates"
  ON invoice_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for invoice_payments table
CREATE POLICY "Admins can view all invoice payments"
  ON invoice_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for tasks table
CREATE POLICY "Admins can view all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for time_entries table
CREATE POLICY "Admins can view all time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for referrals table
CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for subscriptions table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    EXECUTE 'CREATE POLICY "Admins can view all subscriptions"
      ON subscriptions
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role = ''admin''
        )
      )';
  END IF;
END $$;

-- Admin policy for referral_logs table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_logs') THEN
    EXECUTE 'CREATE POLICY "Admins can view all referral logs"
      ON referral_logs
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role = ''admin''
        )
      )';
  END IF;
END $$;

-- Admin policy for message_templates table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_templates') THEN
    EXECUTE 'CREATE POLICY "Admins can view all message templates"
      ON message_templates
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role = ''admin''
        )
      )';
  END IF;
END $$;

-- Create admin statistics function
CREATE OR REPLACE FUNCTION get_admin_stats(
  start_date timestamptz DEFAULT (NOW() - INTERVAL '30 days'),
  end_date timestamptz DEFAULT NOW()
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_admins', (SELECT COUNT(*) FROM users WHERE role = 'admin'),
    'new_users_period', (SELECT COUNT(*) FROM users WHERE created_at >= start_date AND created_at <= end_date),
    'total_clients', (SELECT COUNT(*) FROM clients),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'total_invoices', (SELECT COUNT(*) FROM invoices),
    'total_tasks', (SELECT COUNT(*) FROM tasks),
    'total_time_entries', (SELECT COUNT(*) FROM time_entries),
    'total_referrals', (SELECT COUNT(*) FROM referrals),
    'revenue_orders', COALESCE((SELECT SUM(amount) FROM orders), 0),
    'revenue_invoices', COALESCE((SELECT SUM(total) FROM invoices), 0),
    'free_users_period', (SELECT COUNT(*) FROM users WHERE created_at >= start_date AND created_at <= end_date AND is_pro = false),
    'pro_users_period', (SELECT COUNT(*) FROM users WHERE created_at >= start_date AND created_at <= end_date AND is_pro = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
