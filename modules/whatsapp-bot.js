const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('./logger');
const messageProcessor = require('./message-processor');

let client = null;
let isConnected = false;
let isReady = false;

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            client = new Client({
                authStrategy: new LocalAuth({
                    clientId: process.env.SESSION_NAME || 'estoque_bot'
                }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            });

            client.on('qr', (qr) => {
                logger.info('QR Code gerado para autenticação WhatsApp');
                qrcode.generate(qr, { small: true });
            });

            client.on('ready', () => {
                isReady = true;
                isConnected = true;
                logger.info('Bot WhatsApp conectado e pronto');
                resolve();
            });

            client.on('authenticated', () => {
                logger.info('Autenticação WhatsApp realizada');
            });

            client.on('auth_failure', (msg) => {
                logger.error('Falha na autenticação WhatsApp:', msg);
                reject(new Error('Falha na autenticação'));
            });

            client.on('disconnected', (reason) => {
                isConnected = false;
                isReady = false;
                logger.warn('Bot WhatsApp desconectado:', reason);
            });

            client.on('message', messageProcessor.processMessage);

            client.initialize().catch(reject);
        } catch (error) {
            logger.error('Erro ao inicializar bot WhatsApp:', error);
            reject(error);
        }
    });
}





async function disconnect() {
    if (client) {
        await client.destroy();
        isConnected = false;
        isReady = false;
        logger.info('Bot WhatsApp desconectado');
    }
}

function getStatus() {
    return {
        isConnected,
        isReady,
        sessionName: process.env.SESSION_NAME || 'estoque_bot'
    };
}

module.exports = {
    initialize,
    disconnect,
    getStatus
};
