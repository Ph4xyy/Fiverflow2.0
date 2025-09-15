/*
  # Enhance orders table with additional fields

  1. New Fields
    - `description` (text) - Detailed project description
    - `project_type` (text) - Type of project/service
    - `priority_level` (text) - Priority level (low, medium, high)
    - `estimated_hours` (integer) - Estimated work hours
    - `hourly_rate` (numeric) - Rate per hour
    - `payment_status` (text) - Payment tracking
    - `notes` (text) - Additional notes
    - `attachments` (text[]) - File attachments URLs
    - `tags` (text[]) - Project tags
    - `start_date` (date) - Project start date
    - `completion_date` (date) - Actual completion date
    - `revision_count` (integer) - Number of revisions
    - `client_feedback` (text) - Client feedback/comments

  2. Indexes
    - Add indexes for better query performance

  3. Constraints
    - Add check constraints for data validation
*/

-- Add new columns to orders table
DO $$
BEGIN
  -- Description field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'description'
  ) THEN
    ALTER TABLE orders ADD COLUMN description text;
  END IF;

  -- Project type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'project_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN project_type text;
  END IF;

  -- Priority level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'priority_level'
  ) THEN
    ALTER TABLE orders ADD COLUMN priority_level text DEFAULT 'medium';
  END IF;

  -- Estimated hours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'estimated_hours'
  ) THEN
    ALTER TABLE orders ADD COLUMN estimated_hours integer;
  END IF;

  -- Hourly rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE orders ADD COLUMN hourly_rate numeric(10,2);
  END IF;

  -- Payment status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  -- Notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN notes text;
  END IF;

  -- Attachments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE orders ADD COLUMN attachments text[];
  END IF;

  -- Tags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tags'
  ) THEN
    ALTER TABLE orders ADD COLUMN tags text[];
  END IF;

  -- Start date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN start_date date;
  END IF;

  -- Completion date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'completion_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN completion_date date;
  END IF;

  -- Revision count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'revision_count'
  ) THEN
    ALTER TABLE orders ADD COLUMN revision_count integer DEFAULT 0;
  END IF;

  -- Client feedback
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'client_feedback'
  ) THEN
    ALTER TABLE orders ADD COLUMN client_feedback text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_project_type ON orders(project_type);
CREATE INDEX IF NOT EXISTS idx_orders_priority_level ON orders(priority_level);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_start_date ON orders(start_date);
CREATE INDEX IF NOT EXISTS idx_orders_completion_date ON orders(completion_date);

-- Add check constraints
DO $$
BEGIN
  -- Priority level constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_priority_level_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_priority_level_check 
    CHECK (priority_level IN ('low', 'medium', 'high'));
  END IF;

  -- Payment status constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue'));
  END IF;

  -- Estimated hours constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_estimated_hours_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_estimated_hours_check 
    CHECK (estimated_hours > 0);
  END IF;

  -- Hourly rate constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_hourly_rate_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_hourly_rate_check 
    CHECK (hourly_rate > 0);
  END IF;

  -- Revision count constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_revision_count_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_revision_count_check 
    CHECK (revision_count >= 0);
  END IF;
END $$;