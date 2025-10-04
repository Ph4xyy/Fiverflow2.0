import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr' | 'es' | 'de' | 'zh' | 'it' | 'pt' | 'ru' | 'ja' | 'ko';

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
    'nav.todo': 'To-Do List',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Upgrade',
    
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
    'common.language': 'Language',
    'common.no.results': 'No results found',
    'common.try.different.search': 'Try a different search term',
    
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
    
    // Auth
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to your account',
    'auth.login.email': 'Email Address',
    'auth.login.password': 'Password',
    'auth.login.signin': 'Sign In',
    'auth.login.signing': 'Signing In...',
    'auth.login.no.account': 'Don\'t have an account?',
    'auth.login.signup': 'Sign up',
    'auth.login.error.required': 'Please enter both email and password',
    'auth.login.error.unexpected': 'An unexpected error occurred. Please try again.',
    
    'auth.register.title': 'Create Account',
    'auth.register.subtitle': 'Join the community of professional freelancers',
    'auth.register.step': 'Step',
    'auth.register.of': 'of',
    'auth.register.account.info': 'Account Information',
    'auth.register.account.subtitle': 'Create your secure login credentials',
    'auth.register.personal.info': 'Personal Information',
    'auth.register.personal.subtitle': 'Tell us more about yourself',
    'auth.register.services.info': 'Freelance Services',
    'auth.register.services.subtitle': 'What services do you offer? (1-5 services)',
    'auth.register.email': 'Email Address',
    'auth.register.username': 'Username',
    'auth.register.password': 'Password',
    'auth.register.confirm.password': 'Confirm Password',
    'auth.register.country': 'Country of Origin',
    'auth.register.phone': 'Phone Number',
    'auth.register.phone.optional': '(optional)',
    'auth.register.services': 'Services Offered',
    'auth.register.create.account': 'Create Account',
    'auth.register.creating': 'Creating...',
    'auth.register.previous': 'Previous',
    'auth.register.next': 'Next',
    'auth.register.already.account': 'Already have an account?',
    'auth.register.signin': 'Sign in',
    'auth.register.security.title': 'Security and Privacy',
    'auth.register.security.text': 'Your data is protected by bank-level encryption. We never share your personal information with third parties.',
    
    // Templates
    'templates.title': 'Message Templates',
    'templates.subtitle': 'Create and manage your client communication templates',
    'templates.new.template': 'New Template',
    'templates.search.placeholder': 'Search templates...',
    'templates.category.all': 'All Categories',
    'templates.used.times': 'Used {count} times',
    'templates.last.used': 'Last used: {date}',
    'templates.variables.title': 'Template Variables',
    'templates.variables.subtitle': 'Use these variables in your templates to automatically insert client-specific information:',
    'templates.variables.client.name': 'Client\'s name',
    'templates.variables.project.type': 'Type of project',
    'templates.variables.deadline': 'Project deadline',
    'templates.variables.due.date': 'Payment due date',
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
    'nav.todo': 'Aufgabenliste',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Upgrade',
    'nav.todo': 'Liste de tâches',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Mettre à niveau',
    
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
    'common.language': 'Langue',
    'common.no.results': 'Aucun résultat trouvé',
    'common.try.different.search': 'Essayez un autre terme de recherche',
    
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
    
    // Auth
    'auth.login.title': 'Bon Retour',
    'auth.login.subtitle': 'Connectez-vous à votre compte',
    'auth.login.email': 'Adresse Email',
    'auth.login.password': 'Mot de Passe',
    'auth.login.signin': 'Se Connecter',
    'auth.login.signing': 'Connexion...',
    'auth.login.no.account': 'Vous n\'avez pas de compte ?',
    'auth.login.signup': 'S\'inscrire',
    'auth.login.error.required': 'Veuillez saisir l\'email et le mot de passe',
    'auth.login.error.unexpected': 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    
    'auth.register.title': 'Créer un Compte',
    'auth.register.subtitle': 'Rejoignez la communauté des freelancers professionnels',
    'auth.register.step': 'Étape',
    'auth.register.of': 'sur',
    'auth.register.account.info': 'Informations de Compte',
    'auth.register.account.subtitle': 'Créez vos identifiants de connexion sécurisés',
    'auth.register.personal.info': 'Informations Personnelles',
    'auth.register.personal.subtitle': 'Dites-nous en plus sur vous',
    'auth.register.services.info': 'Services Freelance',
    'auth.register.services.subtitle': 'Quels services proposez-vous ? (1-5 services)',
    'auth.register.email': 'Adresse Email',
    'auth.register.username': 'Nom d\'Utilisateur',
    'auth.register.password': 'Mot de Passe',
    'auth.register.confirm.password': 'Confirmer le Mot de Passe',
    'auth.register.country': 'Pays d\'Origine',
    'auth.register.phone': 'Numéro de Téléphone',
    'auth.register.phone.optional': '(optionnel)',
    'auth.register.services': 'Services Proposés',
    'auth.register.create.account': 'Créer mon Compte',
    'auth.register.creating': 'Création en cours...',
    'auth.register.previous': 'Précédent',
    'auth.register.next': 'Suivant',
    'auth.register.already.account': 'Vous avez déjà un compte ?',
    'auth.register.signin': 'Se connecter',
    'auth.register.security.title': 'Sécurité et Confidentialité',
    'auth.register.security.text': 'Vos données sont protégées par un chiffrement de niveau bancaire. Nous ne partageons jamais vos informations personnelles avec des tiers.',
    
    // Templates
    'templates.title': 'Modèles de Messages',
    'templates.subtitle': 'Créez et gérez vos modèles de communication client',
    'templates.new.template': 'Nouveau Modèle',
    'templates.search.placeholder': 'Rechercher des modèles...',
    'templates.category.all': 'Toutes les Catégories',
    'templates.used.times': 'Utilisé {count} fois',
    'templates.last.used': 'Dernière utilisation : {date}',
    'templates.variables.title': 'Variables de Modèle',
    'templates.variables.subtitle': 'Utilisez ces variables dans vos modèles pour insérer automatiquement des informations spécifiques au client :',
    'templates.variables.client.name': 'Nom du client',
    'templates.variables.project.type': 'Type de projet',
    'templates.variables.deadline': 'Échéance du projet',
    'templates.variables.due.date': 'Date d\'échéance du paiement',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.clients': 'Clientes',
    'nav.orders': 'Pedidos',
    'nav.tasks': 'Tareas',
    'nav.invoices': 'Facturas',
    'nav.calendar': 'Calendario',
    'nav.network': 'Red',
    'nav.stats': 'Estadísticas',
    'nav.profile': 'Perfil',
    'nav.support': 'Soporte',
    'nav.todo': 'Lista de tareas',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Actualizar',
    
    // Search
    'search.placeholder': 'Buscar...',
    'search.all': 'Todo',
    'search.clients': 'Clientes',
    'search.orders': 'Pedidos',
    'search.tasks': 'Tareas',
    'search.invoices': 'Facturas',
    'search.calendar': 'Calendario',
    'search.network': 'Red',
    
    // Common
    'common.new': 'Nuevo',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.status': 'Estado',
    'common.priority': 'Prioridad',
    'common.date': 'Fecha',
    'common.name': 'Nombre',
    'common.email': 'Email',
    'common.company': 'Empresa',
    'common.platform': 'Plataforma',
    'common.country': 'País',
    'common.all': 'Todos',
    'common.none': 'Ninguno',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',
    'common.language': 'Idioma',
    'common.no.results': 'No se encontraron resultados',
    'common.try.different.search': 'Intenta con un término diferente',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido de vuelta',
    'dashboard.welcome.guest': 'Bienvenido a tu Panel de Control',
    'dashboard.quick.actions': 'Acciones Rápidas',
    'dashboard.add.client': 'Agregar Cliente',
    'dashboard.add.order': 'Agregar Pedido',
    'dashboard.add.task': 'Agregar Tarea',
    'dashboard.add.invoice': 'Agregar Factura',
    'dashboard.add.todo': 'Agregar Lista de Tareas',
    
    // Clients
    'clients.title': 'Clientes',
    'clients.description': 'Busca, filtra y gestiona tus clientes.',
    'clients.new.client': 'Nuevo cliente',
    'clients.no.results': 'No se encontraron clientes.',
    'clients.adjust.filters': 'Ajusta tus filtros o crea un nuevo cliente.',
    'clients.status.prospect': 'Prospecto',
    'clients.status.active': 'Activo',
    'clients.status.inactive': 'Inactivo',
    'clients.status.completed': 'Proyecto completado',
    
    // Orders
    'orders.title': 'Pedidos',
    'orders.description': 'Rastrea, filtra y gestiona todos tus pedidos de clientes.',
    'orders.new.order': 'Nuevo pedido',
    'orders.no.results': 'No se encontraron pedidos.',
    'orders.adjust.filters': 'Ajusta tus filtros o crea un nuevo pedido.',
    'orders.status.pending': 'Pendiente',
    'orders.status.in.progress': 'En Progreso',
    'orders.status.completed': 'Completado',
    'orders.created.on': 'Creado el',
    
    // Tasks
    'tasks.title': 'Tareas',
    'tasks.description': 'Planifica, organiza y ejecuta — subtareas ilimitadas, selector de colores avanzado y columnas personalizables.',
    'tasks.new.task': 'Nueva tarea',
    'tasks.add.subtask': 'Agregar Subtarea',
    'tasks.priority.urgent': 'P1 Urgente',
    'tasks.priority.high': 'P2 Alto',
    'tasks.priority.medium': 'P3 Medio',
    'tasks.priority.low': 'P4 Bajo',
    'tasks.status.todo': 'Por Hacer',
    'tasks.status.in.progress': 'En Progreso',
    'tasks.status.blocked': 'Bloqueado',
    'tasks.status.done': 'Completado',
    'tasks.no.due.date': 'Sin fecha de vencimiento',
    'tasks.set.due.date': 'Establecer fecha de vencimiento',
    
    // Invoices
    'invoices.title': 'Facturas',
    'invoices.description': 'Crea, gestiona y rastrea tus facturas.',
    'invoices.new.invoice': 'Nueva factura',
    'invoices.mark.sent': 'Marcar como enviada',
    'invoices.mark.paid': 'Marcar como pagada',
    'invoices.not.found': 'Factura no encontrada (demo).',
    'invoices.deleted': 'Factura eliminada',
    'invoices.updating': 'Actualizando...',
    
    // Calendar
    'calendar.title': 'Calendario',
    'calendar.description': 'Visualiza tus tareas y eventos en formato calendario.',
    
    // Network
    'network.title': 'Red',
    'network.description': 'Conéctate con otros profesionales y haz crecer tu red.',
    
    // Stats
    'stats.title': 'Estadísticas',
    'stats.description': 'Consulta análisis detallados y métricas de rendimiento.',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.description': 'Gestiona la configuración de tu cuenta y preferencias.',
    'profile.complete.fields': 'Por favor completa host, port, username y password.',
    
    // Support
    'support.title': 'Soporte',
    'support.description': 'Obtén ayuda y soporte para tu cuenta.',
    'support.faq.title': 'Preguntas Frecuentes',
    'support.faq.trial': '¿Cómo funciona la prueba gratuita?',
    'support.faq.trial.answer': 'Tienes 7 días con todas las funciones. No se cobra ninguna tarjeta antes del final de la prueba.',
    'support.faq.platforms': '¿Puedo conectar mis plataformas (Fiverr, Upwork)?',
    'support.faq.platforms.answer': 'Sí, puedes rastrear tus clientes y pedidos en múltiples plataformas en un solo lugar.',
    'support.faq.invoices': '¿Facturas y pagos?',
    'support.faq.invoices.answer': 'Creas tus facturas y el pago va directamente a tu cuenta Stripe conectada.',
    'support.faq.security': '¿Están seguros mis datos?',
    'support.faq.security.answer': 'Utilizamos Supabase y prácticas de seguridad de nivel empresarial (cifrado, RBAC).',
    'support.faq.cancel': '¿Puedo cancelar en cualquier momento?',
    'support.faq.cancel.answer': 'Sí. Puedes cancelar o cambiar tu plan desde la página de facturación en cualquier momento.',
    
    // Auth
    'auth.login.title': 'Bienvenido de vuelta',
    'auth.login.subtitle': 'Inicia sesión en tu cuenta',
    'auth.login.email': 'Dirección de Email',
    'auth.login.password': 'Contraseña',
    'auth.login.signin': 'Iniciar Sesión',
    'auth.login.signing': 'Iniciando sesión...',
    'auth.login.no.account': '¿No tienes una cuenta?',
    'auth.login.signup': 'Registrarse',
    'auth.login.error.required': 'Por favor ingresa el email y la contraseña',
    'auth.login.error.unexpected': 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    
    'auth.register.title': 'Crear Cuenta',
    'auth.register.subtitle': 'Únete a la comunidad de freelancers profesionales',
    'auth.register.step': 'Paso',
    'auth.register.of': 'de',
    'auth.register.account.info': 'Información de Cuenta',
    'auth.register.account.subtitle': 'Crea tus credenciales de inicio de sesión seguras',
    'auth.register.personal.info': 'Información Personal',
    'auth.register.personal.subtitle': 'Cuéntanos más sobre ti',
    'auth.register.services.info': 'Servicios Freelance',
    'auth.register.services.subtitle': '¿Qué servicios ofreces? (1-5 servicios)',
    'auth.register.email': 'Dirección de Email',
    'auth.register.username': 'Nombre de Usuario',
    'auth.register.password': 'Contraseña',
    'auth.register.confirm.password': 'Confirmar Contraseña',
    'auth.register.country': 'País de Origen',
    'auth.register.phone': 'Número de Teléfono',
    'auth.register.phone.optional': '(opcional)',
    'auth.register.services': 'Servicios Ofrecidos',
    'auth.register.create.account': 'Crear mi Cuenta',
    'auth.register.creating': 'Creando...',
    'auth.register.previous': 'Anterior',
    'auth.register.next': 'Siguiente',
    'auth.register.already.account': '¿Ya tienes una cuenta?',
    'auth.register.signin': 'Iniciar sesión',
    'auth.register.security.title': 'Seguridad y Privacidad',
    'auth.register.security.text': 'Tus datos están protegidos por cifrado de nivel bancario. Nunca compartimos tu información personal con terceros.',
    
    // Templates
    'templates.title': 'Plantillas de Mensajes',
    'templates.subtitle': 'Crea y gestiona tus plantillas de comunicación con clientes',
    'templates.new.template': 'Nueva Plantilla',
    'templates.search.placeholder': 'Buscar plantillas...',
    'templates.category.all': 'Todas las Categorías',
    'templates.used.times': 'Usado {count} veces',
    'templates.last.used': 'Último uso: {date}',
    'templates.variables.title': 'Variables de Plantilla',
    'templates.variables.subtitle': 'Usa estas variables en tus plantillas para insertar automáticamente información específica del cliente:',
    'templates.variables.client.name': 'Nombre del cliente',
    'templates.variables.project.type': 'Tipo de proyecto',
    'templates.variables.deadline': 'Fecha límite del proyecto',
    'templates.variables.due.date': 'Fecha de vencimiento del pago',
  },
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Kunden',
    'nav.orders': 'Aufträge',
    'nav.tasks': 'Aufgaben',
    'nav.invoices': 'Rechnungen',
    'nav.calendar': 'Kalender',
    'nav.network': 'Netzwerk',
    'nav.stats': 'Statistiken',
    'nav.profile': 'Profil',
    'nav.support': 'Support',
    'nav.todo': 'Aufgabenliste',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Upgrade',
    'nav.todo': 'Liste de tâches',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Mettre à niveau',
    
    // Search
    'search.placeholder': 'Suchen...',
    'search.all': 'Alle',
    'search.clients': 'Kunden',
    'search.orders': 'Aufträge',
    'search.tasks': 'Aufgaben',
    'search.invoices': 'Rechnungen',
    'search.calendar': 'Kalender',
    'search.network': 'Netzwerk',
    
    // Common
    'common.new': 'Neu',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.close': 'Schließen',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.status': 'Status',
    'common.priority': 'Priorität',
    'common.date': 'Datum',
    'common.name': 'Name',
    'common.email': 'E-Mail',
    'common.company': 'Unternehmen',
    'common.platform': 'Plattform',
    'common.country': 'Land',
    'common.all': 'Alle',
    'common.none': 'Keine',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.warning': 'Warnung',
    'common.info': 'Information',
    'common.language': 'Sprache',
    'common.no.results': 'Keine Ergebnisse gefunden',
    'common.try.different.search': 'Versuche einen anderen Suchbegriff',
    
    // Dashboard
    'dashboard.welcome': 'Willkommen zurück',
    'dashboard.welcome.guest': 'Willkommen zu deinem Dashboard',
    'dashboard.quick.actions': 'Schnellaktionen',
    'dashboard.add.client': 'Kunde hinzufügen',
    'dashboard.add.order': 'Auftrag hinzufügen',
    'dashboard.add.task': 'Aufgabe hinzufügen',
    'dashboard.add.invoice': 'Rechnung hinzufügen',
    'dashboard.add.todo': 'To-Do-Liste hinzufügen',
    
    // Clients
    'clients.title': 'Kunden',
    'clients.description': 'Durchsuche, filtere und verwalte deine Kunden.',
    'clients.new.client': 'Neuer Kunde',
    'clients.no.results': 'Keine Kunden gefunden.',
    'clients.adjust.filters': 'Passe deine Filter an oder erstelle einen neuen Kunden.',
    'clients.status.prospect': 'Interessent',
    'clients.status.active': 'Aktiv',
    'clients.status.inactive': 'Inaktiv',
    'clients.status.completed': 'Projekt abgeschlossen',
    
    // Orders
    'orders.title': 'Aufträge',
    'orders.description': 'Verfolge, filtere und verwalte alle deine Kundenaufträge.',
    'orders.new.order': 'Neuer Auftrag',
    'orders.no.results': 'Keine Aufträge gefunden.',
    'orders.adjust.filters': 'Passe deine Filter an oder erstelle einen neuen Auftrag.',
    'orders.status.pending': 'Ausstehend',
    'orders.status.in.progress': 'In Bearbeitung',
    'orders.status.completed': 'Abgeschlossen',
    'orders.created.on': 'Erstellt am',
    
    // Tasks
    'tasks.title': 'Aufgaben',
    'tasks.description': 'Plane, organisiere und führe aus — unbegrenzte Unteraufgaben, erweiterte Farbauswahl und anpassbare Spalten.',
    'tasks.new.task': 'Neue Aufgabe',
    'tasks.add.subtask': 'Unteraufgabe hinzufügen',
    'tasks.priority.urgent': 'P1 Dringend',
    'tasks.priority.high': 'P2 Hoch',
    'tasks.priority.medium': 'P3 Mittel',
    'tasks.priority.low': 'P4 Niedrig',
    'tasks.status.todo': 'Zu erledigen',
    'tasks.status.in.progress': 'In Bearbeitung',
    'tasks.status.blocked': 'Blockiert',
    'tasks.status.done': 'Erledigt',
    'tasks.no.due.date': 'Kein Fälligkeitsdatum',
    'tasks.set.due.date': 'Fälligkeitsdatum festlegen',
    
    // Invoices
    'invoices.title': 'Rechnungen',
    'invoices.description': 'Erstelle, verwalte und verfolge deine Rechnungen.',
    'invoices.new.invoice': 'Neue Rechnung',
    'invoices.mark.sent': 'Als gesendet markieren',
    'invoices.mark.paid': 'Als bezahlt markieren',
    'invoices.not.found': 'Rechnung nicht gefunden (Demo).',
    'invoices.deleted': 'Rechnung gelöscht',
    'invoices.updating': 'Aktualisierung...',
    
    // Calendar
    'calendar.title': 'Kalender',
    'calendar.description': 'Betrachte deine Aufgaben und Ereignisse im Kalenderformat.',
    
    // Network
    'network.title': 'Netzwerk',
    'network.description': 'Verbinde dich mit anderen Fachleuten und erweitere dein Netzwerk.',
    
    // Stats
    'stats.title': 'Statistiken',
    'stats.description': 'Betrachte detaillierte Analysen und Leistungsmetriken.',
    
    // Profile
    'profile.title': 'Profil',
    'profile.description': 'Verwalte deine Kontoeinstellungen und Präferenzen.',
    'profile.complete.fields': 'Bitte vervollständige Host, Port, Benutzername und Passwort.',
    
    // Support
    'support.title': 'Support',
    'support.description': 'Erhalte Hilfe und Support für dein Konto.',
    'support.faq.title': 'Häufig Gestellte Fragen',
    'support.faq.trial': 'Wie funktioniert die kostenlose Testversion?',
    'support.faq.trial.answer': 'Du hast 7 Tage mit allen Funktionen. Keine Karte wird vor Ende der Testversion belastet.',
    'support.faq.platforms': 'Kann ich meine Plattformen (Fiverr, Upwork) verbinden?',
    'support.faq.platforms.answer': 'Ja, du kannst deine Kunden und Aufträge plattformübergreifend an einem Ort verfolgen.',
    'support.faq.invoices': 'Rechnungen und Zahlungen?',
    'support.faq.invoices.answer': 'Du erstellst deine Rechnungen und die Zahlung geht direkt an dein verbundenes Stripe-Konto.',
    'support.faq.security': 'Sind meine Daten sicher?',
    'support.faq.security.answer': 'Wir verwenden Supabase und Sicherheitspraktiken auf Unternehmensebene (Verschlüsselung, RBAC).',
    'support.faq.cancel': 'Kann ich jederzeit kündigen?',
    'support.faq.cancel.answer': 'Ja. Du kannst jederzeit von der Abrechnungsseite aus kündigen oder deinen Plan ändern.',
    
    // Auth
    'auth.login.title': 'Willkommen zurück',
    'auth.login.subtitle': 'Melde dich in deinem Konto an',
    'auth.login.email': 'E-Mail-Adresse',
    'auth.login.password': 'Passwort',
    'auth.login.signin': 'Anmelden',
    'auth.login.signing': 'Anmeldung...',
    'auth.login.no.account': 'Hast du noch kein Konto?',
    'auth.login.signup': 'Registrieren',
    'auth.login.error.required': 'Bitte gib E-Mail und Passwort ein',
    'auth.login.error.unexpected': 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
    
    'auth.register.title': 'Konto erstellen',
    'auth.register.subtitle': 'Tritt der Gemeinschaft professioneller Freelancer bei',
    'auth.register.step': 'Schritt',
    'auth.register.of': 'von',
    'auth.register.account.info': 'Kontoinformationen',
    'auth.register.account.subtitle': 'Erstelle deine sicheren Anmeldedaten',
    'auth.register.personal.info': 'Persönliche Informationen',
    'auth.register.personal.subtitle': 'Erzähl uns mehr über dich',
    'auth.register.services.info': 'Freelance-Services',
    'auth.register.services.subtitle': 'Welche Services bietest du an? (1-5 Services)',
    'auth.register.email': 'E-Mail-Adresse',
    'auth.register.username': 'Benutzername',
    'auth.register.password': 'Passwort',
    'auth.register.confirm.password': 'Passwort bestätigen',
    'auth.register.country': 'Herkunftsland',
    'auth.register.phone': 'Telefonnummer',
    'auth.register.phone.optional': '(optional)',
    'auth.register.services': 'Angebotene Services',
    'auth.register.create.account': 'Mein Konto erstellen',
    'auth.register.creating': 'Erstelle...',
    'auth.register.previous': 'Zurück',
    'auth.register.next': 'Weiter',
    'auth.register.already.account': 'Hast du bereits ein Konto?',
    'auth.register.signin': 'Anmelden',
    'auth.register.security.title': 'Sicherheit und Datenschutz',
    'auth.register.security.text': 'Deine Daten sind durch Bank-Level-Verschlüsselung geschützt. Wir teilen niemals deine persönlichen Informationen mit Dritten.',
    
    // Templates
    'templates.title': 'Nachrichtenvorlagen',
    'templates.subtitle': 'Erstelle und verwalte deine Kundenkommunikationsvorlagen',
    'templates.new.template': 'Neue Vorlage',
    'templates.search.placeholder': 'Vorlagen suchen...',
    'templates.category.all': 'Alle Kategorien',
    'templates.used.times': '{count} mal verwendet',
    'templates.last.used': 'Zuletzt verwendet: {date}',
    'templates.variables.title': 'Vorlagenvariablen',
    'templates.variables.subtitle': 'Verwende diese Variablen in deinen Vorlagen, um automatisch kundenspezifische Informationen einzufügen:',
    'templates.variables.client.name': 'Kundenname',
    'templates.variables.project.type': 'Projekttyp',
    'templates.variables.deadline': 'Projekttermin',
    'templates.variables.due.date': 'Zahlungsfälligkeitsdatum',
  },
  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.clients': '客户',
    'nav.orders': '订单',
    'nav.tasks': '任务',
    'nav.invoices': '发票',
    'nav.calendar': '日历',
    'nav.network': '网络',
    'nav.stats': '统计',
    'nav.profile': '个人资料',
    'nav.support': '支持',
    'nav.todo': '待办事项',
    'nav.admin': '管理员',
    'nav.upgrade': '升级',
    
    // Search
    'search.placeholder': '搜索...',
    'search.all': '全部',
    'search.clients': '客户',
    'search.orders': '订单',
    'search.tasks': '任务',
    'search.invoices': '发票',
    'search.calendar': '日历',
    'search.network': '网络',
    
    // Common
    'common.new': '新建',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.close': '关闭',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.status': '状态',
    'common.priority': '优先级',
    'common.date': '日期',
    'common.name': '姓名',
    'common.email': '邮箱',
    'common.company': '公司',
    'common.platform': '平台',
    'common.country': '国家',
    'common.all': '全部',
    'common.none': '无',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '信息',
    'common.language': '语言',
    'common.no.results': '未找到结果',
    'common.try.different.search': '尝试不同的搜索词',
    
    // Dashboard
    'dashboard.welcome': '欢迎回来',
    'dashboard.welcome.guest': '欢迎来到您的仪表板',
    'dashboard.quick.actions': '快速操作',
    'dashboard.add.client': '添加客户',
    'dashboard.add.order': '添加订单',
    'dashboard.add.task': '添加任务',
    'dashboard.add.invoice': '添加发票',
    'dashboard.add.todo': '添加待办清单',
    
    // Clients
    'clients.title': '客户',
    'clients.description': '搜索、筛选和管理您的客户。',
    'clients.new.client': '新客户',
    'clients.no.results': '未找到客户。',
    'clients.adjust.filters': '调整您的筛选器或创建新客户。',
    'clients.status.prospect': '潜在客户',
    'clients.status.active': '活跃',
    'clients.status.inactive': '非活跃',
    'clients.status.completed': '项目完成',
    
    // Orders
    'orders.title': '订单',
    'orders.description': '跟踪、筛选和管理所有客户订单。',
    'orders.new.order': '新订单',
    'orders.no.results': '未找到订单。',
    'orders.adjust.filters': '调整您的筛选器或创建新订单。',
    'orders.status.pending': '待处理',
    'orders.status.in.progress': '进行中',
    'orders.status.completed': '已完成',
    'orders.created.on': '创建于',
    
    // Tasks
    'tasks.title': '任务',
    'tasks.description': '计划、组织和执行 — 无限子任务、高级颜色选择器和可自定义列。',
    'tasks.new.task': '新任务',
    'tasks.add.subtask': '添加子任务',
    'tasks.priority.urgent': 'P1 紧急',
    'tasks.priority.high': 'P2 高',
    'tasks.priority.medium': 'P3 中',
    'tasks.priority.low': 'P4 低',
    'tasks.status.todo': '待办',
    'tasks.status.in.progress': '进行中',
    'tasks.status.blocked': '已阻止',
    'tasks.status.done': '已完成',
    'tasks.no.due.date': '无截止日期',
    'tasks.set.due.date': '设置截止日期',
    
    // Invoices
    'invoices.title': '发票',
    'invoices.description': '创建、管理和跟踪您的发票。',
    'invoices.new.invoice': '新发票',
    'invoices.mark.sent': '标记为已发送',
    'invoices.mark.paid': '标记为已付款',
    'invoices.not.found': '未找到发票（演示）。',
    'invoices.deleted': '发票已删除',
    'invoices.updating': '更新中...',
    
    // Calendar
    'calendar.title': '日历',
    'calendar.description': '以日历格式查看您的任务和事件。',
    
    // Network
    'network.title': '网络',
    'network.description': '与其他专业人士联系并扩展您的网络。',
    
    // Stats
    'stats.title': '统计',
    'stats.description': '查看详细分析和性能指标。',
    
    // Profile
    'profile.title': '个人资料',
    'profile.description': '管理您的账户设置和偏好。',
    'profile.complete.fields': '请完成主机、端口、用户名和密码。',
    
    // Support
    'support.title': '支持',
    'support.description': '获取账户帮助和支持。',
    'support.faq.title': '常见问题',
    'support.faq.trial': '免费试用如何运作？',
    'support.faq.trial.answer': '您有7天时间使用所有功能。试用结束前不会扣费。',
    'support.faq.platforms': '我可以连接我的平台（Fiverr、Upwork）吗？',
    'support.faq.platforms.answer': '是的，您可以在一个地方跟踪多平台的客户和订单。',
    'support.faq.invoices': '发票和付款？',
    'support.faq.invoices.answer': '您创建发票，付款直接转到您连接的Stripe账户。',
    'support.faq.security': '我的数据安全吗？',
    'support.faq.security.answer': '我们使用Supabase和企业级安全实践（加密、RBAC）。',
    'support.faq.cancel': '我可以随时取消吗？',
    'support.faq.cancel.answer': '是的。您可以随时从计费页面取消或更改计划。',
  },
  it: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clienti',
    'nav.orders': 'Ordini',
    'nav.tasks': 'Attività',
    'nav.invoices': 'Fatture',
    'nav.calendar': 'Calendario',
    'nav.network': 'Rete',
    'nav.stats': 'Statistiche',
    'nav.profile': 'Profilo',
    'nav.support': 'Supporto',
    'nav.todo': 'Lista delle cose da fare',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Aggiorna',
    
    // Search
    'search.placeholder': 'Cerca...',
    'search.all': 'Tutto',
    'search.clients': 'Clienti',
    'search.orders': 'Ordini',
    'search.tasks': 'Attività',
    'search.invoices': 'Fatture',
    'search.calendar': 'Calendario',
    'search.network': 'Rete',
    
    // Common
    'common.new': 'Nuovo',
    'common.edit': 'Modifica',
    'common.delete': 'Elimina',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.close': 'Chiudi',
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.status': 'Stato',
    'common.priority': 'Priorità',
    'common.date': 'Data',
    'common.name': 'Nome',
    'common.email': 'Email',
    'common.company': 'Azienda',
    'common.platform': 'Piattaforma',
    'common.country': 'Paese',
    'common.all': 'Tutti',
    'common.none': 'Nessuno',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.success': 'Successo',
    'common.warning': 'Avviso',
    'common.info': 'Informazione',
    'common.language': 'Lingua',
    'common.no.results': 'Nessun risultato trovato',
    'common.try.different.search': 'Prova un termine diverso',
    
    // Dashboard
    'dashboard.welcome': 'Bentornato',
    'dashboard.welcome.guest': 'Benvenuto nella tua Dashboard',
    'dashboard.quick.actions': 'Azioni Rapide',
    'dashboard.add.client': 'Aggiungi Cliente',
    'dashboard.add.order': 'Aggiungi Ordine',
    'dashboard.add.task': 'Aggiungi Attività',
    'dashboard.add.invoice': 'Aggiungi Fattura',
    'dashboard.add.todo': 'Aggiungi Lista Attività',
    
    // Clients
    'clients.title': 'Clienti',
    'clients.description': 'Cerca, filtra e gestisci i tuoi clienti.',
    'clients.new.client': 'Nuovo cliente',
    'clients.no.results': 'Nessun cliente trovato.',
    'clients.adjust.filters': 'Modifica i tuoi filtri o crea un nuovo cliente.',
    'clients.status.prospect': 'Prospect',
    'clients.status.active': 'Attivo',
    'clients.status.inactive': 'Inattivo',
    'clients.status.completed': 'Progetto completato',
    
    // Orders
    'orders.title': 'Ordini',
    'orders.description': 'Traccia, filtra e gestisci tutti i tuoi ordini clienti.',
    'orders.new.order': 'Nuovo ordine',
    'orders.no.results': 'Nessun ordine trovato.',
    'orders.adjust.filters': 'Modifica i tuoi filtri o crea un nuovo ordine.',
    'orders.status.pending': 'In attesa',
    'orders.status.in.progress': 'In corso',
    'orders.status.completed': 'Completato',
    'orders.created.on': 'Creato il',
    
    // Tasks
    'tasks.title': 'Attività',
    'tasks.description': 'Pianifica, organizza ed esegui — sottotask illimitati, selettore colori avanzato e colonne personalizzabili.',
    'tasks.new.task': 'Nuova attività',
    'tasks.add.subtask': 'Aggiungi Sottotask',
    'tasks.priority.urgent': 'P1 Urgente',
    'tasks.priority.high': 'P2 Alto',
    'tasks.priority.medium': 'P3 Medio',
    'tasks.priority.low': 'P4 Basso',
    'tasks.status.todo': 'Da fare',
    'tasks.status.in.progress': 'In corso',
    'tasks.status.blocked': 'Bloccato',
    'tasks.status.done': 'Completato',
    'tasks.no.due.date': 'Nessuna scadenza',
    'tasks.set.due.date': 'Imposta scadenza',
    
    // Invoices
    'invoices.title': 'Fatture',
    'invoices.description': 'Crea, gestisci e traccia le tue fatture.',
    'invoices.new.invoice': 'Nuova fattura',
    'invoices.mark.sent': 'Segna come inviata',
    'invoices.mark.paid': 'Segna come pagata',
    'invoices.not.found': 'Fattura non trovata (demo).',
    'invoices.deleted': 'Fattura eliminata',
    'invoices.updating': 'Aggiornamento...',
    
    // Calendar
    'calendar.title': 'Calendario',
    'calendar.description': 'Visualizza le tue attività ed eventi in formato calendario.',
    
    // Network
    'network.title': 'Rete',
    'network.description': 'Connettiti con altri professionisti e fai crescere la tua rete.',
    
    // Stats
    'stats.title': 'Statistiche',
    'stats.description': 'Visualizza analisi dettagliate e metriche di performance.',
    
    // Profile
    'profile.title': 'Profilo',
    'profile.description': 'Gestisci le impostazioni del tuo account e le preferenze.',
    'profile.complete.fields': 'Per favore completa host, port, username e password.',
    
    // Support
    'support.title': 'Supporto',
    'support.description': 'Ottieni aiuto e supporto per il tuo account.',
    'support.faq.title': 'Domande Frequenti',
    'support.faq.trial': 'Come funziona la prova gratuita?',
    'support.faq.trial.answer': 'Hai 7 giorni con tutte le funzionalità. Nessuna carta viene addebitata prima della fine della prova.',
    'support.faq.platforms': 'Posso collegare le mie piattaforme (Fiverr, Upwork)?',
    'support.faq.platforms.answer': 'Sì, puoi tracciare i tuoi clienti e ordini multi-piattaforma in un unico posto.',
    'support.faq.invoices': 'Fatture e pagamenti?',
    'support.faq.invoices.answer': 'Crei le tue fatture e il pagamento va direttamente al tuo account Stripe collegato.',
    'support.faq.security': 'I miei dati sono sicuri?',
    'support.faq.security.answer': 'Utilizziamo Supabase e pratiche di sicurezza di livello aziendale (crittografia, RBAC).',
    'support.faq.cancel': 'Posso cancellare in qualsiasi momento?',
    'support.faq.cancel.answer': 'Sì. Puoi cancellare o cambiare il tuo piano dalla pagina di fatturazione in qualsiasi momento.',
  },
  pt: {
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.clients': 'Clientes',
    'nav.orders': 'Pedidos',
    'nav.tasks': 'Tarefas',
    'nav.invoices': 'Faturas',
    'nav.calendar': 'Calendário',
    'nav.network': 'Rede',
    'nav.stats': 'Estatísticas',
    'nav.profile': 'Perfil',
    'nav.support': 'Suporte',
    'nav.todo': 'Lista de tarefas',
    'nav.admin': 'Admin',
    'nav.upgrade': 'Atualizar',
    
    // Search
    'search.placeholder': 'Pesquisar...',
    'search.all': 'Tudo',
    'search.clients': 'Clientes',
    'search.orders': 'Pedidos',
    'search.tasks': 'Tarefas',
    'search.invoices': 'Faturas',
    'search.calendar': 'Calendário',
    'search.network': 'Rede',
    
    // Common
    'common.new': 'Novo',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.close': 'Fechar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.status': 'Status',
    'common.priority': 'Prioridade',
    'common.date': 'Data',
    'common.name': 'Nome',
    'common.email': 'Email',
    'common.company': 'Empresa',
    'common.platform': 'Plataforma',
    'common.country': 'País',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.warning': 'Aviso',
    'common.info': 'Informação',
    'common.language': 'Idioma',
    'common.no.results': 'Nenhum resultado encontrado',
    'common.try.different.search': 'Tente um termo diferente',
    
    // Dashboard
    'dashboard.welcome': 'Bem-vindo de volta',
    'dashboard.welcome.guest': 'Bem-vindo ao seu Painel',
    'dashboard.quick.actions': 'Ações Rápidas',
    'dashboard.add.client': 'Adicionar Cliente',
    'dashboard.add.order': 'Adicionar Pedido',
    'dashboard.add.task': 'Adicionar Tarefa',
    'dashboard.add.invoice': 'Adicionar Fatura',
    'dashboard.add.todo': 'Adicionar Lista de Tarefas',
    
    // Clients
    'clients.title': 'Clientes',
    'clients.description': 'Pesquise, filtre e gerencie seus clientes.',
    'clients.new.client': 'Novo cliente',
    'clients.no.results': 'Nenhum cliente encontrado.',
    'clients.adjust.filters': 'Ajuste seus filtros ou crie um novo cliente.',
    'clients.status.prospect': 'Prospect',
    'clients.status.active': 'Ativo',
    'clients.status.inactive': 'Inativo',
    'clients.status.completed': 'Projeto concluído',
    
    // Orders
    'orders.title': 'Pedidos',
    'orders.description': 'Rastreie, filtre e gerencie todos os seus pedidos de clientes.',
    'orders.new.order': 'Novo pedido',
    'orders.no.results': 'Nenhum pedido encontrado.',
    'orders.adjust.filters': 'Ajuste seus filtros ou crie um novo pedido.',
    'orders.status.pending': 'Pendente',
    'orders.status.in.progress': 'Em Andamento',
    'orders.status.completed': 'Concluído',
    'orders.created.on': 'Criado em',
    
    // Tasks
    'tasks.title': 'Tarefas',
    'tasks.description': 'Planeje, organize e execute — subtarefas ilimitadas, seletor de cores avançado e colunas personalizáveis.',
    'tasks.new.task': 'Nova tarefa',
    'tasks.add.subtask': 'Adicionar Subtarefa',
    'tasks.priority.urgent': 'P1 Urgente',
    'tasks.priority.high': 'P2 Alto',
    'tasks.priority.medium': 'P3 Médio',
    'tasks.priority.low': 'P4 Baixo',
    'tasks.status.todo': 'A fazer',
    'tasks.status.in.progress': 'Em Andamento',
    'tasks.status.blocked': 'Bloqueado',
    'tasks.status.done': 'Concluído',
    'tasks.no.due.date': 'Sem data de vencimento',
    'tasks.set.due.date': 'Definir data de vencimento',
    
    // Invoices
    'invoices.title': 'Faturas',
    'invoices.description': 'Crie, gerencie e rastreie suas faturas.',
    'invoices.new.invoice': 'Nova fatura',
    'invoices.mark.sent': 'Marcar como enviada',
    'invoices.mark.paid': 'Marcar como paga',
    'invoices.not.found': 'Fatura não encontrada (demo).',
    'invoices.deleted': 'Fatura excluída',
    'invoices.updating': 'Atualizando...',
    
    // Calendar
    'calendar.title': 'Calendário',
    'calendar.description': 'Visualize suas tarefas e eventos em formato de calendário.',
    
    // Network
    'network.title': 'Rede',
    'network.description': 'Conecte-se com outros profissionais e expanda sua rede.',
    
    // Stats
    'stats.title': 'Estatísticas',
    'stats.description': 'Visualize análises detalhadas e métricas de performance.',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.description': 'Gerencie as configurações da sua conta e preferências.',
    'profile.complete.fields': 'Por favor, complete host, port, username e password.',
    
    // Support
    'support.title': 'Suporte',
    'support.description': 'Obtenha ajuda e suporte para sua conta.',
    'support.faq.title': 'Perguntas Frequentes',
    'support.faq.trial': 'Como funciona o teste gratuito?',
    'support.faq.trial.answer': 'Você tem 7 dias com todos os recursos. Nenhum cartão é cobrado antes do final do teste.',
    'support.faq.platforms': 'Posso conectar minhas plataformas (Fiverr, Upwork)?',
    'support.faq.platforms.answer': 'Sim, você pode rastrear seus clientes e pedidos em múltiplas plataformas em um só lugar.',
    'support.faq.invoices': 'Faturas e pagamentos?',
    'support.faq.invoices.answer': 'Você cria suas faturas e o pagamento vai diretamente para sua conta Stripe conectada.',
    'support.faq.security': 'Meus dados estão seguros?',
    'support.faq.security.answer': 'Usamos Supabase e práticas de segurança de nível empresarial (criptografia, RBAC).',
    'support.faq.cancel': 'Posso cancelar a qualquer momento?',
    'support.faq.cancel.answer': 'Sim. Você pode cancelar ou alterar seu plano na página de cobrança a qualquer momento.',
  },
  ru: {
    // Navigation
    'nav.dashboard': 'Панель управления',
    'nav.clients': 'Клиенты',
    'nav.orders': 'Заказы',
    'nav.tasks': 'Задачи',
    'nav.invoices': 'Счета',
    'nav.calendar': 'Календарь',
    'nav.network': 'Сеть',
    'nav.stats': 'Статистика',
    'nav.profile': 'Профиль',
    'nav.support': 'Поддержка',
    'nav.todo': 'Список дел',
    'nav.admin': 'Админ',
    'nav.upgrade': 'Обновить',
    
    // Search
    'search.placeholder': 'Поиск...',
    'search.all': 'Все',
    'search.clients': 'Клиенты',
    'search.orders': 'Заказы',
    'search.tasks': 'Задачи',
    'search.invoices': 'Счета',
    'search.calendar': 'Календарь',
    'search.network': 'Сеть',
    
    // Common
    'common.new': 'Новый',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.close': 'Закрыть',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.status': 'Статус',
    'common.priority': 'Приоритет',
    'common.date': 'Дата',
    'common.name': 'Имя',
    'common.email': 'Email',
    'common.company': 'Компания',
    'common.platform': 'Платформа',
    'common.country': 'Страна',
    'common.all': 'Все',
    'common.none': 'Нет',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успех',
    'common.warning': 'Предупреждение',
    'common.info': 'Информация',
    'common.language': 'Язык',
    'common.no.results': 'Результаты не найдены',
    'common.try.different.search': 'Попробуйте другой поисковый запрос',
    
    // Dashboard
    'dashboard.welcome': 'Добро пожаловать',
    'dashboard.welcome.guest': 'Добро пожаловать на вашу панель управления',
    'dashboard.quick.actions': 'Быстрые действия',
    'dashboard.add.client': 'Добавить клиента',
    'dashboard.add.order': 'Добавить заказ',
    'dashboard.add.task': 'Добавить задачу',
    'dashboard.add.invoice': 'Добавить счет',
    'dashboard.add.todo': 'Добавить список дел',
    
    // Clients
    'clients.title': 'Клиенты',
    'clients.description': 'Ищите, фильтруйте и управляйте своими клиентами.',
    'clients.new.client': 'Новый клиент',
    'clients.no.results': 'Клиенты не найдены.',
    'clients.adjust.filters': 'Настройте фильтры или создайте нового клиента.',
    'clients.status.prospect': 'Потенциальный клиент',
    'clients.status.active': 'Активный',
    'clients.status.inactive': 'Неактивный',
    'clients.status.completed': 'Проект завершен',
    
    // Orders
    'orders.title': 'Заказы',
    'orders.description': 'Отслеживайте, фильтруйте и управляйте всеми заказами клиентов.',
    'orders.new.order': 'Новый заказ',
    'orders.no.results': 'Заказы не найдены.',
    'orders.adjust.filters': 'Настройте фильтры или создайте новый заказ.',
    'orders.status.pending': 'В ожидании',
    'orders.status.in.progress': 'В процессе',
    'orders.status.completed': 'Завершен',
    'orders.created.on': 'Создан',
    
    // Tasks
    'tasks.title': 'Задачи',
    'tasks.description': 'Планируйте, организуйте и выполняйте — неограниченные подзадачи, продвинутый выбор цветов и настраиваемые колонки.',
    'tasks.new.task': 'Новая задача',
    'tasks.add.subtask': 'Добавить подзадачу',
    'tasks.priority.urgent': 'P1 Срочно',
    'tasks.priority.high': 'P2 Высокий',
    'tasks.priority.medium': 'P3 Средний',
    'tasks.priority.low': 'P4 Низкий',
    'tasks.status.todo': 'К выполнению',
    'tasks.status.in.progress': 'В процессе',
    'tasks.status.blocked': 'Заблокировано',
    'tasks.status.done': 'Выполнено',
    'tasks.no.due.date': 'Без срока',
    'tasks.set.due.date': 'Установить срок',
    
    // Invoices
    'invoices.title': 'Счета',
    'invoices.description': 'Создавайте, управляйте и отслеживайте свои счета.',
    'invoices.new.invoice': 'Новый счет',
    'invoices.mark.sent': 'Отметить как отправленный',
    'invoices.mark.paid': 'Отметить как оплаченный',
    'invoices.not.found': 'Счет не найден (демо).',
    'invoices.deleted': 'Счет удален',
    'invoices.updating': 'Обновление...',
    
    // Calendar
    'calendar.title': 'Календарь',
    'calendar.description': 'Просматривайте свои задачи и события в формате календаря.',
    
    // Network
    'network.title': 'Сеть',
    'network.description': 'Подключайтесь к другим профессионалам и расширяйте свою сеть.',
    
    // Stats
    'stats.title': 'Статистика',
    'stats.description': 'Просматривайте детальную аналитику и метрики производительности.',
    
    // Profile
    'profile.title': 'Профиль',
    'profile.description': 'Управляйте настройками аккаунта и предпочтениями.',
    'profile.complete.fields': 'Пожалуйста, заполните host, port, username и password.',
    
    // Support
    'support.title': 'Поддержка',
    'support.description': 'Получите помощь и поддержку для вашего аккаунта.',
    'support.faq.title': 'Часто задаваемые вопросы',
    'support.faq.trial': 'Как работает бесплатная пробная версия?',
    'support.faq.trial.answer': 'У вас есть 7 дней со всеми функциями. Никакая карта не списывается до окончания пробного периода.',
    'support.faq.platforms': 'Могу ли я подключить свои платформы (Fiverr, Upwork)?',
    'support.faq.platforms.answer': 'Да, вы можете отслеживать своих клиентов и заказы на нескольких платформах в одном месте.',
    'support.faq.invoices': 'Счета и платежи?',
    'support.faq.invoices.answer': 'Вы создаете свои счета, и платеж идет напрямую на ваш подключенный аккаунт Stripe.',
    'support.faq.security': 'Безопасны ли мои данные?',
    'support.faq.security.answer': 'Мы используем Supabase и корпоративные практики безопасности (шифрование, RBAC).',
    'support.faq.cancel': 'Могу ли я отменить в любое время?',
    'support.faq.cancel.answer': 'Да. Вы можете отменить или изменить свой план на странице выставления счетов в любое время.',
  },
  ja: {
    // Navigation
    'nav.dashboard': 'ダッシュボード',
    'nav.clients': 'クライアント',
    'nav.orders': '注文',
    'nav.tasks': 'タスク',
    'nav.invoices': '請求書',
    'nav.calendar': 'カレンダー',
    'nav.network': 'ネットワーク',
    'nav.stats': '統計',
    'nav.profile': 'プロフィール',
    'nav.support': 'サポート',
    'nav.todo': 'To-Doリスト',
    'nav.admin': '管理者',
    'nav.upgrade': 'アップグレード',
    
    // Search
    'search.placeholder': '検索...',
    'search.all': 'すべて',
    'search.clients': 'クライアント',
    'search.orders': '注文',
    'search.tasks': 'タスク',
    'search.invoices': '請求書',
    'search.calendar': 'カレンダー',
    'search.network': 'ネットワーク',
    
    // Common
    'common.new': '新規',
    'common.edit': '編集',
    'common.delete': '削除',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.close': '閉じる',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.status': 'ステータス',
    'common.priority': '優先度',
    'common.date': '日付',
    'common.name': '名前',
    'common.email': 'メール',
    'common.company': '会社',
    'common.platform': 'プラットフォーム',
    'common.country': '国',
    'common.all': 'すべて',
    'common.none': 'なし',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '情報',
    'common.language': '言語',
    'common.no.results': '結果が見つかりません',
    'common.try.different.search': '別の検索語を試してください',
    
    // Dashboard
    'dashboard.welcome': 'おかえりなさい',
    'dashboard.welcome.guest': 'ダッシュボードへようこそ',
    'dashboard.quick.actions': 'クイックアクション',
    'dashboard.add.client': 'クライアント追加',
    'dashboard.add.order': '注文追加',
    'dashboard.add.task': 'タスク追加',
    'dashboard.add.invoice': '請求書追加',
    'dashboard.add.todo': 'To-Doリスト追加',
    
    // Clients
    'clients.title': 'クライアント',
    'clients.description': 'クライアントを検索、フィルター、管理します。',
    'clients.new.client': '新しいクライアント',
    'clients.no.results': 'クライアントが見つかりません。',
    'clients.adjust.filters': 'フィルターを調整するか、新しいクライアントを作成してください。',
    'clients.status.prospect': '見込み客',
    'clients.status.active': 'アクティブ',
    'clients.status.inactive': '非アクティブ',
    'clients.status.completed': 'プロジェクト完了',
    
    // Orders
    'orders.title': '注文',
    'orders.description': 'すべてのクライアント注文を追跡、フィルター、管理します。',
    'orders.new.order': '新しい注文',
    'orders.no.results': '注文が見つかりません。',
    'orders.adjust.filters': 'フィルターを調整するか、新しい注文を作成してください。',
    'orders.status.pending': '保留中',
    'orders.status.in.progress': '進行中',
    'orders.status.completed': '完了',
    'orders.created.on': '作成日',
    
    // Tasks
    'tasks.title': 'タスク',
    'tasks.description': '計画、整理、実行 — 無制限のサブタスク、高度なカラーセレクター、カスタマイズ可能な列。',
    'tasks.new.task': '新しいタスク',
    'tasks.add.subtask': 'サブタスク追加',
    'tasks.priority.urgent': 'P1 緊急',
    'tasks.priority.high': 'P2 高',
    'tasks.priority.medium': 'P3 中',
    'tasks.priority.low': 'P4 低',
    'tasks.status.todo': 'To Do',
    'tasks.status.in.progress': '進行中',
    'tasks.status.blocked': 'ブロック',
    'tasks.status.done': '完了',
    'tasks.no.due.date': '期限なし',
    'tasks.set.due.date': '期限設定',
    
    // Invoices
    'invoices.title': '請求書',
    'invoices.description': '請求書を作成、管理、追跡します。',
    'invoices.new.invoice': '新しい請求書',
    'invoices.mark.sent': '送信済みとしてマーク',
    'invoices.mark.paid': '支払済みとしてマーク',
    'invoices.not.found': '請求書が見つかりません（デモ）。',
    'invoices.deleted': '請求書を削除しました',
    'invoices.updating': '更新中...',
    
    // Calendar
    'calendar.title': 'カレンダー',
    'calendar.description': 'カレンダー形式でタスクとイベントを表示します。',
    
    // Network
    'network.title': 'ネットワーク',
    'network.description': '他の専門家とつながり、ネットワークを拡大します。',
    
    // Stats
    'stats.title': '統計',
    'stats.description': '詳細な分析とパフォーマンス指標を表示します。',
    
    // Profile
    'profile.title': 'プロフィール',
    'profile.description': 'アカウント設定と環境設定を管理します。',
    'profile.complete.fields': 'ホスト、ポート、ユーザー名、パスワードを入力してください。',
    
    // Support
    'support.title': 'サポート',
    'support.description': 'アカウントのヘルプとサポートを取得します。',
    'support.faq.title': 'よくある質問',
    'support.faq.trial': '無料トライアルはどのように機能しますか？',
    'support.faq.trial.answer': 'すべての機能を7日間利用できます。トライアル終了までカードは課金されません。',
    'support.faq.platforms': 'プラットフォーム（Fiverr、Upwork）を接続できますか？',
    'support.faq.platforms.answer': 'はい、複数のプラットフォームのクライアントと注文を一箇所で追跡できます。',
    'support.faq.invoices': '請求書と支払い？',
    'support.faq.invoices.answer': '請求書を作成し、支払いは接続されたStripeアカウントに直接送られます。',
    'support.faq.security': '私のデータは安全ですか？',
    'support.faq.security.answer': 'Supabaseとエンタープライズレベルのセキュリティ実践（暗号化、RBAC）を使用しています。',
    'support.faq.cancel': 'いつでもキャンセルできますか？',
    'support.faq.cancel.answer': 'はい。いつでも請求ページからキャンセルまたはプランを変更できます。',
  },
  ko: {
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.clients': '클라이언트',
    'nav.orders': '주문',
    'nav.tasks': '작업',
    'nav.invoices': '송장',
    'nav.calendar': '캘린더',
    'nav.network': '네트워크',
    'nav.stats': '통계',
    'nav.profile': '프로필',
    'nav.support': '지원',
    'nav.todo': '할 일 목록',
    'nav.admin': '관리자',
    'nav.upgrade': '업그레이드',
    
    // Search
    'search.placeholder': '검색...',
    'search.all': '모두',
    'search.clients': '클라이언트',
    'search.orders': '주문',
    'search.tasks': '작업',
    'search.invoices': '송장',
    'search.calendar': '캘린더',
    'search.network': '네트워크',
    
    // Common
    'common.new': '새로 만들기',
    'common.edit': '편집',
    'common.delete': '삭제',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.close': '닫기',
    'common.search': '검색',
    'common.filter': '필터',
    'common.status': '상태',
    'common.priority': '우선순위',
    'common.date': '날짜',
    'common.name': '이름',
    'common.email': '이메일',
    'common.company': '회사',
    'common.platform': '플랫폼',
    'common.country': '국가',
    'common.all': '모두',
    'common.none': '없음',
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.success': '성공',
    'common.warning': '경고',
    'common.info': '정보',
    'common.language': '언어',
    'common.no.results': '결과를 찾을 수 없습니다',
    'common.try.different.search': '다른 검색어를 시도해보세요',
    
    // Dashboard
    'dashboard.welcome': '다시 오신 것을 환영합니다',
    'dashboard.welcome.guest': '대시보드에 오신 것을 환영합니다',
    'dashboard.quick.actions': '빠른 작업',
    'dashboard.add.client': '클라이언트 추가',
    'dashboard.add.order': '주문 추가',
    'dashboard.add.task': '작업 추가',
    'dashboard.add.invoice': '송장 추가',
    'dashboard.add.todo': '할 일 목록 추가',
    
    // Clients
    'clients.title': '클라이언트',
    'clients.description': '클라이언트를 검색, 필터링 및 관리합니다.',
    'clients.new.client': '새 클라이언트',
    'clients.no.results': '클라이언트를 찾을 수 없습니다.',
    'clients.adjust.filters': '필터를 조정하거나 새 클라이언트를 만드세요.',
    'clients.status.prospect': '잠재 고객',
    'clients.status.active': '활성',
    'clients.status.inactive': '비활성',
    'clients.status.completed': '프로젝트 완료',
    
    // Orders
    'orders.title': '주문',
    'orders.description': '모든 클라이언트 주문을 추적, 필터링 및 관리합니다.',
    'orders.new.order': '새 주문',
    'orders.no.results': '주문을 찾을 수 없습니다.',
    'orders.adjust.filters': '필터를 조정하거나 새 주문을 만드세요.',
    'orders.status.pending': '대기 중',
    'orders.status.in.progress': '진행 중',
    'orders.status.completed': '완료',
    'orders.created.on': '생성일',
    
    // Tasks
    'tasks.title': '작업',
    'tasks.description': '계획, 정리 및 실행 — 무제한 하위 작업, 고급 색상 선택기 및 사용자 정의 가능한 열.',
    'tasks.new.task': '새 작업',
    'tasks.add.subtask': '하위 작업 추가',
    'tasks.priority.urgent': 'P1 긴급',
    'tasks.priority.high': 'P2 높음',
    'tasks.priority.medium': 'P3 중간',
    'tasks.priority.low': 'P4 낮음',
    'tasks.status.todo': '할 일',
    'tasks.status.in.progress': '진행 중',
    'tasks.status.blocked': '차단됨',
    'tasks.status.done': '완료',
    'tasks.no.due.date': '마감일 없음',
    'tasks.set.due.date': '마감일 설정',
    
    // Invoices
    'invoices.title': '송장',
    'invoices.description': '송장을 생성, 관리 및 추적합니다.',
    'invoices.new.invoice': '새 송장',
    'invoices.mark.sent': '전송됨으로 표시',
    'invoices.mark.paid': '결제됨으로 표시',
    'invoices.not.found': '송장을 찾을 수 없습니다 (데모).',
    'invoices.deleted': '송장 삭제됨',
    'invoices.updating': '업데이트 중...',
    
    // Calendar
    'calendar.title': '캘린더',
    'calendar.description': '캘린더 형식으로 작업과 이벤트를 봅니다.',
    
    // Network
    'network.title': '네트워크',
    'network.description': '다른 전문가들과 연결하고 네트워크를 확장합니다.',
    
    // Stats
    'stats.title': '통계',
    'stats.description': '상세한 분석과 성능 지표를 봅니다.',
    
    // Profile
    'profile.title': '프로필',
    'profile.description': '계정 설정과 환경 설정을 관리합니다.',
    'profile.complete.fields': '호스트, 포트, 사용자 이름 및 비밀번호를 완성해 주세요.',
    
    // Support
    'support.title': '지원',
    'support.description': '계정에 대한 도움과 지원을 받으세요.',
    'support.faq.title': '자주 묻는 질문',
    'support.faq.trial': '무료 체험은 어떻게 작동하나요?',
    'support.faq.trial.answer': '모든 기능을 7일간 사용할 수 있습니다. 체험 종료 전까지 카드가 청구되지 않습니다.',
    'support.faq.platforms': '내 플랫폼(Fiverr, Upwork)을 연결할 수 있나요?',
    'support.faq.platforms.answer': '네, 여러 플랫폼의 클라이언트와 주문을 한 곳에서 추적할 수 있습니다.',
    'support.faq.invoices': '송장과 결제?',
    'support.faq.invoices.answer': '송장을 생성하고 결제는 연결된 Stripe 계정으로 직접 이동합니다.',
    'support.faq.security': '내 데이터가 안전한가요?',
    'support.faq.security.answer': 'Supabase와 엔터프라이즈급 보안 관행(암호화, RBAC)을 사용합니다.',
    'support.faq.cancel': '언제든지 취소할 수 있나요?',
    'support.faq.cancel.answer': '네. 언제든지 청구 페이지에서 취소하거나 플랜을 변경할 수 있습니다.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'fr', 'es', 'de', 'zh', 'it', 'pt', 'ru', 'ja', 'ko'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Par défaut, utiliser l'anglais
      setLanguage('en');
      localStorage.setItem('language', 'en');
    }
  }, []);

  // Sauvegarder la langue quand elle change
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Fonction de traduction avec fallback
  const t = (key: string): string => {
    const translation = translations[language]?.[key as keyof typeof translations[typeof language]];
    if (translation) {
      return translation;
    }
    // Fallback vers l'anglais si la traduction n'existe pas
    const englishTranslation = translations.en?.[key as keyof typeof translations.en];
    if (englishTranslation) {
      return englishTranslation;
    }
    // Si aucune traduction n'existe, retourner la clé
    return key;
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
