import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  content: string;
  relatedId?: string;
}

/**
 * Create a new notification for a user
 */
export const createNotification = async ({
  userId,
  type,
  content,
  relatedId
}: CreateNotificationParams) => {
  console.log('🔔 Creating notification:', { userId, type, content });
  
  // If Supabase is not configured, just log the notification
  if (!isSupabaseConfigured || !supabase) {
    console.log('🎭 Mock: notification created', { type, content });
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        content,
        related_id: relatedId || null,
        is_read: false
      });

    if (error) {
      console.error('❌ Error creating notification:', error);
      return { error };
    }

    console.log('✅ Notification created successfully');
    return { error: null };
  } catch (error) {
    console.error('💥 Unexpected error creating notification:', error);
    return { error };
  }
};

/**
 * Create notifications for common events
 */
export const NotificationHelpers = {
  // Order-related notifications
  orderCreated: (userId: string, orderTitle: string, clientName: string, orderId: string) =>
    createNotification({
      userId,
      type: 'order_update',
      content: `New order created: "${orderTitle}" for ${clientName}`,
      relatedId: orderId
    }),

  orderCompleted: (userId: string, orderTitle: string, clientName: string, orderId: string) =>
    createNotification({
      userId,
      type: 'order_completed',
      content: `Order completed: "${orderTitle}" for ${clientName}`,
      relatedId: orderId
    }),

  deadlineApproaching: (userId: string, orderTitle: string, daysLeft: number, orderId: string) =>
    createNotification({
      userId,
      type: 'task_due',
      content: `Deadline approaching: "${orderTitle}" is due in ${daysLeft} day(s)`,
      relatedId: orderId
    }),

  // Client-related notifications
  newClient: (userId: string, clientName: string, platform: string, clientId: string) =>
    createNotification({
      userId,
      type: 'new_client',
      content: `New client added: ${clientName} from ${platform}`,
      relatedId: clientId
    }),

  // Payment-related notifications
  paymentPending: (userId: string, amount: number, clientName: string, orderId: string) =>
    createNotification({
      userId,
      type: 'invoice_pending',
      content: `Payment of $${amount} is pending from ${clientName}`,
      relatedId: orderId
    }),

  paymentReceived: (userId: string, amount: number, clientName: string, orderId: string) =>
    createNotification({
      userId,
      type: 'payment_received',
      content: `Payment of $${amount} received from ${clientName}`,
      relatedId: orderId
    }),

  // System notifications
  systemAlert: (userId: string, message: string) =>
    createNotification({
      userId,
      type: 'system_alert',
      content: message
    }),

  // Referral notifications
  newReferral: (userId: string, referredUserEmail: string) =>
    createNotification({
      userId,
      type: 'referral_success',
      content: `New referral: ${referredUserEmail} joined using your referral link`,
    }),

  referralCommission: (userId: string, amount: number, referredUserEmail: string) =>
    createNotification({
      userId,
      type: 'referral_commission',
      content: `You earned $${amount.toFixed(2)} commission from ${referredUserEmail}'s subscription`,
    })
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured || !supabase) {
    return 3; // Mock count
  }

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }
};