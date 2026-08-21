const logger = require('../logger');
const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');

// Comando: Ajuda
function handleHelp(message, args) {
    const response = responseBuilder.buildHelpResponse();
    message.reply(response);
}

// Comando: Status do sistema
async function handleStatus(message, args) {
    try {
        const status = await excelManager.getSystemStatus();
        const response = responseBuilder.buildStatusResponse(status);
        message.reply(response);
    } catch (error) {
        logger.error('Erro ao obter status:', error);
        message.reply('❌ Erro ao obter status do sistema');
    }
}

module.exports = { handleHelp, handleStatus };
