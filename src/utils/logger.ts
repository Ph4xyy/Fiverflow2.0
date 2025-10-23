/**
 * 🧹 Logger System - Remplacement intelligent des console.log
 * 
 * Système de logging propre qui remplace tous les console.log
 * par un système plus intelligent et moins spammy
 */

interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  private currentLevel: number = LOG_LEVELS.INFO;
  private isEasterEggActive: boolean = false;
  private logHistory: Array<{level: string, message: string, timestamp: number}> = [];

  constructor() {
    // En production, on ne garde que les erreurs
    if (import.meta.env.PROD) {
      this.currentLevel = LOG_LEVELS.ERROR;
    }
    
    // En développement, on garde tout
    if (import.meta.env.DEV) {
      this.currentLevel = LOG_LEVELS.DEBUG;
    }
  }

  private shouldLog(level: number): boolean {
    return level <= this.currentLevel || this.isEasterEggActive;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${level}: ${message}`;
  }

  private addToHistory(level: string, message: string) {
    this.logHistory.push({
      level,
      message,
      timestamp: Date.now()
    });

    // Garder seulement les 100 derniers logs
    if (this.logHistory.length > 100) {
      this.logHistory.shift();
    }
  }

  error(message: string, ...args: any[]): void {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    
    const formattedMessage = this.formatMessage('ERROR', message);
    this.addToHistory('ERROR', message);
    console.error(`%c${formattedMessage}`, 'color: #ef4444; font-weight: bold;', ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    
    const formattedMessage = this.formatMessage('WARN', message);
    this.addToHistory('WARN', message);
    console.warn(`%c${formattedMessage}`, 'color: #f59e0b; font-weight: bold;', ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const formattedMessage = this.formatMessage('INFO', message);
    this.addToHistory('INFO', message);
    console.info(`%c${formattedMessage}`, 'color: #3b82f6;', ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    const formattedMessage = this.formatMessage('DEBUG', message);
    this.addToHistory('DEBUG', message);
    console.debug(`%c${formattedMessage}`, 'color: #6b7280; font-style: italic;', ...args);
  }

  // Méthodes spéciales pour les easter eggs
  success(message: string, ...args: any[]): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const formattedMessage = this.formatMessage('SUCCESS', message);
    this.addToHistory('SUCCESS', message);
    console.log(`%c${formattedMessage}`, 'color: #10b981; font-weight: bold;', ...args);
  }

  // Méthode pour activer/désactiver le logging complet (pour les easter eggs)
  setEasterEggMode(active: boolean): void {
    this.isEasterEggActive = active;
    if (active) {
      this.info('🥚 Easter Egg Mode activé - Logging complet activé');
    }
  }

  // Méthode pour obtenir l'historique des logs
  getHistory(): Array<{level: string, message: string, timestamp: number}> {
    return [...this.logHistory];
  }

  // Méthode pour nettoyer l'historique
  clearHistory(): void {
    this.logHistory = [];
  }
}

// Instance globale
export const logger = new Logger();

// Remplacement des console.log par défaut
export const log = {
  error: (message: string, ...args: any[]) => logger.error(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
  debug: (message: string, ...args: any[]) => logger.debug(message, ...args),
  success: (message: string, ...args: any[]) => logger.success(message, ...args)
};

// Export par défaut
export default logger;
