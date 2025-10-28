const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log(chalk.blue('📁 Chargement des commandes...'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(chalk.green(`  ✅ Commande chargée: ${command.data.name}`));
        } else {
            console.log(chalk.red(`  ❌ Commande invalide: ${file}`));
        }
    }
    
    console.log(chalk.green(`📁 ${client.commands.size} commande(s) chargée(s)`));
}

module.exports = { loadCommands };
