export interface Feature {
  key: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    key: "tasks",
    title: "Task Prioritization",
    description: "Stay focused on what matters now. Auto-sort urgent work and deadlines so nothing slips."
  },
  {
    key: "clients",
    title: "Client Management",
    description: "Centralize clients, messages, deliverables, and payment status in one clean view."
  },
  {
    key: "orders",
    title: "Orders",
    description: "Track every order from first contact to final delivery. Never lose context again."
  },
  {
    key: "invoices",
    title: "Invoices",
    description: "Generate professional invoices instantly and keep a record of what's paid and what's overdue."
  },
  {
    key: "calendar",
    title: "Calendar",
    description: "All deadlines and calls synced. See your week without jumping between apps."
  },
  {
    key: "stats",
    title: "Statistics",
    description: "See revenue, delivery time, repeat clients, and growth. Know exactly what's working."
  }
];

export interface Benefit {
  icon: string;
  title: string;
  text: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: "CheckCircle2",
    title: "Smart Task Flow",
    text: "Stop juggling sticky notes. Structure your workflow with clarity and let priorities guide you."
  },
  {
    icon: "Users",
    title: "Connected Clients",
    text: "See conversations, files, requirements, approvals — all tied to the correct client automatically."
  },
  {
    icon: "Receipt",
    title: "Effortless Billing",
    text: "Quote, invoice, and track payments without opening Excel or chasing screenshots."
  },
  {
    icon: "Calendar",
    title: "Unified Calendar",
    text: "Your calls, deliveries, and milestones line up in one timeline so you never miss a commitment."
  },
  {
    icon: "BarChart3",
    title: "Growth Insights",
    text: "See revenue trends, delivery time, and repeat clients to understand what's scaling."
  },
  {
    icon: "Sparkles",
    title: "Built-In Referrals",
    text: "Reward word-of-mouth. Let happy clients bring you the next one automatically."
  }
];

