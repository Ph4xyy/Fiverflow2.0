import { useState, useEffect } from 'react';

// Types pour les traductions
type TranslationKeys = {
  profile: {
    title: string;
    subtitle: string;
    editProfile: string;
    saveChanges: string;
    cancel: string;
    loading: string;
    saved: string;
    error: string;
    sections: {
      personal: string;
      professional: string;
      social: string;
      privacy: string;
      skills: string;
      awards: string;
      projects: string;
      activity: string;
    };
    fields: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      bio: string;
      website: string;
      linkedin: string;
      twitter: string;
      github: string;
      portfolio: string;
      company: string;
      position: string;
      experience: string;
      education: string;
      languages: string;
      availability: string;
      rate: string;
      currency: string;
    };
    privacy: {
      title: string;
      profileVisibility: string;
      public: string;
      private: string;
      contacts: string;
      showEmail: string;
      showPhone: string;
      showLocation: string;
      showRate: string;
      allowMessages: string;
      showOnlineStatus: string;
    };
    stats: {
      projects: string;
      clients: string;
      reviews: string;
      rating: string;
      experience: string;
      years: string;
      completed: string;
      inProgress: string;
      totalEarnings: string;
      thisMonth: string;
    };
  };
  referrals: {
    title: string;
    subtitle: string;
    yourCode: string;
    copyCode: string;
    shareLink: string;
    copied: string;
    tabs: {
      overview: string;
      referrals: string;
      commissions: string;
    };
    stats: {
      totalReferrals: string;
      activeReferrals: string;
      totalCommissions: string;
      pendingCommissions: string;
      thisMonth: string;
      lastMonth: string;
    };
    howItWorks: {
      title: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
    };
    benefits: {
      title: string;
      commission: string;
      bonus: string;
      lifetime: string;
      noLimit: string;
    };
    referralList: {
      title: string;
      name: string;
      email: string;
      joinedDate: string;
      status: string;
      commission: string;
      actions: string;
      noReferrals: string;
      inviteMore: string;
    };
    commissionHistory: {
      title: string;
      date: string;
      referral: string;
      amount: string;
      status: string;
      description: string;
      pending: string;
      paid: string;
      cancelled: string;
      noCommissions: string;
    };
    share: {
      title: string;
      socialMedia: string;
      email: string;
      whatsapp: string;
      telegram: string;
      copyLink: string;
      generateQR: string;
      customMessage: string;
      preview: string;
    };
    terms: {
      title: string;
      content: string;
    };
  };
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    remove: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    confirm: string;
    yes: string;
    no: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    import: string;
    refresh: string;
    copy: string;
    share: string;
    download: string;
    upload: string;
    view: string;
    hide: string;
    show: string;
    enable: string;
    disable: string;
    on: string;
    off: string;
    public: string;
    private: string;
    active: string;
    inactive: string;
    pending: string;
    completed: string;
    cancelled: string;
    draft: string;
    published: string;
    archived: string;
  };
};

type Language = 'fr' | 'en';

interface UseTranslationReturn {
  t: TranslationKeys;
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

// Cache pour les traductions
const translationCache: Record<Language, TranslationKeys | null> = {
  fr: null,
  en: null,
};

export const useTranslation = (): UseTranslationReturn => {
  const [language, setLanguageState] = useState<Language>('fr');
  const [translations, setTranslations] = useState<TranslationKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les traductions
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier le cache
        if (translationCache[language]) {
          setTranslations(translationCache[language]);
          setIsLoading(false);
          return;
        }

        // Charger depuis le fichier
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load ${language} translations`);
        }
        
        const data = await response.json();
        translationCache[language] = data;
        setTranslations(data);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback vers les traductions par défaut
        setTranslations(translationCache['fr'] || {} as TranslationKeys);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
  };

  // Initialiser la langue depuis le localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  return {
    t: translations || ({} as TranslationKeys),
    language,
    setLanguage,
    isLoading,
  };
};

// Hook simplifié pour les traductions courantes
export const useT = () => {
  const { t, language, setLanguage } = useTranslation();
  
  return {
    t,
    language,
    setLanguage,
  };
};
