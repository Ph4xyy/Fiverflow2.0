# 🤖 Bot Discord FiverFlow

Bot Discord officiel pour FiverFlow - Statistiques, notifications et administration.

## 🚀 Fonctionnalités

### 📊 Statistiques
- **Statistiques générales** : Utilisateurs, abonnements, nouveaux utilisateurs
- **Statistiques des commandes** : Commandes totales, terminées, revenus
- **Statistiques des utilisateurs** : Utilisateurs récents, répartition par plan
- **Rapports automatiques** : Quotidiens et hebdomadaires

### 🔧 Administration
- **Test de latence** : Ping du bot et de l'API Discord
- **Statut des services** : Vérification de l'état des services
- **Gestion des erreurs** : Alertes automatiques en cas de problème

### 📈 Notifications
- **Notifications automatiques** : Statistiques programmées
- **Alertes d'erreur** : Notifications en cas de problème
- **Rapports personnalisés** : Statistiques à la demande

## 🛠️ Installation

### Prérequis
- Node.js 16.0.0 ou plus récent
- Un bot Discord configuré
- Accès à la base de données Supabase

### 1. Cloner le projet
```bash
git clone <repository-url>
cd discord-bot
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration
```bash
cp env.example .env
```

Éditez le fichier `.env` avec vos configurations :
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=your_discord_server_id_here
SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
STATS_CHANNEL_ID=your_stats_channel_id_here
NOTIFICATIONS_CHANNEL_ID=your_notifications_channel_id_here
ERRORS_CHANNEL_ID=your_errors_channel_id_here
```

### 4. Déployer les commandes
```bash
npm run deploy
```

### 5. Démarrer le bot
```bash
npm start
```

## 📋 Commandes

### Statistiques
- `/stats` - Statistiques générales
- `/stats type:general` - Statistiques détaillées
- `/stats type:orders` - Statistiques des commandes
- `/stats type:users` - Statistiques des utilisateurs
- `/stats type:all` - Rapport complet

### Administration
- `/ping` - Test de latence
- `/help` - Liste des commandes

## ⏰ Tâches Automatiques

### Statistiques Quotidiennes
- **Horaire** : 9h00 (timezone configurable)
- **Contenu** : Utilisateurs, abonnements, nouveaux utilisateurs

### Statistiques Hebdomadaires
- **Horaire** : Dimanche 10h00
- **Contenu** : Rapport complet avec tendances

### Vérification des Erreurs
- **Horaire** : Toutes les heures
- **Contenu** : Alertes en cas de problème

## 🔧 Configuration

### Variables d'environnement
- `DISCORD_TOKEN` - Token du bot Discord
- `CLIENT_ID` - ID de l'application Discord
- `GUILD_ID` - ID du serveur Discord (optionnel)
- `SUPABASE_URL` - URL de votre instance Supabase
- `SUPABASE_SERVICE_KEY` - Clé de service Supabase
- `STATS_CHANNEL_ID` - Canal pour les statistiques
- `NOTIFICATIONS_CHANNEL_ID` - Canal pour les notifications
- `ERRORS_CHANNEL_ID` - Canal pour les erreurs
- `TIMEZONE` - Fuseau horaire (défaut: Europe/Paris)

### Canaux Discord
1. **Canal Stats** : Pour les rapports automatiques
2. **Canal Notifications** : Pour les alertes générales
3. **Canal Erreurs** : Pour les rapports d'erreur

## 📊 Base de Données

Le bot se connecte à Supabase pour récupérer :
- **user_profiles** : Informations des utilisateurs
- **user_subscriptions** : Abonnements actifs
- **orders** : Commandes et revenus

## 🚀 Déploiement

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

### PM2 (Recommandé)
```bash
npm install -g pm2
pm2 start src/index.js --name "fiverflow-bot"
pm2 save
pm2 startup
```

## 📝 Logs

Le bot génère des logs colorés :
- 🔵 **Info** : Informations générales
- 🟢 **Succès** : Opérations réussies
- 🟡 **Avertissement** : Avertissements
- 🔴 **Erreur** : Erreurs critiques

## 🆘 Support

En cas de problème :
1. Vérifiez les logs du bot
2. Vérifiez la configuration Supabase
3. Vérifiez les permissions du bot Discord
4. Contactez l'équipe FiverFlow

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

**FiverFlow Bot** - Statistiques et administration automatisées 🚀
