// src/types/subscription.ts
export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'one_time';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  provider?: string | null;
  category?: string | null;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_renewal_date: string; // ISO date (yyyy-mm-dd)
  is_active: boolean;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubscriptionData {
  name: string;
  description?: string;
  provider?: string;
  category?: string;
  amount: number;
  currency?: string;
  billing_cycle: BillingCycle;
  next_renewal_date: string;
  color?: string;
}

export interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {
  is_active?: boolean;
}

// For calendar display
export interface SubscriptionEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    kind: 'subscription';
    subscription: Subscription;
    style: {
      bar: string;
      chipBg: string;
      text: string;
    };
  };
}

// For upcoming events
export interface SubscriptionUpcomingItem {
  kind: 'subscription';
  date: string;
  title: string;
  colorBar: string;
  subtitle: string | null;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
}

