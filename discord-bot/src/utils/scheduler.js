const cron = require('node-cron');
const { StatsManager } = require('./supabase');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

function scheduleTasks(client) {
    const statsManager = new StatsManager(client.supabase);
    
    // Statistiques quotidiennes à 9h00
    cron.schedule('0 9 * * *', async () => {
        if (!process.env.ENABLE_DAILY_STATS === 'true') return;
        
        try {
            console.log('📊 Génération des statistiques quotidiennes...');
            await sendDailyStats(client, statsManager);
        } catch (error) {
            console.error('Erreur stats quotidiennes:', error);
        }
    }, {
        timezone: process.env.TIMEZONE || 'Europe/Paris'
    });
    
    // Statistiques hebdomadaires le dimanche à 10h00
    cron.schedule('0 10 * * 0', async () => {
        try {
            console.log('📈 Génération des statistiques hebdomadaires...');
            await sendWeeklyStats(client, statsManager);
        } catch (error) {
            console.error('Erreur stats hebdomadaires:', error);
        }
    }, {
        timezone: process.env.TIMEZONE || 'Europe/Paris'
    });
    
    // Vérification des erreurs toutes les heures
    cron.schedule('0 * * * *', async () => {
        try {
            await checkForErrors(client);
        } catch (error) {
            console.error('Erreur vérification erreurs:', error);
        }
    });
    
    console.log('⏰ Tâches programmées configurées');
}

async function sendDailyStats(client, statsManager) {
    const statsChannel = client.channels.cache.get(client.config.statsChannelId);
    if (!statsChannel) return;
    
    const stats = await statsManager.getGeneralStats();
    if (!stats) return;
    
    const embed = new EmbedBuilder()
        .setColor('#9c68f2')
        .setTitle('📊 Statistiques Quotidiennes FiverFlow')
        .setDescription(`Données du ${moment().tz(process.env.TIMEZONE || 'Europe/Paris').format('DD/MM/YYYY')}`)
        .addFields(
            { name: '👥 Utilisateurs Totaux', value: stats.totalUsers.toString(), inline: true },
            { name: '🆕 Nouveaux Cette Semaine', value: stats.newUsersThisWeek.toString(), inline: true },
            { name: '💳 Abonnements Actifs', value: stats.activeSubscriptions.toString(), inline: true },
            { name: '🥪 Lunch', value: stats.lunchUsers.toString(), inline: true },
            { name: '🚀 Boost', value: stats.boostUsers.toString(), inline: true },
            { name: '📈 Scale', value: stats.scaleUsers.toString(), inline: true }
        )
        .setFooter({ text: 'FiverFlow Bot • Statistiques automatiques' })
        .setTimestamp();
    
    await statsChannel.send({ embeds: [embed] });
}

async function sendWeeklyStats(client, statsManager) {
    const statsChannel = client.channels.cache.get(client.config.statsChannelId);
    if (!statsChannel) return;
    
    const [generalStats, ordersStats, recentUsers] = await Promise.all([
        statsManager.getGeneralStats(),
        statsManager.getOrdersStats(),
        statsManager.getRecentUsers(10)
    ]);
    
    if (!generalStats) return;
    
    const embed = new EmbedBuilder()
        .setColor('#ff6b35')
        .setTitle('📈 Rapport Hebdomadaire FiverFlow')
        .setDescription(`Semaine du ${moment().subtract(7, 'days').format('DD/MM')} au ${moment().format('DD/MM/YYYY')}`)
        .addFields(
            { name: '👥 Utilisateurs Totaux', value: generalStats.totalUsers.toString(), inline: true },
            { name: '🆕 Nouveaux Utilisateurs', value: generalStats.newUsersThisWeek.toString(), inline: true },
            { name: '💳 Abonnements Actifs', value: generalStats.activeSubscriptions.toString(), inline: true }
        );
    
    if (ordersStats) {
        embed.addFields(
            { name: '📦 Commandes Totales', value: ordersStats.totalOrders.toString(), inline: true },
            { name: '✅ Commandes Terminées', value: ordersStats.completedOrders.toString(), inline: true },
            { name: '💰 Revenus Totaux', value: `$${ordersStats.totalRevenue.toFixed(2)}`, inline: true }
        );
    }
    
    if (recentUsers && recentUsers.length > 0) {
        const recentUsersList = recentUsers.map(user => 
            `• **${user.username}** (${user.subscription})`
        ).join('\n');
        
        embed.addFields({
            name: '🆕 Nouveaux Utilisateurs',
            value: recentUsersList.substring(0, 1024), // Limite Discord
            inline: false
        });
    }
    
    embed.setFooter({ text: 'FiverFlow Bot • Rapport hebdomadaire' })
         .setTimestamp();
    
    await statsChannel.send({ embeds: [embed] });
}

async function checkForErrors(client) {
    // Ici vous pouvez ajouter des vérifications d'erreurs spécifiques
    // Par exemple, vérifier les logs d'erreur, les services down, etc.
    
    const errorChannel = client.channels.cache.get(client.config.errorsChannelId);
    if (!errorChannel) return;
    
    // Exemple de vérification (à adapter selon vos besoins)
    const errorCount = 0; // Récupérer depuis vos logs
    
    if (errorCount > 10) { // Seuil d'erreur
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ Alerte Erreurs')
            .setDescription(`${errorCount} erreurs détectées dans la dernière heure`)
            .setTimestamp();
            
        await errorChannel.send({ embeds: [embed] });
    }
}

module.exports = { scheduleTasks };
