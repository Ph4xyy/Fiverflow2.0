/*
  # Add Cron Job for Notification Scheduler

  1. Cron Configuration
    - Creates a cron job that runs every 4 hours
    - Calls the notification-scheduler Edge Function
    - Uses pg_cron extension for scheduling

  2. Schedule Details
    - Runs at: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC
    - Function: notification-scheduler
    - Purpose: Check for overdue tasks and pending invoices
*/

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the notification scheduler to run every 4 hours
-- This will run at 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC daily
SELECT cron.schedule(
  'notification-scheduler',           -- job name
  '0 */4 * * *',                     -- cron expression (every 4 hours)
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/notification-scheduler',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'scheduled', true,
        'timestamp', now()
      )
    ) as request_id;
  $$
);

-- Create a function to manually trigger the notification scheduler (for testing)
CREATE OR REPLACE FUNCTION trigger_notification_scheduler()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/notification-scheduler',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'manual_trigger', true,
        'timestamp', now()
      )
    ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users for manual testing
GRANT EXECUTE ON FUNCTION trigger_notification_scheduler() TO authenticated;