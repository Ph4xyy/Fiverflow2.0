export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatarInitials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "FiverFlow transformed my workflow. I went from losing track of orders to having everything in one place. Revenue is up 40%.",
    name: "Sarah Chen",
    role: "Graphic Designer, Fiverr",
    avatarInitials: "SC"
  },
  {
    quote: "Finally, a platform built for freelancers. The client management and invoice features are exactly what I needed to scale.",
    name: "Marcus Rodriguez",
    role: "Web Developer, Upwork",
    avatarInitials: "MR"
  },
  {
    quote: "Managing TikTok Shop orders was chaos until FiverFlow. Now I track everything effortlessly.",
    name: "Emma Thompson",
    role: "Product Marketer, TikTok Shop",
    avatarInitials: "ET"
  },
  {
    quote: "The calendar integration is a lifesaver. All my deadlines sync automatically, and I never miss a deliverable.",
    name: "James Park",
    role: "Brand Consultant, Independent",
    avatarInitials: "JP"
  },
  {
    quote: "Switched from spreadsheets and never looked back. The statistics feature shows me exactly what's working.",
    name: "Lisa Wang",
    role: "Social Media Manager, Instagram DM",
    avatarInitials: "LW"
  },
  {
    quote: "Game changer for managing multiple clients across different platforms. Best investment I've made.",
    name: "David Kim",
    role: "Full-Stack Developer, Multi-Platform",
    avatarInitials: "DK"
  }
];

