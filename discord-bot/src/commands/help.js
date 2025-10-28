const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9c68f2')
            .setTitle('🤖 Commandes FiverFlow Bot')
            .setDescription('Voici toutes les commandes disponibles pour gérer FiverFlow')
            .addFields(
                {
                    name: '📊 Statistiques',
                    value: '`/stats` - Affiche les statistiques générales\n`/stats type:general` - Statistiques détaillées\n`/stats type:orders` - Statistiques des commandes\n`/stats type:users` - Statistiques des utilisateurs\n`/stats type:all` - Rapport complet',
                    inline: false
                },
                {
                    name: '🔧 Administration',
                    value: '`/ping` - Test de latence du bot\n`/status` - État des services\n`/restart` - Redémarrage du bot (admin uniquement)',
                    inline: false
                },
                {
                    name: '📈 Notifications',
                    value: '`/notify` - Configurer les notifications\n`/subscribe` - S\'abonner aux alertes\n`/unsubscribe` - Se désabonner des alertes',
                    inline: false
                },
                {
                    name: '🆘 Support',
                    value: '`/help` - Affiche cette aide\n`/contact` - Informations de contact\n`/bug` - Signaler un bug',
                    inline: false
                }
            )
            .setFooter({ text: 'FiverFlow Bot • Tapez / pour voir les commandes' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
