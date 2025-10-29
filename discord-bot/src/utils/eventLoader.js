const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    console.log(chalk.blue('📁 Chargement des événements...'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        
        console.log(chalk.green(`  ✅ Événement chargé: ${event.name}`));
    }
    
    console.log(chalk.green(`📁 ${eventFiles.length} événement(s) chargé(s)`));
}

module.exports = { loadEvents };
