/**
 * 🥚 Easter Egg System - Discord Style
 * 
 * Système d'easter egg caché activé par des commandes spéciales
 * dans la console, inspiré de Discord
 */

interface EasterEggCommand {
  command: string;
  description: string;
  action: () => void;
  hidden?: boolean;
}

class EasterEggSystem {
  private commands: EasterEggCommand[] = [];
  private isActive = false;
  private commandHistory: string[] = [];

  constructor() {
    this.initializeCommands();
    this.setupConsoleListener();
  }

  private initializeCommands() {
    this.commands = [
      {
        command: 'help',
        description: 'Affiche la liste des commandes disponibles',
        action: () => this.showHelp(),
        hidden: false
      },
      {
        command: 'ping',
        description: 'Test de latence',
        action: () => this.ping(),
        hidden: false
      },
      {
        command: 'version',
        description: 'Affiche la version de l\'application',
        action: () => this.showVersion(),
        hidden: false
      },
      {
        command: 'clear',
        description: 'Nettoie la console',
        action: () => this.clearConsole(),
        hidden: false
      },
      {
        command: 'debug',
        description: 'Active/désactive le mode debug',
        action: () => this.toggleDebug(),
        hidden: true
      },
      {
        command: 'matrix',
        description: 'Effet Matrix dans la console',
        action: () => this.matrixEffect(),
        hidden: true
      },
      {
        command: 'konami',
        description: 'Code Konami activé ! 🎮',
        action: () => this.konamiCode(),
        hidden: true
      },
      {
        command: 'stats',
        description: 'Statistiques de l\'application',
        action: () => this.showStats(),
        hidden: true
      },
      {
        command: 'rickroll',
        description: 'Never gonna give you up... 🎵',
        action: () => this.rickroll(),
        hidden: true
      },
      {
        command: 'secret',
        description: 'Révèle un secret... 🤫',
        action: () => this.revealSecret(),
        hidden: true
      }
    ];
  }

  private setupConsoleListener() {
    // Intercepter les commandes dans la console
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods pour capturer les commandes
    console.log = (...args) => {
      const message = args.join(' ');
      if (this.isEasterEggCommand(message)) {
        this.executeCommand(message);
        return;
      }
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (this.isEasterEggCommand(message)) {
        this.executeCommand(message);
        return;
      }
      originalError(...args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (this.isEasterEggCommand(message)) {
        this.executeCommand(message);
        return;
      }
      originalWarn(...args);
    };
  }

  private isEasterEggCommand(message: string): boolean {
    return message.startsWith('ff:') || message.startsWith('fiverflow:');
  }

  private executeCommand(message: string) {
    const command = message.replace(/^(ff:|fiverflow:)/, '').trim();
    this.commandHistory.push(command);

    const easterEggCommand = this.commands.find(cmd => cmd.command === command);
    if (easterEggCommand) {
      this.isActive = true;
      this.showEasterEggHeader();
      easterEggCommand.action();
    } else {
      this.showUnknownCommand(command);
    }
  }

  private showEasterEggHeader() {
    console.log('%c🥚 FiverFlow Easter Egg System', 'color: #9c68f2; font-size: 16px; font-weight: bold;');
    console.log('%cSystème d\'easter egg activé ! Tapez "ff:help" pour voir les commandes', 'color: #666; font-size: 12px;');
  }

  private showHelp() {
    console.log('%c📋 Commandes disponibles:', 'color: #4ade80; font-weight: bold;');
    this.commands.forEach(cmd => {
      if (!cmd.hidden) {
        console.log(`%c  ${cmd.command}%c - ${cmd.description}`, 'color: #fbbf24; font-weight: bold;', 'color: #666;');
      }
    });
    console.log('%c💡 Tapez "ff:debug" pour plus de commandes secrètes !', 'color: #8b5cf6; font-style: italic;');
  }

  private ping() {
    const start = Date.now();
    setTimeout(() => {
      const latency = Date.now() - start;
      console.log(`%c🏓 Pong! Latence: ${latency}ms`, 'color: #10b981; font-weight: bold;');
    }, Math.random() * 100);
  }

  private showVersion() {
    console.log('%c📦 FiverFlow v2.0.0', 'color: #3b82f6; font-weight: bold;');
    console.log('%c  Build: Production Ready', 'color: #666;');
    console.log('%c  Framework: React + TypeScript', 'color: #666;');
    console.log('%c  Database: Supabase', 'color: #666;');
    console.log('%c  UI: Tailwind CSS', 'color: #666;');
  }

  private clearConsole() {
    console.clear();
    console.log('%c🧹 Console nettoyée !', 'color: #f59e0b; font-weight: bold;');
  }

  private toggleDebug() {
    this.isActive = !this.isActive;
    console.log(`%c🔧 Mode debug ${this.isActive ? 'activé' : 'désactivé'}`, 'color: #ef4444; font-weight: bold;');
    
    if (this.isActive) {
      console.log('%c🔍 Commandes secrètes débloquées:', 'color: #8b5cf6; font-weight: bold;');
      this.commands.filter(cmd => cmd.hidden).forEach(cmd => {
        console.log(`%c  ${cmd.command}%c - ${cmd.description}`, 'color: #fbbf24; font-weight: bold;', 'color: #666;');
      });
    }
  }

  private matrixEffect() {
    console.log('%c🌊 Effet Matrix activé...', 'color: #10b981; font-weight: bold;');
    
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    let count = 0;
    
    const interval = setInterval(() => {
      if (count > 50) {
        clearInterval(interval);
        console.log('%c🎬 Fin de l\'effet Matrix', 'color: #10b981; font-weight: bold;');
        return;
      }
      
      const randomChars = Array.from({ length: 20 }, () => 
        matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ).join('');
      
      console.log(`%c${randomChars}`, 'color: #10b981;');
      count++;
    }, 100);
  }

  private konamiCode() {
    console.log('%c🎮 Code Konami activé !', 'color: #f59e0b; font-weight: bold;');
    console.log('%c⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️', 'color: #f59e0b; font-size: 20px;');
    console.log('%c+30 vies ajoutées ! 🎯', 'color: #ef4444; font-weight: bold;');
  }

  private showStats() {
    const stats = {
      'Temps de session': `${Math.floor((Date.now() - performance.timing.navigationStart) / 1000)}s`,
      'Commandes exécutées': this.commandHistory.length,
      'Easter eggs découverts': this.commandHistory.filter(cmd => 
        this.commands.find(c => c.command === cmd)?.hidden
      ).length,
      'Navigateur': navigator.userAgent.split(' ')[0],
      'Résolution': `${screen.width}x${screen.height}`
    };

    console.log('%c📊 Statistiques de l\'application:', 'color: #8b5cf6; font-weight: bold;');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`%c  ${key}%c: ${value}`, 'color: #fbbf24; font-weight: bold;', 'color: #666;');
    });
  }

  private rickroll() {
    console.log('%c🎵 Never gonna give you up...', 'color: #ef4444; font-weight: bold;');
    console.log('%cNever gonna let you down...', 'color: #ef4444;');
    console.log('%cNever gonna run around and desert you...', 'color: #ef4444;');
    console.log('%c🎤 *mic drop*', 'color: #f59e0b; font-weight: bold;');
  }

  private revealSecret() {
    console.log('%c🤫 Secret révélé:', 'color: #8b5cf6; font-weight: bold;');
    console.log('%c  Cette application a été développée avec ❤️', 'color: #666;');
    console.log('%c  Il y a ' + this.commands.filter(cmd => cmd.hidden).length + ' easter eggs cachés !', 'color: #666;');
    console.log('%c  Trouvez-les tous pour devenir un maître FiverFlow ! 🏆', 'color: #fbbf24; font-weight: bold;');
  }

  private showUnknownCommand(command: string) {
    console.log(`%c❓ Commande inconnue: "${command}"`, 'color: #ef4444; font-weight: bold;');
    console.log('%cTapez "ff:help" pour voir les commandes disponibles', 'color: #666;');
  }

  // Méthode publique pour activer le système
  public activate() {
    console.log('%c🥚 FiverFlow Easter Egg System activé !', 'color: #9c68f2; font-size: 16px; font-weight: bold;');
    console.log('%cTapez "ff:help" dans la console pour commencer !', 'color: #666; font-size: 12px;');
  }
}

// Instance globale
export const easterEgg = new EasterEggSystem();

// Auto-activation en mode développement
if (import.meta.env.DEV) {
  easterEgg.activate();
}
