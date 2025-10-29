# 🤖 Guide de Configuration du Bot Discord FiverFlow

## 📋 Prérequis

### 1. Bot Discord
1. Allez sur https://discord.com/developers/applications
2. Cliquez sur "New Application"
3. Nommez votre application "FiverFlow Bot"
4. Allez dans l'onglet "Bot"
5. Cliquez sur "Add Bot"
6. Copiez le **Token** (gardez-le secret !)
7. Activez les **Privileged Gateway Intents** :
   - Server Members Intent
   - Message Content Intent

### 2. Inviter le Bot
1. Allez dans l'onglet "OAuth2" > "URL Generator"
2. Cochez "bot" et "applications.commands"
3. Cochez les permissions :
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History
   - View Channels
4. Copiez l'URL générée et ouvrez-la dans votre navigateur
5. Sélectionnez votre serveur et autorisez le bot

### 3. Obtenir les IDs
1. **Client ID** : Dans l'onglet "General Information"
2. **Guild ID** : Clic droit sur votre serveur > "Copy Server ID"
3. **Channel IDs** : Clic droit sur les canaux > "Copy Channel ID"

## 🔧 Configuration

### 1. Créer les canaux Discord
Créez ces canaux dans votre serveur :
- `#stats` - Pour les rapports automatiques
- `#notifications` - Pour les alertes générales
- `#errors` - Pour les rapports d'erreur

### 2. Configurer le fichier .env
```env
# Bot Discord
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=your_discord_server_id_here

# Supabase
SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Canaux Discord
STATS_CHANNEL_ID=your_stats_channel_id_here
NOTIFICATIONS_CHANNEL_ID=your_notifications_channel_id_here
ERRORS_CHANNEL_ID=your_errors_channel_id_here

# Configuration
ENABLE_DAILY_STATS=true
ENABLE_USER_NOTIFICATIONS=true
ENABLE_ERROR_REPORTS=true
TIMEZONE=Europe/Paris
```

### 3. Obtenir la clé Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans "Settings" > "API"
4. Copiez la **service_role** key (pas l'anon key !)

## 🚀 Installation et Démarrage

### 1. Installer les dépendances
```bash
cd discord-bot
npm install
```

### 2. Déployer les commandes
```bash
npm run deploy
```

### 3. Démarrer le bot
```bash
npm start
```

## ✅ Vérification

### 1. Vérifier la connexion
- Le bot doit apparaître en ligne sur Discord
- Un message de démarrage doit apparaître dans #notifications

### 2. Tester les commandes
- `/ping` - Test de latence
- `/help` - Liste des commandes
- `/stats` - Statistiques générales

### 3. Vérifier les tâches automatiques
- Les statistiques quotidiennes s'affichent à 9h00
- Les rapports hebdomadaires s'affichent le dimanche à 10h00

## 🔧 Commandes Disponibles

### Statistiques
- `/stats` - Vue d'ensemble
- `/stats type:general` - Statistiques détaillées
- `/stats type:orders` - Commandes et revenus
- `/stats type:users` - Utilisateurs et abonnements
- `/stats type:all` - Rapport complet

### Administration
- `/ping` - Test de connectivité
- `/help` - Aide et commandes

## 📊 Fonctionnalités Automatiques

### Rapports Quotidiens (9h00)
- Nombre total d'utilisateurs
- Nouveaux utilisateurs cette semaine
- Répartition par plan d'abonnement
- Abonnements actifs

### Rapports Hebdomadaires (Dimanche 10h00)
- Statistiques complètes de la semaine
- Tendances et évolutions
- Utilisateurs récents
- Performance des commandes

### Surveillance des Erreurs
- Vérification toutes les heures
- Alertes automatiques en cas de problème
- Notifications dans #errors

## 🛠️ Dépannage

### Bot ne répond pas
1. Vérifiez que le token est correct
2. Vérifiez les permissions du bot
3. Vérifiez que les commandes sont déployées

### Erreurs de base de données
1. Vérifiez la clé Supabase (service_role)
2. Vérifiez que l'URL Supabase est correcte
3. Vérifiez les permissions de la clé

### Commandes non visibles
1. Redéployez les commandes : `npm run deploy`
2. Attendez quelques minutes
3. Redémarrez Discord

## 📈 Personnalisation

### Modifier les horaires
Éditez `src/utils/scheduler.js` :
```javascript
// Statistiques quotidiennes à 9h00
cron.schedule('0 9 * * *', async () => {
    // Votre code ici
});
```

### Ajouter des commandes
1. Créez un fichier dans `src/commands/`
2. Suivez le format des commandes existantes
3. Redéployez avec `npm run deploy`

### Modifier les embeds
Éditez les fichiers dans `src/commands/` pour personnaliser l'apparence des messages.

## 🚀 Déploiement en Production

### Avec PM2
```bash
npm install -g pm2
pm2 start src/index.js --name "fiverflow-bot"
pm2 save
pm2 startup
```

### Avec Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs du bot
2. Consultez la documentation Discord.js
3. Contactez l'équipe FiverFlow

---

**Bot Discord FiverFlow** - Statistiques et administration automatisées 🚀
