const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');
const logger = require('../logger');

// Comando para adicionar vendedor
async function handleAddVendedor(message, args) {
    try {
        logger.info(`🚀 Iniciando comando /vendedor add com ${args.length} argumentos`);
        
        if (args.length < 1) {
            const erro = '❌ Erro: Nome do vendedor é obrigatório\n\n' +
                '💡 *Uso:* `/vendedor add <nome> [telefone] [email] [tipo]`\n\n' +
                '📝 *Exemplos:*\n' +
                '• `/vendedor add "João Silva"`\n' +
                '• `/vendedor add "Maria Santos" "11999999999"`\n' +
                '• `/vendedor add "Pedro Costa" "11988888888" "pedro@email.com"`\n' +
                '• `/vendedor add "Loja ABC" "11977777777" "contato@abc.com" "Revendedor"`\n' +
                '• `/vendedor add "Distribuidor XYZ" "11966666666" "vendas@xyz.com" "Atacado"`';
            
            message.reply(erro);
            return;
        }
        
        const nome = args[0];
        const telefone = args[1] || '';
        const email = args[2] || '';
        const tipo = args[3] || 'Vendedor';
        
        // Validações
        if (!nome || nome.trim() === '') {
            message.reply('❌ Erro: Nome do vendedor é obrigatório');
            return;
        }
        
        if (nome.length < 2) {
            message.reply('❌ Erro: Nome deve ter pelo menos 2 caracteres');
            return;
        }
        
        // Criar vendedor usando excel-manager
        const novoVendedor = await excelManager.createVendedor(nome, telefone, email, tipo);
        const response = responseBuilder.buildVendedorResponse(novoVendedor);
        message.reply(response);
        
    } catch (error) {
        logger.error(`❌ Erro no comando /vendedor add: ${error.message}`);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Comando para listar vendedores
async function handleListVendedores(message) {
    try {
        logger.info(`🚀 Iniciando comando /vendedor list`);
        
        // Listar vendedores usando excel-manager
        const vendedores = await excelManager.readVendedores();
        const response = responseBuilder.buildVendedorListResponse(vendedores);
        message.reply(response);
        
    } catch (error) {
        logger.error(`❌ Erro no comando /vendedor list: ${error.message}`);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

module.exports = {
    handleAddVendedor,
    handleListVendedores
};
