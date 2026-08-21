const logger = require('./logger');
const itemCommands = require('./command-executors/item-commands');
const estoqueCommands = require('./command-executors/estoque-commands');
const systemCommands = require('./command-executors/system-commands');
const vendedorCommands = require('./command-executors/vendedor-commands');
const revendedorCommands = require('./command-executors/revendedor-commands');
const relatorioCommands = require('./command-executors/relatorio-commands');

// Mapeamento de comandos para suas funções executoras
const COMMAND_EXECUTORS = {
    // Comandos de produtos
    'produto': itemCommands.handleProduct,
    'editar': itemCommands.handleEdit,
    
    // Comandos de estoque
    'add': estoqueCommands.handleAdd,
    'rm': estoqueCommands.handleRemove,
    'estoque': estoqueCommands.handleEstoque,
    
    // Comandos de vendedores
    'vendedor': (message, args) => {
        if (args.length === 0) {
            message.reply('❌ Erro: Comando inválido\n\n' +
                '💡 *Uso:*\n' +
                '• `/vendedor add <nome> [telefone] [email] [tipo]`\n' +
                '• `/vendedor list`');
            return;
        }
        
        const subCommand = args[0];
        const subArgs = args.slice(1);
        
        switch (subCommand) {
            case 'add':
                vendedorCommands.handleAddVendedor(message, subArgs);
                break;
            case 'list':
                vendedorCommands.handleListVendedores(message);
                break;
            default:
                message.reply('❌ Erro: Comando inválido\n\n' +
                    '💡 *Uso:*\n' +
                    '• `/vendedor add <nome> [telefone] [email] [tipo]`\n' +
                    '• `/vendedor list`');
        }
    },
    
    // Comandos de revendedores
    'revendedor': (message, args) => {
        if (args.length === 0) {
            message.reply('❌ Erro: Comando inválido\n\n' +
                '💡 *Uso:*\n' +
                '• `/revendedor add <nome> [telefone] [email] [tipo]`\n' +
                '• `/revendedor list`');
            return;
        }
        
        const subCommand = args[0];
        const subArgs = args.slice(1);
        
        switch (subCommand) {
            case 'add':
                revendedorCommands.handleAddRevendedor(message, subArgs);
                break;
            case 'list':
                revendedorCommands.handleListRevendedores(message);
                break;
            default:
                message.reply('❌ Erro: Comando inválido\n\n' +
                    '💡 *Uso:*\n' +
                    '• `/revendedor add <nome> [telefone] [email] [tipo]`\n' +
                    '• `/revendedor list`');
        }
    },
    
    // Comandos de relatórios
    'maisvendidos': relatorioCommands.handleMaisVendidos,
    'melhoresclientes': relatorioCommands.handleMelhoresClientes,
    
    // Comandos do sistema
    'ajuda': systemCommands.handleHelp,
    'status': systemCommands.handleStatus
};

// Função para fazer parsing inteligente dos argumentos (respeita aspas)
function parseArguments(command) {
    const args = [];
    let currentArg = '';
    let inQuotes = false;
    
    for (let i = 0; i < command.length; i++) {
        const char = command[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ' ' && !inQuotes) {
            if (currentArg.trim()) {
                args.push(currentArg.trim());
                currentArg = '';
            }
        } else {
            currentArg += char;
        }
    }
    
    if (currentArg.trim()) {
        args.push(currentArg.trim());
    }
    
    return args;
}

// Função principal para processar comandos
async function processCommand(message, command) {
    try {
        const allArgs = parseArguments(command);
        const commandName = allArgs[0].toLowerCase();
        const args = allArgs.slice(1); // Remove o comando, mantém os argumentos
        
        logger.info(`Processando comando: ${commandName} com ${args.length} argumentos`);
        logger.info(`Argumentos: ${JSON.stringify(args)}`);
        
        if (COMMAND_EXECUTORS[commandName]) {
            await COMMAND_EXECUTORS[commandName](message, args);
        } else {
            message.reply('❌ Comando não reconhecido. Use /ajuda para ver os comandos disponíveis.');
        }
    } catch (error) {
        logger.error('Erro ao processar comando:', error);
        message.reply('❌ Erro interno ao processar comando. Tente novamente.');
    }
}

// Função para executar comando específico (para uso interno)
async function executeCommand(command, message, args) {
    try {
        if (COMMAND_EXECUTORS[command]) {
            await COMMAND_EXECUTORS[command](message, args);
        } else {
            throw new Error(`Comando '${command}' não encontrado`);
        }
    } catch (error) {
        logger.error(`Erro ao executar comando ${command}:`, error);
        throw error;
    }
}

module.exports = { processCommand, executeCommand };
