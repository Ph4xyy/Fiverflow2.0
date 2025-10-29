const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } = require('discord.js');
const { loadCommands } = require('./utils/commandLoader');
const { loadEvents } = require('./utils/eventLoader');
const { connectToSupabase } = require('./utils/supabase');
const { scheduleTasks } = require('./utils/scheduler');
const chalk = require('chalk');
require('dotenv').config();

// Créer le client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Collections pour les commandes
client.commands = new Collection();
client.cooldowns = new Collection();

// Configuration
client.config = {
    prefix: '!',
    ownerId: process.env.OWNER_ID || 'your_owner_id',
    guildId: process.env.GUILD_ID,
    statsChannelId: process.env.STATS_CHANNEL_ID,
    notificationsChannelId: process.env.NOTIFICATIONS_CHANNEL_ID,
    errorsChannelId: process.env.ERRORS_CHANNEL_ID
};

// Connexion à Supabase
client.supabase = connectToSupabase();

// Fonction de démarrage
async function startBot() {
    try {
        console.log(chalk.blue('🚀 Démarrage du bot FiverFlow...'));
        
        // Charger les commandes et événements
        await loadCommands(client);
        await loadEvents(client);
        
        // Se connecter à Discord
        await client.login(process.env.DISCORD_TOKEN);
        
        console.log(chalk.green('✅ Bot FiverFlow connecté avec succès!'));
        
        // Programmer les tâches automatiques
        scheduleTasks(client);
        
    } catch (error) {
        console.error(chalk.red('❌ Erreur lors du démarrage du bot:'), error);
        process.exit(1);
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    if (client.isReady()) {
        const errorChannel = client.channels.cache.get(client.config.errorsChannelId);
        if (errorChannel) {
            errorChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🚨 Erreur Critique')
                    .setDescription(`\`\`\`js\n${error.stack}\n\`\`\``)
                    .setTimestamp()
                ]
            }).catch(console.error);
        }
    }
});

// Démarrer le bot
startBot();

module.exports = client;
