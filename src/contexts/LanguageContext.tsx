import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clients',
    'nav.orders': 'Orders',
    'nav.tasks': 'Tasks',
    'nav.invoices': 'Invoices',
    'nav.calendar': 'Calendar',
    'nav.network': 'Network',
    'nav.stats': 'Stats',
    'nav.profile': 'Profile',
    'nav.support': 'Support',
    
    // Search
    'search.placeholder': 'Search...',
    'search.all': 'All',
    'search.clients': 'Clients',
    'search.orders': 'Orders',
    'search.tasks': 'Tasks',
    'search.invoices': 'Invoices',
    'search.calendar': 'Calendar',
    'search.network': 'Network',
    
    // Common
    'common.new': 'New',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.status': 'Status',
    'common.priority': 'Priority',
    'common.date': 'Date',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.company': 'Company',
    'common.platform': 'Platform',
    'common.country': 'Country',
    'common.all': 'All',
    'common.none': 'None',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.welcome.guest': 'Welcome to your Dashboard',
    'dashboard.quick.actions': 'Quick Actions',
    'dashboard.add.client': 'Add Client',
    'dashboard.add.order': 'Add Order',
    'dashboard.add.task': 'Add Task',
    'dashboard.add.invoice': 'Add Invoice',
    'dashboard.add.todo': 'Add To-Do List',
    
    // Clients
    'clients.title': 'Clients',
    'clients.description': 'Search, filter and manage your clients.',
    'clients.new.client': 'New client',
    'clients.no.results': 'No clients found.',
    'clients.adjust.filters': 'Adjust your filters or create a new client.',
    'clients.status.prospect': 'Prospect',
    'clients.status.active': 'Active',
    'clients.status.inactive': 'Inactive',
    'clients.status.completed': 'Project completed',
    
    // Orders
    'orders.title': 'Orders',
    'orders.description': 'Track, filter and manage all your client orders.',
    'orders.new.order': 'New order',
    'orders.no.results': 'No orders found.',
    'orders.adjust.filters': 'Adjust your filters or create a new order.',
    'orders.status.pending': 'Pending',
    'orders.status.in.progress': 'In Progress',
    'orders.status.completed': 'Completed',
    'orders.created.on': 'Created on',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.description': 'Plan, organize and execute — unlimited subtasks, advanced color picker & customizable columns.',
    'tasks.new.task': 'New task',
    'tasks.add.subtask': 'Add Subtask',
    'tasks.priority.urgent': 'P1 Urgent',
    'tasks.priority.high': 'P2 High',
    'tasks.priority.medium': 'P3 Medium',
    'tasks.priority.low': 'P4 Low',
    'tasks.status.todo': 'To Do',
    'tasks.status.in.progress': 'In Progress',
    'tasks.status.blocked': 'Blocked',
    'tasks.status.done': 'Done',
    'tasks.no.due.date': 'No due date',
    'tasks.set.due.date': 'Set due date',
    
    // Invoices
    'invoices.title': 'Invoices',
    'invoices.description': 'Create, manage and track your invoices.',
    'invoices.new.invoice': 'New invoice',
    'invoices.mark.sent': 'Mark as sent',
    'invoices.mark.paid': 'Mark as paid',
    'invoices.not.found': 'Invoice not found (demo).',
    'invoices.deleted': 'Invoice deleted',
    'invoices.updating': 'Updating...',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.description': 'View your tasks and events in calendar format.',
    
    // Network
    'network.title': 'Network',
    'network.description': 'Connect with other professionals and grow your network.',
    
    // Stats
    'stats.title': 'Statistics',
    'stats.description': 'View detailed analytics and performance metrics.',
    
    // Profile
    'profile.title': 'Profile',
    'profile.description': 'Manage your account settings and preferences.',
    'profile.complete.fields': 'Please complete host, port, username and password.',
    
    // Support
    'support.title': 'Support',
    'support.description': 'Get help and support for your account.',
    'support.faq.title': 'Frequently Asked Questions',
    'support.faq.trial': 'How does the free trial work?',
    'support.faq.trial.answer': 'You have 7 days with all features. No card is charged before the end of the trial.',
    'support.faq.platforms': 'Can I connect my platforms (Fiverr, Upwork)?',
    'support.faq.platforms.answer': 'Yes, you can track your clients and orders across multiple platforms in one place.',
    'support.faq.invoices': 'Invoices and payments?',
    'support.faq.invoices.answer': 'You create your invoices and payment goes directly to your connected Stripe account.',
    'support.faq.security': 'Is my data secure?',
    'support.faq.security.answer': 'We use Supabase and enterprise-level security practices (encryption, RBAC).',
    'support.faq.cancel': 'Can I cancel at any time?',
    'support.faq.cancel.answer': 'Yes. You can cancel or change your plan from the billing page at any time.',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.clients': 'Clients',
    'nav.orders': 'Commandes',
    'nav.tasks': 'Tâches',
    'nav.invoices': 'Factures',
    'nav.calendar': 'Calendrier',
    'nav.network': 'Réseau',
    'nav.stats': 'Statistiques',
    'nav.profile': 'Profil',
    'nav.support': 'Support',
    
    // Search
    'search.placeholder': 'Rechercher...',
    'search.all': 'Tout',
    'search.clients': 'Clients',
    'search.orders': 'Commandes',
    'search.tasks': 'Tâches',
    'search.invoices': 'Factures',
    'search.calendar': 'Calendrier',
    'search.network': 'Réseau',
    
    // Common
    'common.new': 'Nouveau',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.status': 'Statut',
    'common.priority': 'Priorité',
    'common.date': 'Date',
    'common.name': 'Nom',
    'common.email': 'Email',
    'common.company': 'Entreprise',
    'common.platform': 'Plateforme',
    'common.country': 'Pays',
    'common.all': 'Tous',
    'common.none': 'Aucun',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',
    
    // Dashboard
    'dashboard.welcome': 'Bon retour',
    'dashboard.welcome.guest': 'Bienvenue sur votre Tableau de bord',
    'dashboard.quick.actions': 'Actions Rapides',
    'dashboard.add.client': 'Ajouter Client',
    'dashboard.add.order': 'Ajouter Commande',
    'dashboard.add.task': 'Ajouter Tâche',
    'dashboard.add.invoice': 'Ajouter Facture',
    'dashboard.add.todo': 'Ajouter Liste de Tâches',
    
    // Clients
    'clients.title': 'Clients',
    'clients.description': 'Recherchez, filtrez et gérez vos clients.',
    'clients.new.client': 'Nouveau client',
    'clients.no.results': 'Aucun client trouvé.',
    'clients.adjust.filters': 'Modifiez vos filtres ou créez un nouveau client.',
    'clients.status.prospect': 'Prospect',
    'clients.status.active': 'Actif',
    'clients.status.inactive': 'Inactif',
    'clients.status.completed': 'Projet terminé',
    
    // Orders
    'orders.title': 'Commandes',
    'orders.description': 'Suivez, filtrez et gérez toutes vos commandes client.',
    'orders.new.order': 'Nouvelle commande',
    'orders.no.results': 'Aucune commande trouvée.',
    'orders.adjust.filters': 'Modifiez vos filtres ou créez une nouvelle commande.',
    'orders.status.pending': 'En attente',
    'orders.status.in.progress': 'En cours',
    'orders.status.completed': 'Terminé',
    'orders.created.on': 'Créé le',
    
    // Tasks
    'tasks.title': 'Tâches',
    'tasks.description': 'Planifiez, organisez et exécutez — sous-tâches illimitées, sélecteur de couleurs avancé & colonnes personnalisables.',
    'tasks.new.task': 'Nouvelle tâche',
    'tasks.add.subtask': 'Ajouter Sous-tâche',
    'tasks.priority.urgent': 'P1 Urgent',
    'tasks.priority.high': 'P2 Élevé',
    'tasks.priority.medium': 'P3 Moyen',
    'tasks.priority.low': 'P4 Faible',
    'tasks.status.todo': 'À faire',
    'tasks.status.in.progress': 'En cours',
    'tasks.status.blocked': 'Bloqué',
    'tasks.status.done': 'Terminé',
    'tasks.no.due.date': 'Aucune date d\'échéance',
    'tasks.set.due.date': 'Définir date d\'échéance',
    
    // Invoices
    'invoices.title': 'Factures',
    'invoices.description': 'Créez, gérez et suivez vos factures.',
    'invoices.new.invoice': 'Nouvelle facture',
    'invoices.mark.sent': 'Marquer envoyé',
    'invoices.mark.paid': 'Marquer payé',
    'invoices.not.found': 'Facture introuvable (démo).',
    'invoices.deleted': 'Facture supprimée',
    'invoices.updating': 'Mise à jour...',
    
    // Calendar
    'calendar.title': 'Calendrier',
    'calendar.description': 'Visualisez vos tâches et événements au format calendrier.',
    
    // Network
    'network.title': 'Réseau',
    'network.description': 'Connectez-vous avec d\'autres professionnels et développez votre réseau.',
    
    // Stats
    'stats.title': 'Statistiques',
    'stats.description': 'Consultez des analyses détaillées et des métriques de performance.',
    
    // Profile
    'profile.title': 'Profil',
    'profile.description': 'Gérez les paramètres de votre compte et vos préférences.',
    'profile.complete.fields': 'Veuillez compléter host, port, username et password.',
    
    // Support
    'support.title': 'Support',
    'support.description': 'Obtenez de l\'aide et du support pour votre compte.',
    'support.faq.title': 'Questions Fréquemment Posées',
    'support.faq.trial': 'Comment fonctionne l\'essai gratuit ?',
    'support.faq.trial.answer': 'Vous avez 7 jours avec toutes les fonctionnalités. Aucune carte n\'est débitée avant la fin de l\'essai.',
    'support.faq.platforms': 'Puis-je connecter mes plateformes (Fiverr, Upwork) ?',
    'support.faq.platforms.answer': 'Oui, vous pouvez suivre vos clients et commandes multi-plateformes au même endroit.',
    'support.faq.invoices': 'Les factures et les paiements ?',
    'support.faq.invoices.answer': 'Vous créez vos factures et le paiement se fait directement vers votre compte Stripe connecté.',
    'support.faq.security': 'Mes données sont-elles sécurisées ?',
    'support.faq.security.answer': 'Nous utilisons Supabase et des pratiques de sécurité de niveau entreprise (chiffrement, RBAC).',
    'support.faq.cancel': 'Puis-je annuler à tout moment ?',
    'support.faq.cancel.answer': 'Oui. Vous pouvez annuler ou changer de plan depuis la page de facturation à tout moment.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Sauvegarder la langue quand elle change
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Fonction de traduction
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
