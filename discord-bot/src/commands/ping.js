const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Teste la latence du bot et de l\'API Discord'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: '🏓 Pong! Test de latence...', 
            fetchReply: true 
        });
        
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        const embed = new EmbedBuilder()
            .setColor(latency < 100 ? '#00ff00' : latency < 300 ? '#ffff00' : '#ff0000')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 Latence Bot', value: `${latency}ms`, inline: true },
                { name: '🌐 Latence API Discord', value: `${apiLatency}ms`, inline: true },
                { name: '⚡ Statut', value: latency < 100 ? 'Excellent' : latency < 300 ? 'Bon' : 'Lent', inline: true }
            )
            .setFooter({ text: 'FiverFlow Bot • Test de connectivité' })
            .setTimestamp();
        
        await interaction.editReply({ 
            content: '',
            embeds: [embed]
        });
    }
};
