/**
 * Exemples rapides pour l'Assistant AI
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
  // Exemples en français
  {
    id: 'fr-create-task',
    title: 'Créer une tâche',
    description: 'Ajouter une nouvelle tâche avec échéance',
    prompt: 'Créer une tâche "Réviser le design" pour demain 14h',
    category: 'tasks',
    language: 'fr',
  },
  {
    id: 'fr-list-tasks',
    title: 'Lister les tâches',
    description: 'Voir une liste de tâches filtrées',
    prompt: 'Montrer toutes les tâches en cours de cette semaine',
    category: 'tasks',
    language: 'fr',
  },
  {
    id: 'fr-create-client',
    title: 'Ajouter un client',
    description: 'Enregistrer un nouveau client',
    prompt: 'Ajouter un client "Acme Corp" avec l\'email contact@acme.com',
    category: 'clients',
    language: 'fr',
  },
  {
    id: 'fr-create-order',
    title: 'Créer une commande',
    description: 'Enregistrer une nouvelle commande',
    prompt: 'Créer une commande "Site web" pour 2500€ due le 15 décembre',
    category: 'orders',
    language: 'fr',
  },
  {
    id: 'fr-schedule-event',
    title: 'Planifier un événement',
    description: 'Créer un rendez-vous ou réunion',
    prompt: 'Planifier une réunion "Revue projet" demain à 10h',
    category: 'events',
    language: 'fr',
  },
  {
    id: 'fr-update-status',
    title: 'Mettre à jour le statut',
    description: 'Changer le statut d\'un élément',
    prompt: 'Marquer la tâche "Design logo" comme terminée',
    category: 'tasks',
    language: 'fr',
  },
  {
    id: 'fr-find-client',
    title: 'Rechercher un client',
    description: 'Trouver un client par nom ou email',
    prompt: 'Trouver le client avec l\'email john@example.com',
    category: 'clients',
    language: 'fr',
  },
  {
    id: 'fr-help',
    title: 'Aide',
    description: 'Obtenir de l\'aide sur les commandes',
    prompt: '/help',
    category: 'general',
    language: 'fr',
  },

  // Exemples en anglais
  {
    id: 'en-create-task',
    title: 'Create task',
    description: 'Add a new task with due date',
    prompt: 'Create task "Review design" for tomorrow at 2pm',
    category: 'tasks',
    language: 'en',
  },
  {
    id: 'en-list-tasks',
    title: 'List tasks',
    description: 'Show filtered list of tasks',
    prompt: 'Show all in-progress tasks for this week',
    category: 'tasks',
    language: 'en',
  },
  {
    id: 'en-create-client',
    title: 'Add client',
    description: 'Register a new client',
    prompt: 'Add client "Acme Corp" with email contact@acme.com',
    category: 'clients',
    language: 'en',
  },
  {
    id: 'en-create-order',
    title: 'Create order',
    description: 'Register a new order',
    prompt: 'Create order "Website" for €2500 due December 15th',
    category: 'orders',
    language: 'en',
  },
  {
    id: 'en-schedule-event',
    title: 'Schedule event',
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
 * Obtient les exemples pour une langue donnée
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
