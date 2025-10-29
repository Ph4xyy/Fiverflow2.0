export interface DocsSection {
  heading: string;
  body: string[];
  callout?: {
    style: string;
    text: string;
  };
}

export const welcomePageContent: DocsSection[] = [
  {
    heading: "Welcome to FiverFlow",
    body: [
      "Pro Tip: Spend a few minutes exploring each section — learning the layout early makes you much faster later.",
      "Use the left navigation to jump between setup, clients, tasks, billing, calendar sync, analytics, and growth tools."
    ],
    callout: {
      style: "rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm p-4 font-medium",
      text: "Need help fast? Join our community or reach out directly."
    }
  }
];

export const TOC_SECTIONS = [
  "Start with FiverFlow",
  "Welcome",
  "Pro Tip",
  "Get support / Community"
];
