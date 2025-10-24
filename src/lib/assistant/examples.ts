/**
 * Quick examples for AI Assistant
 */

export interface QuickExample {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'tasks' | 'clients' | 'orders' | 'events' | 'general';
  language: 'fr' | 'en';
}

export const QUICK_EXAMPLES: QuickExample[] = [
  // English examples
  {
    id: 'en-create-task',
    title: 'Create a task',
    description: 'Add a new task with deadline',
    prompt: 'Create a task "Review the design" for tomorrow at 2 PM',
    category: 'tasks',
    language: 'en',
  },
  {
    id: 'en-list-tasks',
    title: 'List tasks',
    description: 'View a filtered list of tasks',
    prompt: 'Show all tasks in progress this week',
    category: 'tasks',
    language: 'en',
  },
  {
    id: 'en-create-client',
    title: 'Add a client',
    description: 'Register a new client',
    prompt: 'Add a client "Acme Corp" with email contact@acme.com',
    category: 'clients',
    language: 'en',
  },
  {
    id: 'en-create-order',
    title: 'Create an order',
    description: 'Register a new order',
    prompt: 'Create an order "Website" for $2500 due December 15th',
    category: 'orders',
    language: 'en',
  },
  {
    id: 'en-schedule-event',
    title: 'Schedule an event',
    description: 'Create a meeting or appointment',
    prompt: 'Schedule meeting "Project review" tomorrow at 10am',
    category: 'events',
    language: 'en',
  },
  {
    id: 'en-update-status',
    title: 'Update status',
    description: 'Change status of an item',
    prompt: 'Mark task "Logo design" as completed',
    category: 'tasks',
    language: 'en',
  },
  {
    id: 'en-find-client',
    title: 'Find client',
    description: 'Find a client by name or email',
    prompt: 'Find client with email john@example.com',
    category: 'clients',
    language: 'en',
  },
  {
    id: 'en-help',
    title: 'Help',
    description: 'Get help with commands',
    prompt: '/help',
    category: 'general',
    language: 'en',
  },
];

/**
 * Get examples for a given language
 */
export function getExamplesForLanguage(language: 'fr' | 'en'): QuickExample[] {
  return QUICK_EXAMPLES.filter(example => example.language === language);
}

/**
 * Obtient les exemples pour une catégorie donnée
 */
export function getExamplesForCategory(category: string): QuickExample[] {
  return QUICK_EXAMPLES.filter(example => example.category === category);
}

/**
 * Obtient un exemple aléatoire
 */
export function getRandomExample(language?: 'fr' | 'en'): QuickExample {
  const examples = language ? getExamplesForLanguage(language) : QUICK_EXAMPLES;
  const randomIndex = Math.floor(Math.random() * examples.length);
  return examples[randomIndex];
}

/**
 * Obtient les catégories disponibles
 */
export function getCategories(): string[] {
  return [...new Set(QUICK_EXAMPLES.map(example => example.category))];
}
