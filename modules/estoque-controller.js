const excelManager = require('./excel-manager');
const logger = require('./logger');

async function getEstoque() {
    try {
        const estoque = excelManager.calculateEstoque();
        
        // Calcular estatísticas
        const totalProdutos = estoque.length;
        const totalValor = estoque.reduce((sum, item) => sum + (parseFloat(item['Valor Total Estoque']) || 0), 0);
        const produtosBaixoEstoque = estoque.filter(item => (parseFloat(item.Quantidade) || 0) < 10);
        
        return {
            produtos: estoque,
            estatisticas: {
                totalProdutos,
                totalValor: totalValor.toFixed(2),
                produtosBaixoEstoque: produtosBaixoEstoque.length,
                ultimaAtualizacao: new Date().toISOString()
            }
        };
    } catch (error) {
        logger.error('Erro ao buscar estoque:', error);
        throw error;
    }
}

async function atualizarEstoque(codigo, quantidade, operacao) {
    try {
        // Validações
        if (!codigo || !quantidade || !operacao) {
            throw new Error('Código, quantidade e operação são obrigatórios');
        }
        
        if (isNaN(quantidade) || parseFloat(quantidade) < 0) {
            throw new Error('Quantidade deve ser um número positivo');
        }
        
        if (!['adicionar', 'remover', 'definir'].includes(operacao)) {
            throw new Error('Operação deve ser: adicionar, remover ou definir');
        }
        
        // TODO: Implementar função updateEstoqueItem no excel-manager
        throw new Error('Funcionalidade de atualização de estoque será implementada em breve');
        
    } catch (error) {
        logger.error('Erro ao atualizar estoque via API:', error);
        throw error;
    }
}

async function buscarProduto(codigo) {
    try {
        const produto = excelManager.readItemByCode(codigo);
        
        return {
            success: true,
            data: produto
        };
    } catch (error) {
        logger.error('Erro ao buscar produto:', error);
        throw error;
    }
}

async function adicionarProduto(productData) {
    try {
        // Validações
        if (!productData.codigo || !productData.nome) {
            throw new Error('Código e nome são obrigatórios');
        }
        
        if (productData.precoUnitario && (isNaN(productData.precoUnitario) || parseFloat(productData.precoUnitario) < 0)) {
            throw new Error('Preço unitário deve ser um número positivo');
        }
        
        // Verificar se produto já existe
        const itens = excelManager.readItems();
        const itemExistente = itens.find(item => item.Código === productData.codigo);
        
        if (itemExistente) {
            throw new Error(`Item com código ${productData.codigo} já existe`);
        }
        
        // TODO: Implementar função createItem com preços individuais no excel-manager
        throw new Error('Funcionalidade de cadastro de produto será implementada em breve');
        
    } catch (error) {
        logger.error('Erro ao cadastrar item via API:', error);
        throw error;
    }
}

async function removerProduto(codigo) {
    try {
        // TODO: Implementar função deleteItem no excel-manager
        throw new Error('Funcionalidade de remoção de produto será implementada em breve');
    } catch (error) {
        logger.error('Erro ao remover produto:', error);
        throw error;
    }
}

async function exportarEstoque(formato = 'xlsx') {
    try {
        if (formato !== 'xlsx') {
            throw new Error('Formato não suportado. Use xlsx');
        }
        
        // O excel-manager já salva automaticamente
        const estoque = excelManager.calculateEstoque();
        
        return {
            success: true,
            data: {
                formato,
                arquivo: process.env.EXCEL_FILE_PATH || './estoque.xlsx',
                totalProdutos: estoque.length,
                timestamp: new Date().toISOString()
            },
            message: 'Estoque exportado com sucesso'
        };
    } catch (error) {
        logger.error('Erro ao exportar estoque:', error);
        throw error;
    }
}

async function getRelatorioEstoque() {
    try {
        const estoque = excelManager.calculateEstoque();
        
        // Agrupar por categoria
        const porCategoria = {};
        estoque.forEach(item => {
            const categoria = item.Categoria || 'Sem Categoria';
            if (!porCategoria[categoria]) {
                porCategoria[categoria] = {
                    produtos: [],
                    totalQuantidade: 0,
                    totalValor: 0
                };
            }
            
            const quantidade = parseFloat(item.Quantidade) || 0;
            const valor = parseFloat(item['Valor Total Estoque']) || 0;
            
            porCategoria[categoria].produtos.push(item);
            porCategoria[categoria].totalQuantidade += quantidade;
            porCategoria[categoria].totalValor += valor;
        });
        
        // Calcular totais gerais
        const totalGeral = estoque.reduce((sum, item) => {
            return {
                quantidade: sum.quantidade + (parseFloat(item.Quantidade) || 0),
                valor: sum.valor + (parseFloat(item['Valor Total Estoque']) || 0)
            };
        }, { quantidade: 0, valor: 0 });
        
        return {
            success: true,
            data: {
                porCategoria,
                totalGeral,
                totalProdutos: estoque.length,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        logger.error('Erro ao gerar relatório:', error);
        throw error;
    }
}

module.exports = {
    getEstoque,
    atualizarEstoque,
    buscarProduto,
    adicionarProduto,
    removerProduto,
    exportarEstoque,
    getRelatorioEstoque
};
