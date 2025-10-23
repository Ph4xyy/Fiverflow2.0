/**
 * Parser d'intentions pour l'Assistant AI
 * Supporte le français et l'anglais avec slash-commands et langage naturel
 */

import { ParsedIntent } from '../../types/assistant';

// Expressions régulières pour détecter les éléments
const DATE_PATTERNS = {
  fr: [
    /(?:demain|tomorrow)/i,
    /(?:aujourd'hui|today)/i,
    /(?:hier|yesterday)/i,
    /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i,
    /(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{1,2})\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
    /(?:à|à\s+)(\d{1,2})h(?:(\d{2}))?/i,
    /(\d{1,2}):(\d{2})/,
  ],
  en: [
    /(?:tomorrow|today|yesterday)/i,
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(?:at\s+)(\d{1,2})(?::(\d{2}))?\s*(?:am|pm)?/i,
    /(\d{1,2}):(\d{2})/,
  ]
};

const MONEY_PATTERNS = [
  /(\d+(?:[.,]\d{2})?)\s*(?:€|euros?|dollars?|\$|USD|EUR)/i,
  /(\d+(?:[.,]\d{2})?)\s*(?:€|\$)/,
];

const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
];

const ID_PATTERNS = [
  /(?:id|numéro|n°)\s*:?\s*([a-f0-9-]{36})/i,
  /([a-f0-9-]{36})/,
];

// Mots-clés pour les opérations
const OPERATION_KEYWORDS = {
  fr: {
    create: ['créer', 'ajouter', 'nouveau', 'nouvelle', 'add', 'create', 'new'],
    read: ['voir', 'afficher', 'montrer', 'show', 'view', 'display'],
    list: ['liste', 'lister', 'tous', 'all', 'list'],
    update: ['modifier', 'changer', 'mettre à jour', 'update', 'modify', 'change', 'edit'],
    delete: ['supprimer', 'effacer', 'delete', 'remove', 'del'],
  },
  en: {
    create: ['create', 'add', 'new', 'make'],
    read: ['show', 'view', 'display', 'see'],
    list: ['list', 'show all', 'display all'],
    update: ['update', 'modify', 'change', 'edit'],
    delete: ['delete', 'remove', 'del'],
  }
};

// Mots-clés pour les ressources
const RESOURCE_KEYWORDS = {
  fr: {
    task: ['tâche', 'task', 'tâches', 'tasks', 'travail', 'work'],
    order: ['commande', 'order', 'orders', 'commandes'],
    client: ['client', 'clients', 'customer', 'customers', 'clientèle'],
    event: ['événement', 'event', 'événements', 'events', 'rendez-vous', 'rdv'],
  },
  en: {
    task: ['task', 'tasks', 'work', 'todo'],
    order: ['order', 'orders'],
    client: ['client', 'clients', 'customer', 'customers'],
    event: ['event', 'events', 'meeting', 'appointment'],
  }
};

// Mots-clés pour les statuts
const STATUS_KEYWORDS = {
  fr: {
    pending: ['en attente', 'en cours', 'pending', 'waiting'],
    completed: ['terminé', 'fini', 'completed', 'done', 'finished'],
    cancelled: ['annulé', 'cancelled', 'canceled'],
    in_progress: ['en cours', 'in progress', 'working'],
    confirmed: ['confirmé', 'confirmed'],
  },
  en: {
    pending: ['pending', 'waiting'],
    completed: ['completed', 'done', 'finished'],
    cancelled: ['cancelled', 'canceled'],
    in_progress: ['in progress', 'working'],
    confirmed: ['confirmed'],
  }
};

// Mots-clés pour les priorités
const PRIORITY_KEYWORDS = {
  fr: {
    low: ['faible', 'low', 'bas'],
    medium: ['moyen', 'medium', 'normal'],
    high: ['élevé', 'high', 'important'],
    urgent: ['urgent', 'urgente', 'critique'],
  },
  en: {
    low: ['low'],
    medium: ['medium', 'normal'],
    high: ['high', 'important'],
    urgent: ['urgent', 'critical'],
  }
};

/**
 * Parse une date humaine en format ISO
 */
function parseHumanDate(input: string): string | undefined {
  const now = new Date();
  const inputLower = input.toLowerCase();

  // Demain
  if (inputLower.includes('demain') || inputLower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }

  // Aujourd'hui
  if (inputLower.includes('aujourd\'hui') || inputLower.includes('today')) {
    return now.toISOString();
  }

  // Heure spécifique
  const timeMatch = input.match(/(?:à|at)\s*(\d{1,2})(?::(\d{2}))?\s*(?:am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2] || '0');
    
    // Gérer AM/PM
    if (inputLower.includes('pm') && hours < 12) hours += 12;
    if (inputLower.includes('am') && hours === 12) hours = 0;

    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  // Date complète
  const dateMatch = input.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const year = parseInt(dateMatch[3]);
    const fullYear = year < 100 ? 2000 + year : year;
    
    const date = new Date(fullYear, month, day);
    return date.toISOString();
  }

  return undefined;
}

/**
 * Parse un montant d'argent
 */
function parseMoney(input: string): { amount: number; currency: string } | undefined {
  for (const pattern of MONEY_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      const currency = match[2] || (input.includes('€') ? 'EUR' : 'USD');
      return { amount, currency };
    }
  }
  return undefined;
}

/**
 * Parse un email
 */
function parseEmail(input: string): string | undefined {
  const match = input.match(EMAIL_PATTERNS[0]);
  return match ? match[0] : undefined;
}

/**
 * Parse un ID UUID
 */
function parseId(input: string): string | undefined {
  for (const pattern of ID_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return undefined;
}

/**
 * Détecte la langue de l'input
 */
function detectLanguage(input: string): 'fr' | 'en' {
  const frenchWords = ['créer', 'tâche', 'client', 'commande', 'événement', 'modifier', 'supprimer'];
  const englishWords = ['create', 'task', 'client', 'order', 'event', 'update', 'delete'];
  
  const inputLower = input.toLowerCase();
  const frenchScore = frenchWords.filter(word => inputLower.includes(word)).length;
  const englishScore = englishWords.filter(word => inputLower.includes(word)).length;
  
  return frenchScore > englishScore ? 'fr' : 'en';
}

/**
 * Parse une intention à partir d'un input utilisateur
 */
export function parseIntent(input: string): ParsedIntent {
  const inputTrimmed = input.trim();
  const language = detectLanguage(inputTrimmed);
  const inputLower = inputTrimmed.toLowerCase();

  // Détecter les slash-commands
  if (inputTrimmed.startsWith('/')) {
    return parseSlashCommand(inputTrimmed, language);
  }

  // Parser le langage naturel
  return parseNaturalLanguage(inputTrimmed, language);
}

/**
 * Parse une slash-command
 */
function parseSlashCommand(input: string, language: 'fr' | 'en'): ParsedIntent {
  const parts = input.split(' ');
  const command = parts[0].substring(1); // Enlever le /
  
  // Commande help
  if (command === 'help') {
    return {
      op: 'read',
      resource: 'task', // Par défaut
      params: { help: true },
      rawInput: input,
    };
  }

  // Parser les autres commandes
  const remaining = parts.slice(1).join(' ');
  
  // Détecter l'opération
  let op: ParsedIntent['op'] = 'read';
  if (command.includes('create') || command.includes('add')) op = 'create';
  else if (command.includes('update') || command.includes('edit')) op = 'update';
  else if (command.includes('delete') || command.includes('remove')) op = 'delete';
  else if (command.includes('list')) op = 'list';

  // Détecter la ressource
  let resource: ParsedIntent['resource'] = 'task';
  if (command.includes('client')) resource = 'client';
  else if (command.includes('order')) resource = 'order';
  else if (command.includes('event')) resource = 'event';

  // Parser les paramètres
  const params = parseParameters(remaining, language);

  return {
    op,
    resource,
    params,
    confirmRequired: op === 'delete',
    rawInput: input,
  };
}

/**
 * Parse le langage naturel
 */
function parseNaturalLanguage(input: string, language: 'fr' | 'en'): ParsedIntent {
  const inputLower = input.toLowerCase();
  
  // Détecter l'opération
  let op: ParsedIntent['op'] = 'read';
  for (const [operation, keywords] of Object.entries(OPERATION_KEYWORDS[language])) {
    if (keywords.some(keyword => inputLower.includes(keyword))) {
      op = operation as ParsedIntent['op'];
      break;
    }
  }

  // Détecter la ressource
  let resource: ParsedIntent['resource'] = 'task';
  for (const [res, keywords] of Object.entries(RESOURCE_KEYWORDS[language])) {
    if (keywords.some(keyword => inputLower.includes(keyword))) {
      resource = res as ParsedIntent['resource'];
      break;
    }
  }

  // Parser les paramètres
  const params = parseParameters(input, language);

  return {
    op,
    resource,
    params,
    confirmRequired: op === 'delete' && (inputLower.includes('tout') || inputLower.includes('all')),
    rawInput: input,
  };
}

/**
 * Parse les paramètres d'un input
 */
function parseParameters(input: string, language: 'fr' | 'en'): Record<string, any> {
  const params: Record<string, any> = {};

  // Parser les dates
  const date = parseHumanDate(input);
  if (date) {
    params.due_date = date;
    params.start_at = date;
  }

  // Parser l'argent
  const money = parseMoney(input);
  if (money) {
    params.amount = money.amount;
    params.currency = money.currency;
  }

  // Parser l'email
  const email = parseEmail(input);
  if (email) {
    params.email = email;
  }

  // Parser l'ID
  const id = parseId(input);
  if (id) {
    params.id = id;
  }

  // Parser le statut
  for (const [status, keywords] of Object.entries(STATUS_KEYWORDS[language])) {
    if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
      params.status = status;
      break;
    }
  }

  // Parser la priorité
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS[language])) {
    if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
      params.priority = priority;
      break;
    }
  }

  // Extraire le titre (texte principal)
  const titleMatch = input.match(/"([^"]+)"/) || input.match(/'([^']+)'/);
  if (titleMatch) {
    params.title = titleMatch[1];
  } else {
    // Essayer d'extraire le titre du contexte
    const words = input.split(' ');
    const operationWords = [...OPERATION_KEYWORDS[language].create, ...OPERATION_KEYWORDS[language].update];
    const resourceWords = [...RESOURCE_KEYWORDS[language].task, ...RESOURCE_KEYWORDS[language].client];
    
    const titleStart = words.findIndex(word => 
      operationWords.includes(word.toLowerCase()) || resourceWords.includes(word.toLowerCase())
    );
    
    if (titleStart !== -1 && titleStart + 1 < words.length) {
      const titleWords = words.slice(titleStart + 1);
      // Filtrer les mots qui ne sont pas des paramètres
      const filteredWords = titleWords.filter(word => 
        !word.match(/^\d+$/) && // Pas de chiffres seuls
        !word.match(/^[a-f0-9-]{36}$/) && // Pas d'UUID
        !word.includes('@') && // Pas d'email
        !word.includes('€') && !word.includes('$') // Pas d'argent
      );
      
      if (filteredWords.length > 0) {
        params.title = filteredWords.join(' ');
      }
    }
  }

  return params;
}
