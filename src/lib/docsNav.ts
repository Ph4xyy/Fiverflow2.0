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
      { label: "Set up your profile", href: "/docs/setup-profile" }
    ]
  },
  {
    label: "Projects",
    items: [
      { label: "Create a project", href: "/docs/projects/create" },
      { label: "Collaborate with clients", href: "/docs/projects/collaborate" }
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
      { label: "Create / assign / track tasks", href: "/docs/tasks/create" }
    ]
  }
];
