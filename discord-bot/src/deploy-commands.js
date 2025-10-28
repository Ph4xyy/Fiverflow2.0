const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Charger toutes les commandes
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(chalk.green(`✅ Commande chargée: ${command.data.name}`));
    } else {
        console.log(chalk.red(`❌ Commande invalide: ${file}`));
    }
}

// Créer l'instance REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Déployer les commandes
(async () => {
    try {
        console.log(chalk.blue(`🚀 Déploiement de ${commands.length} commande(s)...`));
        
        // Déployer globalement (tous les serveurs)
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(chalk.green(`✅ ${data.length} commande(s) déployée(s) avec succès!`));
        
        // Si un GUILD_ID est spécifié, déployer aussi sur ce serveur
        if (process.env.GUILD_ID) {
            const guildData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            
            console.log(chalk.green(`✅ ${guildData.length} commande(s) déployée(s) sur le serveur!`));
        }
        
    } catch (error) {
        console.error(chalk.red('❌ Erreur lors du déploiement:'), error);
    }
})();
