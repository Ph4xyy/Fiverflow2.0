const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { StatsManager } = require('../utils/supabase');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Affiche les statistiques de FiverFlow')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de statistiques à afficher')
                .setRequired(false)
                .addChoices(
                    { name: 'Générales', value: 'general' },
                    { name: 'Commandes', value: 'orders' },
                    { name: 'Utilisateurs', value: 'users' },
                    { name: 'Tout', value: 'all' }
                )
        ),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const statsManager = new StatsManager(interaction.client.supabase);
        const type = interaction.options.getString('type') || 'general';
        
        try {
            switch (type) {
                case 'general':
                    await sendGeneralStats(interaction, statsManager);
                    break;
                case 'orders':
                    await sendOrdersStats(interaction, statsManager);
                    break;
                case 'users':
                    await sendUsersStats(interaction, statsManager);
                    break;
                case 'all':
                    await sendAllStats(interaction, statsManager);
                    break;
                default:
                    await sendGeneralStats(interaction, statsManager);
            }
        } catch (error) {
            console.error('Erreur commande stats:', error);
            await interaction.editReply({
                content: '❌ Erreur lors de la récupération des statistiques.',
                ephemeral: true
            });
        }
    }
};

async function sendGeneralStats(interaction, statsManager) {
    const stats = await statsManager.getGeneralStats();
    if (!stats) {
        await interaction.editReply('❌ Impossible de récupérer les statistiques.');
        return;
    }
    
    const embed = new EmbedBuilder()
        .setColor('#9c68f2')
        .setTitle('📊 Statistiques Générales FiverFlow')
        .setDescription('Aperçu des performances de la plateforme')
        .addFields(
            { name: '👥 Utilisateurs Totaux', value: stats.totalUsers.toString(), inline: true },
            { name: '🆕 Nouveaux Cette Semaine', value: stats.newUsersThisWeek.toString(), inline: true },
            { name: '💳 Abonnements Actifs', value: stats.activeSubscriptions.toString(), inline: true },
            { name: '🥪 Plan Lunch', value: stats.lunchUsers.toString(), inline: true },
            { name: '🚀 Plan Boost', value: stats.boostUsers.toString(), inline: true },
            { name: '📈 Plan Scale', value: stats.scaleUsers.toString(), inline: true }
        )
        .setFooter({ text: 'FiverFlow Bot • Statistiques en temps réel' })
        .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
}

async function sendOrdersStats(interaction, statsManager) {
    const stats = await statsManager.getOrdersStats();
    if (!stats) {
        await interaction.editReply('❌ Impossible de récupérer les statistiques des commandes.');
        return;
    }
    
    const embed = new EmbedBuilder()
        .setColor('#ff6b35')
        .setTitle('📦 Statistiques des Commandes')
        .setDescription('Performance des commandes et revenus')
        .addFields(
            { name: '📦 Commandes Totales', value: stats.totalOrders.toString(), inline: true },
            { name: '✅ Terminées', value: stats.completedOrders.toString(), inline: true },
            { name: '⏳ En Attente', value: stats.pendingOrders.toString(), inline: true },
            { name: '💰 Revenus Totaux', value: `$${stats.totalRevenue.toFixed(2)}`, inline: true },
            { name: '📊 Taux de Réussite', value: `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%`, inline: true }
        )
        .setFooter({ text: 'FiverFlow Bot • Statistiques des commandes' })
        .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
}

async function sendUsersStats(interaction, statsManager) {
    const [generalStats, recentUsers] = await Promise.all([
        statsManager.getGeneralStats(),
        statsManager.getRecentUsers(10)
    ]);
    
    if (!generalStats) {
        await interaction.editReply('❌ Impossible de récupérer les statistiques des utilisateurs.');
        return;
    }
    
    const embed = new EmbedBuilder()
        .setColor('#00d4aa')
        .setTitle('👥 Statistiques des Utilisateurs')
        .setDescription('Informations détaillées sur les utilisateurs')
        .addFields(
            { name: '👥 Total Utilisateurs', value: generalStats.totalUsers.toString(), inline: true },
            { name: '🆕 Nouveaux Cette Semaine', value: generalStats.newUsersThisWeek.toString(), inline: true },
            { name: '💳 Abonnements Actifs', value: generalStats.activeSubscriptions.toString(), inline: true }
        );
    
    if (recentUsers && recentUsers.length > 0) {
        const recentUsersList = recentUsers.map(user => 
            `• **${user.username}** (${user.subscription}) - ${moment(user.created_at).fromNow()}`
        ).join('\n');
        
        embed.addFields({
            name: '🆕 Utilisateurs Récents',
            value: recentUsersList.substring(0, 1024),
            inline: false
        });
    }
    
    embed.setFooter({ text: 'FiverFlow Bot • Statistiques des utilisateurs' })
         .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
}

async function sendAllStats(interaction, statsManager) {
    const [generalStats, ordersStats, recentUsers] = await Promise.all([
        statsManager.getGeneralStats(),
        statsManager.getOrdersStats(),
        statsManager.getRecentUsers(5)
    ]);
    
    if (!generalStats) {
        await interaction.editReply('❌ Impossible de récupérer les statistiques.');
        return;
    }
    
    const embed = new EmbedBuilder()
        .setColor('#6366f1')
        .setTitle('📊 Rapport Complet FiverFlow')
        .setDescription('Vue d\'ensemble complète de la plateforme')
        .addFields(
            { name: '👥 Utilisateurs', value: `Total: ${generalStats.totalUsers}\nNouveaux: ${generalStats.newUsersThisWeek}`, inline: true },
            { name: '💳 Abonnements', value: `Actifs: ${generalStats.activeSubscriptions}\nLunch: ${generalStats.lunchUsers}\nBoost: ${generalStats.boostUsers}\nScale: ${generalStats.scaleUsers}`, inline: true },
            { name: '📦 Commandes', value: ordersStats ? `Total: ${ordersStats.totalOrders}\nTerminées: ${ordersStats.completedOrders}\nRevenus: $${ordersStats.totalRevenue.toFixed(2)}` : 'Non disponibles', inline: true }
        );
    
    if (recentUsers && recentUsers.length > 0) {
        const recentUsersList = recentUsers.map(user => 
            `• **${user.username}** (${user.subscription})`
        ).join('\n');
        
        embed.addFields({
            name: '🆕 Derniers Utilisateurs',
            value: recentUsersList,
            inline: false
        });
    }
    
    embed.setFooter({ text: 'FiverFlow Bot • Rapport complet' })
         .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
}
