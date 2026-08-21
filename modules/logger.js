const fs = require('fs');
const path = require('path');

const logDir = './logs';
const logFile = path.join(logDir, 'bot.log');

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
        logMessage += ` ${JSON.stringify(data)}`;
    }
    
    return logMessage;
}

function writeToFile(message) {
    fs.appendFileSync(logFile, message + '\n');
}

function log(level, message, data = null) {
    const formattedMessage = formatMessage(level, message, data);
    
    // Console output
    console.log(formattedMessage);
    
    // File output
    writeToFile(formattedMessage);
}

module.exports = {
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
    debug: (message, data) => {
        if (process.env.LOG_LEVEL === 'debug') {
            log('debug', message, data);
        }
    }
};
