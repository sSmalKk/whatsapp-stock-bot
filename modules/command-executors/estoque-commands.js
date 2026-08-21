const logger = require('../logger');
const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');

// Comando: Adicionar estoque (Entrada)
async function handleAdd(message, args) {
    logger.info(`🚀 Iniciando comando /add com ${args.length} argumentos`);
    
    if (args.length < 2) {
        message.reply('❌ Uso: /add <código> <quantidade>\n\n' +
            '💡 *Exemplo:* /add 1 100\n' +
            '📦 Adiciona quantidade ao estoque do produto');
        return;
    }

    const codigo = args[0];
    const quantidade = args[1];

    // Validar código
    const codigoNum = parseInt(codigo);
    if (isNaN(codigoNum) || codigoNum < 1 || codigoNum > 30) {
        message.reply('❌ Erro: Código deve ser um número entre 1 e 30');
        return;
    }

    // Validar quantidade
    const quantidadeNum = parseFloat(quantidade);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        message.reply('❌ Erro: Quantidade deve ser um número maior que zero');
        return;
    }

    try {
        // Buscar item existente
        const itens = await excelManager.readItems();
        const item = itens.find(i => i.Código === codigoNum.toString());

        if (!item) {
            message.reply(`❌ Erro: Produto com código ${codigoNum} não encontrado\n\n` +
                '💡 Use /produto para cadastrar o produto primeiro');
            return;
        }

        // Registrar movimentação de entrada
        const movimentacaoData = {
            tipo: 'Entrada',
            codigo: codigoNum.toString(),
            produto: item['Nome do Produto'],
            quantidade: quantidadeNum,
            precoUnitario: parseFloat(item['Preço de Compra']) || 0,
            vendedor: '',
            cliente: '',
            motivo: 'Entrada via WhatsApp',
            observacoes: 'Entrada registrada via comando /add'
        };

        const resultado = await excelManager.createMovimentacao(movimentacaoData);
        const response = responseBuilder.buildAddResponse(resultado, item, quantidadeNum);
        message.reply(response);

    } catch (error) {
        logger.error('Erro ao adicionar estoque:', error);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Comando: Remover estoque (Saída)
async function handleRemove(message, args) {
    logger.info(`🚀 Iniciando comando /rm com ${args.length} argumentos`);
    
    if (args.length < 3) {
        message.reply('❌ Uso: /rm <código> <quantidade> <cliente> [vendedor]\n\n' +
            '💡 *Exemplos:*\n' +
            '• /rm 1 5 "João Silva"\n' +
            '• /rm 1 5 "João Silva" "Loja ABC"\n' +
            '📦 Remove quantidade do estoque e registra venda');
        return;
    }

    const codigo = args[0];
    const quantidade = args[1];
    const cliente = args[2]; // Cliente é o terceiro argumento
            const vendedor = args[3] || ''; // Vendedor é opcional (quarto argumento)

    // Validar código
    const codigoNum = parseInt(codigo);
    if (isNaN(codigoNum) || codigoNum < 1 || codigoNum > 30) {
        message.reply('❌ Erro: Código deve ser um número entre 1 e 30');
        return;
    }

    // Validar quantidade
    const quantidadeNum = parseFloat(quantidade);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        message.reply('❌ Erro: Quantidade deve ser um número maior que zero');
        return;
    }

    // Validar cliente
    if (!cliente || cliente.trim().length === 0) {
        message.reply('❌ Erro: Nome do cliente é obrigatório');
        return;
    }

    try {
        // Buscar item existente
        const itens = await excelManager.readItems();
        const item = itens.find(i => i.Código === codigoNum.toString());

        if (!item) {
            message.reply(`❌ Erro: Produto com código ${codigoNum} não encontrado\n\n` +
                '💡 Use /produto para cadastrar o produto primeiro');
            return;
        }

        // Verificar estoque disponível (nova estrutura)
        const estoque = await excelManager.calculateEstoque();
        const itemEstoque = estoque.find(e => e.Código === codigoNum.toString());
        const estoqueAtual = itemEstoque ? parseFloat(itemEstoque['Quantidade Fim Dia']) : 0;

        if (estoqueAtual < quantidadeNum) {
            message.reply(`❌ Erro: Estoque insuficiente!\n\n` +
                `📦 Produto: ${item['Nome do Produto']}\n` +
                `📊 Disponível: ${estoqueAtual}\n` +
                `❌ Solicitado: ${quantidadeNum}`);
            return;
        }

        // Registrar movimentação de saída
        const movimentacaoData = {
            tipo: 'Saída',
            codigo: codigoNum.toString(),
            produto: item['Nome do Produto'],
            quantidade: -quantidadeNum, // Quantidade NEGATIVA para saídas
            precoUnitario: parseFloat(item['Preço Varejo']) || 0, // Usar preço varejo para saídas
            vendedor: vendedor.trim(), // Incluir vendedor se fornecido
            cliente: cliente.trim(),
            motivo: 'Venda via WhatsApp',
            observacoes: 'Saída registrada via comando /rm'
        };

        const resultado = await excelManager.createMovimentacao(movimentacaoData);
        const response = responseBuilder.buildRemoveResponse(resultado, item, quantidadeNum, estoqueAtual, cliente.trim(), vendedor.trim());
        message.reply(response);

    } catch (error) {
        logger.error('Erro ao remover estoque:', error);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Comando: Consultar estoque
async function handleEstoque(message, args) {
    try {
        let estoque = await excelManager.calculateEstoque();
        let filtroData = null;

        // Processar filtro de data se fornecido
        if (args.length > 0) {
            filtroData = parseDateFilter(args[0]);
            if (filtroData) {
                // Filtrar movimentações por data
                const movimentacoes = await excelManager.readMovimentacoes();
                const movimentacoesFiltradas = movimentacoes.filter(mov => {
                    const movData = new Date(mov['Data/Hora']);
                    return movData.toDateString() === filtroData.toDateString();
                });

                // Recalcular estoque baseado nas movimentações filtradas
                estoque = await excelManager.calculateEstoque(); // Por enquanto, retorna estoque atual
                // TODO: Implementar filtro por data no estoque
            }
        }

        const response = responseBuilder.buildEstoqueResponse(estoque, filtroData);
        message.reply(response);

    } catch (error) {
        logger.error('Erro ao consultar estoque:', error);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Função para processar filtros de data
function parseDateFilter(dateArg) {
    const hoje = new Date();
    
    switch (dateArg.toLowerCase()) {
        case 'hoje':
            return hoje;
        case 'semana':
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());
            return inicioSemana;
        default:
            // Tentar parsear como data específica (YYYY-MM-DD)
            const parsedDate = new Date(dateArg);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
            return null;
    }
}

module.exports = { handleAdd, handleRemove, handleEstoque };
