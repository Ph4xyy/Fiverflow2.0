const { ActivityType, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green(`✅ Bot connecté en tant que ${client.user.tag}!`));
        console.log(chalk.blue(`📊 Servant ${client.guilds.cache.size} serveur(s)`));
        console.log(chalk.blue(`👥 ${client.users.cache.size} utilisateur(s) en cache`));
        
        // Définir l'activité du bot
        client.user.setActivity('FiverFlow Dashboard', { 
            type: ActivityType.Watching 
        });
        
        // Envoyer un message de démarrage dans le canal de notifications
        const notificationsChannel = client.channels.cache.get(client.config.notificationsChannelId);
        if (notificationsChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🤖 Bot FiverFlow Démarré')
                .setDescription('Le bot est maintenant en ligne et prêt à fonctionner!')
                .addFields(
                    { name: '📊 Commandes', value: 'Utilisez `/help` pour voir toutes les commandes', inline: true },
                    { name: '📈 Statistiques', value: 'Utilisez `/stats` pour voir les statistiques', inline: true },
                    { name: '🆘 Support', value: 'Utilisez `/ping` pour tester la latence', inline: true }
                )
                .setFooter({ text: 'FiverFlow Bot • Système de notifications' })
                .setTimestamp();
            
            try {
                await notificationsChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Erreur envoi message démarrage:', error);
            }
        }
        
        // Afficher les informations de configuration
        console.log(chalk.yellow('\n📋 Configuration:'));
        console.log(chalk.yellow(`   • Canal Stats: ${client.config.statsChannelId || 'Non configuré'}`));
        console.log(chalk.yellow(`   • Canal Notifications: ${client.config.notificationsChannelId || 'Non configuré'}`));
        console.log(chalk.yellow(`   • Canal Erreurs: ${client.config.errorsChannelId || 'Non configuré'}`));
        console.log(chalk.yellow(`   • Supabase: ${client.supabase ? 'Connecté' : 'Non connecté'}`));
        
        console.log(chalk.green('\n🚀 Bot FiverFlow prêt à fonctionner!'));
    }
};
