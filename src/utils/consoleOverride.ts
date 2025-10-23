/**
 * 🧹 Console Override System
 * 
 * Remplace tous les console.log par un système plus intelligent
 * et nettoie la console pour la production
 */

// Sauvegarder les méthodes originales
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Système de logging intelligent
class ConsoleOverride {
  private isProduction = import.meta.env.PROD;
  private isDevelopment = import.meta.env.DEV;
  private easterEggActive = false;

  constructor() {
    this.overrideConsole();
  }

  private overrideConsole() {
    // Override console.log
    console.log = (...args: any[]) => {
      // Vérifier si c'est une commande easter egg
      const message = args.join(' ');
      if (message.startsWith('ff:') || message.startsWith('fiverflow:')) {
        this.handleEasterEggCommand(message);
        return;
      }

      // En production, ne logger que les erreurs critiques
      if (this.isProduction && !this.easterEggActive) {
        return;
      }

      // En développement, logger tout
      if (this.isDevelopment || this.easterEggActive) {
        originalConsole.log(...args);
      }
    };

    // Override console.error
    console.error = (...args: any[]) => {
      // Vérifier si c'est une commande easter egg
      const message = args.join(' ');
      if (message.startsWith('ff:') || message.startsWith('fiverflow:')) {
        this.handleEasterEggCommand(message);
        return;
      }

      // Toujours logger les erreurs
      originalConsole.error(...args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      // Vérifier si c'est une commande easter egg
      const message = args.join(' ');
      if (message.startsWith('ff:') || message.startsWith('fiverflow:')) {
        this.handleEasterEggCommand(message);
        return;
      }

      // En production, ne logger que les erreurs critiques
      if (this.isProduction && !this.easterEggActive) {
        return;
      }

      // En développement, logger tout
      if (this.isDevelopment || this.easterEggActive) {
        originalConsole.warn(...args);
      }
    };

    // Override console.info
    console.info = (...args: any[]) => {
      // Vérifier si c'est une commande easter egg
      const message = args.join(' ');
      if (message.startsWith('ff:') || message.startsWith('fiverflow:')) {
        this.handleEasterEggCommand(message);
        return;
      }

      // En production, ne logger que les erreurs critiques
      if (this.isProduction && !this.easterEggActive) {
        return;
      }

      // En développement, logger tout
      if (this.isDevelopment || this.easterEggActive) {
        originalConsole.info(...args);
      }
    };

    // Override console.debug
    console.debug = (...args: any[]) => {
      // Vérifier si c'est une commande easter egg
      const message = args.join(' ');
      if (message.startsWith('ff:') || message.startsWith('fiverflow:')) {
        this.handleEasterEggCommand(message);
        return;
      }

      // En production, ne logger que les erreurs critiques
      if (this.isProduction && !this.easterEggActive) {
        return;
      }

      // En développement, logger tout
      if (this.isDevelopment || this.easterEggActive) {
        originalConsole.debug(...args);
      }
    };
  }

  private handleEasterEggCommand(message: string) {
    const command = message.replace(/^(ff:|fiverflow:)/, '').trim();
    
    switch (command) {
      case 'help':
        this.showHelp();
        break;
      case 'ping':
        this.ping();
        break;
      case 'version':
        this.showVersion();
        break;
      case 'clear':
        this.clearConsole();
        break;
      case 'debug':
        this.toggleDebug();
        break;
      case 'matrix':
        this.matrixEffect();
        break;
      case 'konami':
        this.konamiCode();
        break;
      case 'stats':
        this.showStats();
        break;
      case 'rickroll':
        this.rickroll();
        break;
      case 'secret':
        this.revealSecret();
        break;
      default:
        this.showUnknownCommand(command);
    }
  }

  private showHelp() {
    originalConsole.log('%c🥚 FiverFlow Easter Egg System', 'color: #9c68f2; font-size: 16px; font-weight: bold;');
    originalConsole.log('%c📋 Commandes disponibles:', 'color: #4ade80; font-weight: bold;');
    originalConsole.log('%c  ff:help%c - Affiche la liste des commandes', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    originalConsole.log('%c  ff:ping%c - Test de latence', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    originalConsole.log('%c  ff:version%c - Version de l\'application', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    originalConsole.log('%c  ff:clear%c - Nettoie la console', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    originalConsole.log('%c💡 Tapez "ff:debug" pour plus de commandes secrètes !', 'color: #8b5cf6; font-style: italic;');
  }

  private ping() {
    const start = Date.now();
    setTimeout(() => {
      const latency = Date.now() - start;
      originalConsole.log(`%c🏓 Pong! Latence: ${latency}ms`, 'color: #10b981; font-weight: bold;');
    }, Math.random() * 100);
  }

  private showVersion() {
    originalConsole.log('%c📦 FiverFlow v2.0.0', 'color: #3b82f6; font-weight: bold;');
    originalConsole.log('%c  Build: Production Ready', 'color: #666;');
    originalConsole.log('%c  Framework: React + TypeScript', 'color: #666;');
    originalConsole.log('%c  Database: Supabase', 'color: #666;');
    originalConsole.log('%c  UI: Tailwind CSS', 'color: #666;');
  }

  private clearConsole() {
    console.clear();
    originalConsole.log('%c🧹 Console nettoyée !', 'color: #f59e0b; font-weight: bold;');
  }

  private toggleDebug() {
    this.easterEggActive = !this.easterEggActive;
    originalConsole.log(`%c🔧 Mode debug ${this.easterEggActive ? 'activé' : 'désactivé'}`, 'color: #ef4444; font-weight: bold;');
    
    if (this.easterEggActive) {
      originalConsole.log('%c🔍 Commandes secrètes débloquées:', 'color: #8b5cf6; font-weight: bold;');
      originalConsole.log('%c  ff:matrix%c - Effet Matrix dans la console', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
      originalConsole.log('%c  ff:konami%c - Code Konami activé', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
      originalConsole.log('%c  ff:stats%c - Statistiques de l\'application', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
      originalConsole.log('%c  ff:rickroll%c - Never gonna give you up...', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
      originalConsole.log('%c  ff:secret%c - Révèle un secret', 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    }
  }

  private matrixEffect() {
    originalConsole.log('%c🌊 Effet Matrix activé...', 'color: #10b981; font-weight: bold;');
    
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    let count = 0;
    
    const interval = setInterval(() => {
      if (count > 50) {
        clearInterval(interval);
        originalConsole.log('%c🎬 Fin de l\'effet Matrix', 'color: #10b981; font-weight: bold;');
        return;
      }
      
      const randomChars = Array.from({ length: 20 }, () => 
        matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ).join('');
      
      originalConsole.log(`%c${randomChars}`, 'color: #10b981;');
      count++;
    }, 100);
  }

  private konamiCode() {
    originalConsole.log('%c🎮 Code Konami activé !', 'color: #f59e0b; font-weight: bold;');
    originalConsole.log('%c⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️', 'color: #f59e0b; font-size: 20px;');
    originalConsole.log('%c+30 vies ajoutées ! 🎯', 'color: #ef4444; font-weight: bold;');
  }

  private showStats() {
    const stats = {
      'Temps de session': `${Math.floor((Date.now() - performance.timing.navigationStart) / 1000)}s`,
      'Navigateur': navigator.userAgent.split(' ')[0],
      'Résolution': `${screen.width}x${screen.height}`,
      'Mode': this.isProduction ? 'Production' : 'Développement',
      'Easter Egg': this.easterEggActive ? 'Activé' : 'Désactivé'
    };

    originalConsole.log('%c📊 Statistiques de l\'application:', 'color: #8b5cf6; font-weight: bold;');
    Object.entries(stats).forEach(([key, value]) => {
      originalConsole.log(`%c  ${key}%c: ${value}`, 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    });
  }

  private rickroll() {
    originalConsole.log('%c🎵 Never gonna give you up...', 'color: #ef4444; font-weight: bold;');
    originalConsole.log('%cNever gonna let you down...', 'color: #ef4444;');
    originalConsole.log('%cNever gonna run around and desert you...', 'color: #ef4444;');
    originalConsole.log('%c🎤 *mic drop*', 'color: #f59e0b; font-weight: bold;');
  }

  private revealSecret() {
    originalConsole.log('%c🤫 Secret révélé:', 'color: #8b5cf6; font-weight: bold;');
    originalConsole.log('%c  Cette application a été développée avec ❤️', 'color: #666;');
    originalConsole.log('%c  Il y a 5 easter eggs cachés !', 'color: #666;');
    originalConsole.log('%c  Trouvez-les tous pour devenir un maître FiverFlow ! 🏆', 'color: #fbbf24; font-weight: bold;');
  }

  private showUnknownCommand(command: string) {
    originalConsole.log(`%c❓ Commande inconnue: "${command}"`, 'color: #ef4444; font-weight: bold;');
    originalConsole.log('%cTapez "ff:help" pour voir les commandes disponibles', 'color: #666;');
  }
}

// Instance globale
export const consoleOverride = new ConsoleOverride();

// Auto-activation
if (import.meta.env.DEV) {
  originalConsole.log('%c🥚 FiverFlow Easter Egg System activé !', 'color: #9c68f2; font-size: 16px; font-weight: bold;');
  originalConsole.log('%cTapez "ff:help" dans la console pour commencer !', 'color: #666; font-size: 12px;');
}
