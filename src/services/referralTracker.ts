/**
 * Service de tracking des codes de parrainage
 * Gère la détection, le stockage et la persistance des codes de parrainage
 */

export class ReferralTracker {
  private static readonly STORAGE_KEY = 'fiverflow_referral_code';
  private static readonly COOKIE_NAME = 'fiverflow_referral';
  private static readonly COOKIE_EXPIRY_DAYS = 30;

  /**
   * Détecter et stocker un code de parrainage depuis l'URL
   */
  static detectAndStoreReferralCode(url?: string): string | null {
    const targetUrl = url || window.location.href;
    const urlParams = new URLSearchParams(new URL(targetUrl).search);
    const referralCode = urlParams.get('ref');

    if (referralCode && this.isValidReferralCode(referralCode)) {
      this.storeReferralCode(referralCode);
      console.log('🎯 Referral code detected and stored:', referralCode);
      return referralCode;
    }

    return null;
  }

  /**
   * Stocker le code de parrainage dans localStorage et cookie
   */
  static storeReferralCode(code: string): void {
    try {
      // Stocker dans localStorage
      localStorage.setItem(this.STORAGE_KEY, code);
      
      // Stocker dans un cookie pour la persistance cross-domain
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);
      
      document.cookie = `${this.COOKIE_NAME}=${code}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
      console.log('✅ Referral code stored:', code);
    } catch (error) {
      console.error('Error storing referral code:', error);
    }
  }

  /**
   * Récupérer le code de parrainage stocké
   */
  static getStoredReferralCode(): string | null {
    try {
      // Essayer localStorage d'abord
      const fromLocalStorage = localStorage.getItem(this.STORAGE_KEY);
      if (fromLocalStorage) {
        return fromLocalStorage;
      }

      // Essayer le cookie
      const fromCookie = this.getCookie(this.COOKIE_NAME);
      if (fromCookie) {
        return fromCookie;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving referral code:', error);
      return null;
    }
  }

  /**
   * Nettoyer le code de parrainage après utilisation
   */
  static clearReferralCode(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      console.log('🧹 Referral code cleared');
    } catch (error) {
      console.error('Error clearing referral code:', error);
    }
  }

  /**
   * Valider le format du code de parrainage
   */
  private static isValidReferralCode(code: string): boolean {
    // Format: FXR-XXXX où XXXX est un nombre de 4 chiffres
    const pattern = /^FXR-\d{4}$/;
    return pattern.test(code);
  }

  /**
   * Récupérer un cookie par nom
   */
  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Vérifier si un code de parrainage est actif
   */
  static hasActiveReferralCode(): boolean {
    return this.getStoredReferralCode() !== null;
  }

  /**
   * Générer un lien de parrainage
   */
  static generateReferralLink(referralCode: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/register?ref=${referralCode}`;
  }

  /**
   * Détecter automatiquement le code depuis l'URL actuelle
   */
  static autoDetectFromCurrentUrl(): string | null {
    return this.detectAndStoreReferralCode();
  }

  /**
   * Initialiser le tracking sur le chargement de la page
   */
  static initialize(): void {
    // Détecter automatiquement le code depuis l'URL
    this.autoDetectFromCurrentUrl();
    
    // Écouter les changements d'URL pour les SPA
    this.setupUrlChangeListener();
  }

  /**
   * Configurer l'écoute des changements d'URL
   */
  private static setupUrlChangeListener(): void {
    // Écouter les changements d'URL
    window.addEventListener('popstate', () => {
      this.autoDetectFromCurrentUrl();
    });

    // Observer les changements d'URL pour les SPA
    const observer = new MutationObserver(() => {
      this.autoDetectFromCurrentUrl();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }
}




