const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');
const logger = require('../logger');

// Comando para produtos mais vendidos
function handleMaisVendidos(message, args) {
    try {
        logger.info(`🚀 Iniciando comando /maisvendidos`);
        
        const movimentacoes = excelManager.readMovimentacoes();
        
        if (movimentacoes.length === 0) {
            message.reply('📊 *RELATÓRIO - PRODUTOS MAIS VENDIDOS*\n\n' +
                '❌ Nenhuma movimentação registrada ainda.\n\n' +
                '💡 Use `/add <código> <quantidade>` para registrar vendas.');
            return;
        }
        
        // Filtrar apenas saídas (vendas)
        const vendas = movimentacoes.filter(mov => mov.Tipo === 'Saída');
        
        if (vendas.length === 0) {
            message.reply('📊 *RELATÓRIO - PRODUTOS MAIS VENDIDOS*\n\n' +
                '❌ Nenhuma venda registrada ainda.\n\n' +
                '💡 Use `/rm <código> <quantidade> <cliente>` para registrar vendas.');
            return;
        }
        
        // Agrupar por produto e somar quantidades (usar valor absoluto para quantidades negativas)
        const produtosVendidos = {};
        vendas.forEach(venda => {
            const codigo = venda['Código Produto'];
            const nome = venda['Nome Produto'];
            const quantidade = Math.abs(parseInt(venda.Quantidade) || 0); // Usar valor absoluto
            const valorTotal = parseFloat(venda['Valor Total']) || 0;
            
            if (!produtosVendidos[codigo]) {
                produtosVendidos[codigo] = {
                    codigo,
                    nome,
                    quantidadeTotal: 0,
                    valorTotal: 0
                };
            }
            
            produtosVendidos[codigo].quantidadeTotal += quantidade;
            produtosVendidos[codigo].valorTotal += valorTotal;
        });
        
        // Converter para array e ordenar por quantidade
        const ranking = Object.values(produtosVendidos)
            .sort((a, b) => b.quantidadeTotal - a.quantidadeTotal)
            .slice(0, 10); // Top 10
        
        // Construir resposta
        const resposta = responseBuilder.buildMaisVendidosResponse(ranking);
        message.reply(resposta);
        
    } catch (error) {
        logger.error(`❌ Erro no comando /maisvendidos: ${error.message}`);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Comando para melhores clientes
function handleMelhoresClientes(message, args) {
    try {
        logger.info(`🚀 Iniciando comando /melhoresclientes`);
        
        const movimentacoes = excelManager.readMovimentacoes();
        
        if (movimentacoes.length === 0) {
            message.reply('📊 *RELATÓRIO - MELHORES CLIENTES*\n\n' +
                '❌ Nenhuma movimentação registrada ainda.\n\n' +
                '💡 Use `/rm <código> <quantidade> <cliente>` para registrar vendas.');
            return;
        }
        
        // Filtrar apenas saídas (vendas) com cliente
        const vendas = movimentacoes.filter(mov => 
            mov.Tipo === 'Saída' && mov.Cliente && mov.Cliente.trim() !== ''
        );
        
        if (vendas.length === 0) {
            message.reply('📊 *RELATÓRIO - MELHORES CLIENTES*\n\n' +
                '❌ Nenhuma venda com cliente registrada ainda.\n\n' +
                '💡 Use `/rm <código> <quantidade> <cliente>` para registrar vendas com cliente.');
            return;
        }
        
        // Agrupar por cliente e somar valores (usar valor absoluto para quantidades negativas)
        const clientes = {};
        vendas.forEach(venda => {
            const cliente = venda.Cliente;
            const quantidade = Math.abs(parseInt(venda.Quantidade) || 0); // Usar valor absoluto
            const valorTotal = parseFloat(venda['Valor Total']) || 0;
            
            if (!clientes[cliente]) {
                clientes[cliente] = {
                    nome: cliente,
                    quantidadeTotal: 0,
                    valorTotal: 0,
                    compras: 0
                };
            }
            
            clientes[cliente].quantidadeTotal += quantidade;
            clientes[cliente].valorTotal += valorTotal;
            clientes[cliente].compras += 1;
        });
        
        // Converter para array e ordenar por valor total
        const ranking = Object.values(clientes)
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, 10); // Top 10
        
        // Construir resposta
        const resposta = responseBuilder.buildMelhoresClientesResponse(ranking);
        message.reply(resposta);
        
    } catch (error) {
        logger.error(`❌ Erro no comando /melhoresclientes: ${error.message}`);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

module.exports = {
    handleMaisVendidos,
    handleMelhoresClientes
};
