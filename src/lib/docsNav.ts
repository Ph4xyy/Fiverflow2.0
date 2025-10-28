export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const docsNav: NavSection[] = [
  {
    label: "Start with FiverFlow",
    items: [
      { label: "Welcome", href: "/docs" },
      { label: "Create your account", href: "/docs/create-account" },
      { label: "Set up your profile", href: "/docs/setup-profile" },
      { label: "Language preferences", href: "/docs/language" },
      { label: "Connect your wallet", href: "/docs/wallet" },
      { label: "Dashboard overview", href: "/docs/dashboard" }
    ]
  },
  {
    label: "Projects",
    items: [
      { label: "Create a project", href: "/docs/projects/create" },
      { label: "Collaborate with clients", href: "/docs/projects/collaborate" },
      { label: "Manage your tasks", href: "/docs/projects/tasks" }
    ]
  },
  {
    label: "Client",
    items: [
      { label: "Add your first clients", href: "/docs/clients/add" },
      { label: "Manage client profiles", href: "/docs/clients/manage" }
    ]
  },
  {
    label: "Tasks",
    items: [
      { label: "Communication and invoicing", href: "/docs/tasks/communication" },
      { label: "Create / assign / track tasks", href: "/docs/tasks/create" },
      { label: "Task deadlines & reminders", href: "/docs/tasks/deadlines" }
    ]
  },
  {
    label: "Calendar",
    items: [
      { label: "Sync with Google Calendar", href: "/docs/calendar/sync" },
      { label: "Manage events and deadlines", href: "/docs/calendar/manage" }
    ]
  },
  {
    label: "Analytics",
    items: [
      { label: "View performance", href: "/docs/analytics/performance" },
      { label: "Time tracking", href: "/docs/analytics/tracking" },
      { label: "Reports & insights", href: "/docs/analytics/reports" }
    ]
  },
  {
    label: "Settings & Preferences",
    items: [
      { label: "Account settings", href: "/docs/settings/account" },
      { label: "Subscription & billing", href: "/docs/settings/billing" }
    ]
  },
  {
    label: "Marketing & Growth",
    items: [
      { label: "Giveaways & events", href: "/docs/marketing/giveaways" },
      { label: "Partnership opportunities", href: "/docs/marketing/partnerships" },
      { label: "Promoting FiverFlow on Discord", href: "/docs/marketing/discord" },
      { label: "Affiliate & referral program", href: "/docs/marketing/referrals" }
    ]
  }
];
