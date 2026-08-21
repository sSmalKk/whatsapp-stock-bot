const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');
const logger = require('../logger');

// Comando para adicionar revendedor
async function handleAddRevendedor(message, args) {
    try {
        logger.info(`🚀 Iniciando comando /revendedor add com ${args.length} argumentos`);
        
        if (args.length < 1) {
            const erro = '❌ Erro: Nome do revendedor é obrigatório\n\n' +
                '💡 *Uso:* `/revendedor add <nome> [telefone] [email] [tipo]`\n\n' +
                '📝 *Exemplos:*\n' +
                '• `/revendedor add "Distribuidor XYZ"`\n' +
                '• `/revendedor add "Loja ABC" "11977777777"`\n' +
                '• `/revendedor add "Atacado 123" "11966666666" "contato@123.com"`\n' +
                '• `/revendedor add "Drop Shipper" "11955555555" "vendas@drop.com" "Drop Shipping"`';
            
            message.reply(erro);
            return;
        }
        
        const nome = args[0];
        const telefone = args[1] || '';
        const email = args[2] || '';
        const tipo = args[3] || 'Drop Shipping';
        
        // Validações
        if (!nome || nome.trim() === '') {
            message.reply('❌ Erro: Nome do revendedor é obrigatório');
            return;
        }
        
        if (nome.length < 2) {
            message.reply('❌ Erro: Nome deve ter pelo menos 2 caracteres');
            return;
        }
        
        // Criar revendedor usando excel-manager
        const novoRevendedor = await excelManager.createRevendedor(nome, telefone, email, tipo);
        const response = responseBuilder.buildRevendedorResponse(novoRevendedor);
        message.reply(response);
        
    } catch (error) {
        logger.error(`❌ Erro no comando /revendedor add: ${error.message}`);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Comando para listar revendedores
async function handleListRevendedores(message) {
    try {
        logger.info(`🚀 Iniciando comando /revendedor list`);
        
        // Listar revendedores usando excel-manager
        const revendedores = await excelManager.readRevendedores();
        const response = responseBuilder.buildRevendedorListResponse(revendedores);
        message.reply(response);
        
    } catch (error) {
        logger.error(`❌ Erro no comando /revendedor list: ${error.message}`);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

module.exports = {
    handleAddRevendedor,
    handleListRevendedores
};

