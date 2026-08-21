const logger = require('./logger');
const commandHandler = require('./command-handler');

// Processador principal de mensagens
function processMessage(message) {
    try {
        if (message.from === 'status@broadcast') return; // Ignorar mensagens de status

        const text = message.body.toLowerCase().trim();
        logger.debug(`Mensagem recebida de ${message.from}: ${text}`);

        // Roteamento inteligente de mensagens
        if (text.startsWith('/')) {
            // Comando direto
            const command = text.substring(1);
            commandHandler.processCommand(message, command);
        } else {
            // Comando por palavra-chave
            routeKeywordMessage(message, text);
        }
    } catch (error) {
        logger.error('Erro ao processar mensagem:', error);
        message.reply('❌ Erro interno. Tente novamente.');
    }
}

// Roteamento por palavra-chave (sem duplicação)
function routeKeywordMessage(message, text) {
    const keywordHandlers = {
        'ajuda': () => commandHandler.executeCommand('ajuda', message, []),
        'help': () => commandHandler.executeCommand('ajuda', message, []),
        'comandos': () => commandHandler.executeCommand('ajuda', message, []),
        'estoque': () => commandHandler.executeCommand('estoque', message, []),
        'stock': () => commandHandler.executeCommand('estoque', message, []),
        'inventario': () => commandHandler.executeCommand('estoque', message, []),
        'status': () => commandHandler.executeCommand('status', message, []),
        'info': () => commandHandler.executeCommand('status', message, []),
        'estado': () => commandHandler.executeCommand('status', message, [])
    };

    // Executar handler se palavra-chave encontrada
    for (const [keyword, handler] of Object.entries(keywordHandlers)) {
        if (text.includes(keyword)) {
            handler();
            return;
        }
    }
}

module.exports = {
    processMessage
};
