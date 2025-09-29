-- Extend order_status enum with additional statuses used by the app
-- Safe to run multiple times thanks to IF NOT EXISTS

DO $$ BEGIN
  BEGIN
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'On Hold';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Cancelled';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Awaiting Payment';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'In Review';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


