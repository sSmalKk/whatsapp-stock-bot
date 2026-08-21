const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH || './estoque.xlsx';

let workbook = null;
let worksheetItens = null;
let worksheetMovimentacoes = null;
let worksheetEstoque = null;

// Headers para as diferentes abas
const ITENS_HEADERS = [
    'Código', 'Nome do Produto', 'Categoria', 
    'Preço de Compra', 'Preço Varejo', 'Preço Atacado', 'Preço Drop',
    'Lucro Varejo (R$)', '% Lucro Varejo', 'Lucro Atacado (R$)', '% Lucro Atacado',
    'Lucro Drop (R$)', '% Lucro Drop', 'Data Cadastro', 'Última Atualização'
];

const MOVIMENTACOES_HEADERS = [
    'Data/Hora', 'Tipo', 'Código Produto', 'Nome Produto', 'Quantidade', 
    'Preço Unitário', 'Valor Total', 'Cliente', 'Vendedor/Revendedor', 'Observações'
];

// ESTRUTURA CORRETA: ESTOQUE = Resumo diário com início/fim
const ESTOQUE_HEADERS = [
    'Data', 'Código', 'Nome do Produto', 'Categoria', 
    'Quantidade Início Dia', 'Quantidade Fim Dia', 'Entradas', 'Saídas',
    'Preço de Compra', 'Preço Varejo', 'Preço Atacado', 'Preço Drop',
    'Valor Total Estoque', 'Status', 'Última Atualização'
];

const VENDEDORES_HEADERS = [
    'ID', 'Nome', 'Telefone', 'Email', 'Tipo', 'Data Cadastro', 'Status'
];

const REVENDEDORES_HEADERS = [
    'ID', 'Nome', 'Telefone', 'Email', 'Tipo Drop Shipping', 'Data Cadastro', 'Status'
];

const RELATORIOS_HEADERS = [
    'Data', 'Tipo Relatório', 'Produto', 'Quantidade', 'Valor Total', 'Cliente', 'Vendedor/Revendedor'
];

// Nomes das abas
const WORKSHEET_ITENS = 'Itens';
const WORKSHEET_MOVIMENTACOES = 'Movimentações';
const WORKSHEET_ESTOQUE = 'Estoque';
const WORKSHEET_VENDEDORES = 'Vendedores';
const WORKSHEET_REVENDEDORES = 'Revendedores';
const WORKSHEET_RELATORIOS = 'Relatórios';

// ========================================
// FUNÇÕES DE INICIALIZAÇÃO E CONFIGURAÇÃO
// ========================================

function createDefaultWorkbook() {
    const workbook = XLSX.utils.book_new();
    
    // Aba Itens (Produtos 1-30)
    const worksheetItens = XLSX.utils.aoa_to_sheet([ITENS_HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheetItens, WORKSHEET_ITENS);
    
    // Aba Movimentações (Entrada/Saída)
    const worksheetMovimentacoes = XLSX.utils.aoa_to_sheet([MOVIMENTACOES_HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheetMovimentacoes, WORKSHEET_MOVIMENTACOES);
    
    // Aba Estoque (Calculado automaticamente)
    const worksheetEstoque = XLSX.utils.aoa_to_sheet([ESTOQUE_HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheetEstoque, WORKSHEET_ESTOQUE);
    
    // Aba Vendedores (2 vendedores)
    const worksheetVendedores = XLSX.utils.aoa_to_sheet([VENDEDORES_HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheetVendedores, WORKSHEET_VENDEDORES);
    
    // Aba Revendedores (5 revendedores drop shipping)
    const worksheetRevendedores = XLSX.utils.aoa_to_sheet([REVENDEDORES_HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheetRevendedores, WORKSHEET_REVENDEDORES);
    
    // Aba Relatórios (mais vendidos + melhores clientes)
    const worksheetRelatorios = XLSX.utils.aoa_to_sheet([RELATORIOS_HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheetRelatorios, WORKSHEET_RELATORIOS);
    
    return workbook;
}

function loadWorkbook() {
    try {
        if (fs.existsSync(EXCEL_FILE_PATH)) {
            workbook = XLSX.readFile(EXCEL_FILE_PATH);
            logger.info(`📁 Arquivo Excel carregado: ${EXCEL_FILE_PATH}`);
            
            // Definir as variáveis de worksheet
            worksheetItens = workbook.Sheets[WORKSHEET_ITENS];
            worksheetMovimentacoes = workbook.Sheets[WORKSHEET_MOVIMENTACOES];
            worksheetEstoque = workbook.Sheets[WORKSHEET_ESTOQUE];
            
            // Verificar se todas as abas necessárias existem
            const requiredSheets = [
                WORKSHEET_ITENS, WORKSHEET_MOVIMENTACOES, WORKSHEET_ESTOQUE,
                WORKSHEET_VENDEDORES, WORKSHEET_REVENDEDORES, WORKSHEET_RELATORIOS
            ];
            
            const existingSheets = workbook.SheetNames;
            const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
            
            if (missingSheets.length > 0) {
                logger.warn(`⚠️ Abas faltando: ${missingSheets.join(', ')}`);
                logger.info(`🔄 Criando abas faltantes...`);
                
                // Criar abas faltantes
                missingSheets.forEach(sheetName => {
                    let headers;
                    switch (sheetName) {
                        case WORKSHEET_ITENS:
                            headers = ITENS_HEADERS;
                            break;
                        case WORKSHEET_MOVIMENTACOES:
                            headers = MOVIMENTACOES_HEADERS;
                            break;
                        case WORKSHEET_ESTOQUE:
                            headers = ESTOQUE_HEADERS;
                            break;
                        case WORKSHEET_VENDEDORES:
                            headers = VENDEDORES_HEADERS;
                            break;
                        case WORKSHEET_REVENDEDORES:
                            headers = REVENDEDORES_HEADERS;
                            break;
                        case WORKSHEET_RELATORIOS:
                            headers = RELATORIOS_HEADERS;
                            break;
                    }
                    
                    if (headers) {
                        const newSheet = XLSX.utils.aoa_to_sheet([headers]);
                        XLSX.utils.book_append_sheet(workbook, newSheet, sheetName);
                        logger.info(`✅ Aba criada: ${sheetName}`);
                    }
                });
                
                // Salvar workbook atualizado
                XLSX.writeFile(workbook, EXCEL_FILE_PATH);
                logger.info(`💾 Workbook atualizado com todas as abas`);
                
                            // Redefinir as variáveis de worksheet após criar novas abas
            worksheetItens = workbook.Sheets[WORKSHEET_ITENS];
            worksheetMovimentacoes = workbook.Sheets[WORKSHEET_MOVIMENTACOES];
            worksheetEstoque = workbook.Sheets[WORKSHEET_ESTOQUE];
        } else {
            logger.info(`✅ Todas as abas necessárias encontradas`);
        }
        
        // ATUALIZAR ESTOQUE na inicialização para garantir dados corretos
        try {
            updateEstoqueSheet();
            logger.info(`✅ Estoque inicializado e atualizado`);
        } catch (error) {
            logger.warn(`⚠️ Erro ao inicializar estoque: ${error.message}`);
        }
        
        return true;
        } else {
            logger.info(`📁 Arquivo Excel não encontrado. Criando novo...`);
            workbook = createDefaultWorkbook();
            XLSX.writeFile(workbook, EXCEL_FILE_PATH);
            logger.info(`✅ Novo arquivo Excel criado com todas as abas`);
            
            // Definir as variáveis de worksheet para o novo workbook
            worksheetItens = workbook.Sheets[WORKSHEET_ITENS];
            worksheetMovimentacoes = workbook.Sheets[WORKSHEET_MOVIMENTACOES];
            worksheetEstoque = workbook.Sheets[WORKSHEET_ESTOQUE];
            
            return true;
        }
    } catch (error) {
        logger.error(`❌ Erro ao carregar workbook: ${error.message}`);
        return false;
    }
}

function saveWorkbook() {
    try {
        XLSX.writeFile(workbook, EXCEL_FILE_PATH);
        logger.debug('Arquivo Excel salvo');
        
        // Recarregar os worksheets após salvar
        worksheetItens = workbook.Sheets[WORKSHEET_ITENS];
        worksheetMovimentacoes = workbook.Sheets[WORKSHEET_MOVIMENTACOES];
        worksheetEstoque = workbook.Sheets[WORKSHEET_ESTOQUE];
    } catch (error) {
        logger.error('Erro ao salvar Excel:', error);
        throw error;
    }
}

// ========================================
// FUNÇÕES CRUD PARA ITENS (PRODUTOS)
// ========================================

// CREATE - Criar novo item
function createItem(codigo, nome, categoria, precoCompra, precoVarejo, precoAtacado, precoDrop) {
    try {
        // Validações
        if (codigo < 1 || codigo > 30) {
            throw new Error('Código deve ser entre 1 e 30');
        }
        
        if (!nome || !categoria) {
            throw new Error('Nome e categoria são obrigatórios');
        }
        
        if (precoCompra <= 0 || precoVarejo <= 0 || precoAtacado <= 0 || precoDrop <= 0) {
            throw new Error('Todos os preços devem ser maiores que zero');
        }
        
        if (precoCompra >= precoVarejo || precoCompra >= precoAtacado || precoCompra >= precoDrop) {
            throw new Error('Preço de compra deve ser menor que os preços de venda');
        }
        
        // Verificar se produto já existe
        const itens = readItems();
        const itemExistente = itens.find(item => item.Código === codigo.toString());
        
        if (itemExistente) {
            throw new Error(`Item com código ${codigo} já existe`);
        }
        
        // Calcular lucros
        const lucroVarejo = precoVarejo - precoCompra;
        const lucroAtacado = precoAtacado - precoCompra;
        const lucroDrop = precoDrop - precoCompra;
        
        const percentualVarejo = ((lucroVarejo / precoCompra) * 100);
        const percentualAtacado = ((lucroAtacado / precoCompra) * 100);
        const percentualDrop = ((lucroDrop / precoCompra) * 100);
        
        // Criar novo item
        const novoItem = {
            Código: codigo.toString(),
            'Nome do Produto': nome,
            Categoria: categoria,
            'Preço de Compra': precoCompra.toFixed(2),
            'Preço Varejo': precoVarejo.toFixed(2),
            'Preço Atacado': precoAtacado.toFixed(2),
            'Preço Drop': precoDrop.toFixed(2),
            'Lucro Varejo (R$)': lucroVarejo.toFixed(2),
            '% Lucro Varejo': percentualVarejo.toFixed(2),
            'Lucro Atacado (R$)': lucroAtacado.toFixed(2),
            '% Lucro Atacado': percentualAtacado.toFixed(2),
            'Lucro Drop (R$)': lucroDrop.toFixed(2),
            '% Lucro Drop': percentualDrop.toFixed(2),
            'Data Cadastro': new Date().toISOString(),
            'Última Atualização': new Date().toISOString()
        };
        
        // Adicionar ao worksheet
        const data = XLSX.utils.sheet_to_json(worksheetItens, { header: 1 });
        const headers = data[0];
        const rows = data.slice(1);
        
        const newRow = [
            novoItem.Código,
            novoItem['Nome do Produto'],
            novoItem.Categoria,
            novoItem['Preço de Compra'],
            novoItem['Preço Varejo'],
            novoItem['Preço Atacado'],
            novoItem['Preço Drop'],
            novoItem['Lucro Varejo (R$)'],
            novoItem['% Lucro Varejo'],
            novoItem['Lucro Atacado (R$)'],
            novoItem['% Lucro Atacado'],
            novoItem['Lucro Drop (R$)'],
            novoItem['% Lucro Drop'],
            novoItem['Data Cadastro'],
            novoItem['Última Atualização']
        ];
        
        rows.push(newRow);
        
        // Atualizar worksheet
        const newData = [headers, ...rows];
        const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
        workbook.Sheets[WORKSHEET_ITENS] = newWorksheet;
        worksheetItens = newWorksheet;
        
        // Salvar
        saveWorkbook();
        
        // ATUALIZAR ESTOQUE após criar novo item
        try {
            updateEstoqueSheet();
            logger.info(`✅ Estoque atualizado após criar novo item`);
        } catch (error) {
            logger.warn(`⚠️ Erro ao atualizar estoque: ${error.message}`);
        }
        
        logger.info(`✅ Novo produto cadastrado: ${nome} (Código: ${codigo})`);
        
        return novoItem;
        
    } catch (error) {
        logger.error(`❌ Erro ao criar produto: ${error.message}`);
        throw error;
    }
}

// READ - Ler todos os itens
function readItems() {
    try {
        const data = XLSX.utils.sheet_to_json(worksheetItens, { header: 1 });
        if (data.length <= 1) return [];
        
        const headers = data[0];
        const rows = data.slice(1);
        
        return rows.map(row => {
            const item = {};
            headers.forEach((header, index) => {
                item[header] = row[index] || '';
            });
            return item;
        });
    } catch (error) {
        logger.error('Erro ao ler dados dos itens:', error);
        throw error;
    }
}

// READ - Ler item específico por código
function readItemByCode(codigo) {
    try {
        const itens = readItems();
        const item = itens.find(i => i.Código === codigo.toString());
        
        if (!item) {
            throw new Error(`Produto com código ${codigo} não encontrado`);
        }
        
        return item;
    } catch (error) {
        logger.error(`❌ Erro ao buscar produto ${codigo}: ${error.message}`);
        throw error;
    }
}

// UPDATE - Atualizar item
function updateItem(codigo, campo, novoValor) {
    try {
        // Converter worksheet para array de arrays
        const data = XLSX.utils.sheet_to_json(worksheetItens, { header: 1 });
        if (data.length <= 1) {
            throw new Error('Nenhum item encontrado');
        }
        
        const headers = data[0];
        const rows = data.slice(1);
        
        // Encontrar a linha do item
        const itemIndex = rows.findIndex(row => row[0] === codigo.toString());
        if (itemIndex === -1) {
            throw new Error(`Produto com código ${codigo} não encontrado`);
        }
        
        // Encontrar o índice da coluna
        const columnIndex = headers.findIndex(header => {
            switch (campo) {
                case 'compra': return header === 'Preço de Compra';
                case 'varejo': return header === 'Preço Varejo';
                case 'atacado': return header === 'Preço Atacado';
                case 'drop': return header === 'Preço Drop';
                case 'nome': return header === 'Nome do Produto';
                case 'categoria': return header === 'Categoria';
                default: return false;
            }
        });
        
        if (columnIndex === -1) {
            throw new Error(`Campo ${campo} não encontrado`);
        }
        
        // Atualizar o valor na linha
        rows[itemIndex][columnIndex] = novoValor;
        
        // Se for um preço, recalcular lucros
        if (campo === 'compra' || campo === 'varejo' || campo === 'atacado' || campo === 'drop') {
            const precoCompra = parseFloat(rows[itemIndex][headers.findIndex(h => h === 'Preço de Compra')]) || 0;
            const precoVarejo = parseFloat(rows[itemIndex][headers.findIndex(h => h === 'Preço Varejo')]) || 0;
            const precoAtacado = parseFloat(rows[itemIndex][headers.findIndex(h => h === 'Preço Atacado')]) || 0;
            const precoDrop = parseFloat(rows[itemIndex][headers.findIndex(h => h === 'Preço Drop')]) || 0;
            
            if (precoCompra > 0) {
                const lucroVarejo = precoVarejo - precoCompra;
                const lucroAtacado = precoAtacado - precoCompra;
                const lucroDrop = precoDrop - precoCompra;
                
                const percentualVarejo = ((lucroVarejo / precoCompra) * 100);
                const percentualAtacado = ((lucroAtacado / precoCompra) * 100);
                const percentualDrop = ((lucroDrop / precoCompra) * 100);
                
                // Atualizar lucros
                const lucroVarejoIndex = headers.findIndex(h => h === 'Lucro Varejo (R$)');
                const percentualVarejoIndex = headers.findIndex(h => h === '% Lucro Varejo');
                const lucroAtacadoIndex = headers.findIndex(h => h === 'Lucro Atacado (R$)');
                const percentualAtacadoIndex = headers.findIndex(h => h === '% Lucro Atacado');
                const lucroDropIndex = headers.findIndex(h => h === 'Lucro Drop (R$)');
                const percentualDropIndex = headers.findIndex(h => h === '% Lucro Drop');
                
                if (lucroVarejoIndex !== -1) rows[itemIndex][lucroVarejoIndex] = lucroVarejo.toFixed(2);
                if (percentualVarejoIndex !== -1) rows[itemIndex][percentualVarejoIndex] = percentualVarejo.toFixed(2);
                if (lucroAtacadoIndex !== -1) rows[itemIndex][lucroAtacadoIndex] = lucroAtacado.toFixed(2);
                if (percentualAtacadoIndex !== -1) rows[itemIndex][percentualAtacadoIndex] = percentualAtacado.toFixed(2);
                if (lucroDropIndex !== -1) rows[itemIndex][lucroDropIndex] = lucroDrop.toFixed(2);
                if (percentualDropIndex !== -1) rows[itemIndex][percentualDropIndex] = percentualDrop.toFixed(2);
            }
        }
        
        // Atualizar última atualização
        const ultimaAtualizacaoIndex = headers.findIndex(h => h === 'Última Atualização');
        if (ultimaAtualizacaoIndex !== -1) {
            rows[itemIndex][ultimaAtualizacaoIndex] = new Date().toISOString();
        }
        
        // Converter de volta para worksheet
        const newData = [headers, ...rows];
        const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
        
        // Atualizar o worksheet no workbook
        workbook.Sheets[WORKSHEET_ITENS] = newWorksheet;
        worksheetItens = newWorksheet;
        
        // ATUALIZAR ESTOQUE após atualizar item
        try {
            updateEstoqueSheet();
            logger.info(`✅ Estoque atualizado após modificar item`);
        } catch (error) {
            logger.warn(`⚠️ Erro ao atualizar estoque: ${error.message}`);
        }
        
        logger.info(`✅ Item ${codigo} atualizado: ${campo} = ${novoValor}`);
        return true;
        
    } catch (error) {
        logger.error(`❌ Erro ao atualizar item: ${error.message}`);
        throw error;
    }
}

// DELETE - Remover item
function deleteItem(codigo) {
    try {
        const data = XLSX.utils.sheet_to_json(worksheetItens, { header: 1 });
        if (data.length <= 1) {
            throw new Error('Nenhum item encontrado');
        }
        
        const headers = data[0];
        const rows = data.slice(1);
        
        // Encontrar a linha do item
        const itemIndex = rows.findIndex(row => row[0] === codigo.toString());
        if (itemIndex === -1) {
            throw new Error(`Produto com código ${codigo} não encontrado`);
        }
        
        // Remover a linha
        rows.splice(itemIndex, 1);
        
        // Converter de volta para worksheet
        const newData = [headers, ...rows];
        const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
        
        // Atualizar o worksheet no workbook
        workbook.Sheets[WORKSHEET_ITENS] = newWorksheet;
        worksheetItens = newWorksheet;
        
        // ATUALIZAR ESTOQUE após remover item
        try {
            updateEstoqueSheet();
            logger.info(`✅ Estoque atualizado após remover item`);
        } catch (error) {
            logger.warn(`⚠️ Erro ao atualizar estoque: ${error.message}`);
        }
        
        logger.info(`✅ Item ${codigo} removido`);
        return true;
        
    } catch (error) {
        logger.error(`❌ Erro ao remover item: ${error.message}`);
        throw error;
    }
}

// ========================================
// FUNÇÕES CRUD PARA MOVIMENTAÇÕES
// ========================================

// CREATE - Registrar movimentação
function createMovimentacao(movimentacaoData) {
    try {
        // Ler movimentações existentes para gerar ID
        const movimentacoesExistentes = XLSX.utils.sheet_to_json(worksheetMovimentacoes);
        
        // Gerar novo ID
        const novoId = movimentacoesExistentes.length > 0 ? 
            Math.max(...movimentacoesExistentes.map(mov => parseInt(mov.ID) || 0)) + 1 : 1;
        
        const novaMovimentacao = {
            ID: novoId.toString(),
            'Data/Hora': new Date().toISOString(),
            Tipo: movimentacaoData.tipo, // 'Entrada' ou 'Saída'
            'Código Produto': movimentacaoData.codigo,
            'Nome Produto': movimentacaoData.produto,
            Quantidade: movimentacaoData.quantidade,
            'Preço Unitário': movimentacaoData.precoUnitario || 0,
            'Valor Total': (Math.abs(movimentacaoData.quantidade) * (movimentacaoData.precoUnitario || 0)).toFixed(2),
            Cliente: movimentacaoData.cliente || '',
            'Vendedor/Revendedor': movimentacaoData.vendedor || '',
            Observações: movimentacaoData.observacoes || ''
        };
        
        // Adicionar nova movimentação à lista existente
        movimentacoesExistentes.push(novaMovimentacao);
        
        // Criar novo worksheet com todas as movimentações
        const newWorksheet = XLSX.utils.json_to_sheet(movimentacoesExistentes);
        workbook.Sheets[WORKSHEET_MOVIMENTACOES] = newWorksheet;
        worksheetMovimentacoes = newWorksheet;
        
        // Salvar
        saveWorkbook();
        
        // ATUALIZAR ESTOQUE AUTOMATICAMENTE após cada movimentação
        try {
            updateEstoqueSheet();
            logger.info(`✅ Estoque atualizado automaticamente após movimentação`);
        } catch (error) {
            logger.warn(`⚠️ Erro ao atualizar estoque: ${error.message}`);
        }
        
        logger.info(`✅ Movimentação registrada: ${movimentacaoData.tipo} ${movimentacaoData.quantidade}x ${movimentacaoData.produto}`);
        
        return novaMovimentacao;
        
    } catch (error) {
        logger.error(`❌ Erro ao registrar movimentação: ${error.message}`);
        throw error;
    }
}

// READ - Ler todas as movimentações
function readMovimentacoes() {
    try {
        // Usar sheet_to_json sem header: 1 para manter a estrutura original
        const movimentacoes = XLSX.utils.sheet_to_json(worksheetMovimentacoes);
        
        // Log para debug
        logger.info(`🔍 Lendo movimentações: ${movimentacoes.length} encontradas`);
        if (movimentacoes.length > 0) {
            logger.info(`🔍 Primeira movimentação: ${JSON.stringify(movimentacoes[0])}`);
        }
        
        return movimentacoes;
    } catch (error) {
        logger.error('Erro ao ler dados das movimentações:', error);
        throw error;
    }
}

// ========================================
// FUNÇÕES DE ESTOQUE (RESUMO DIÁRIO)
// ========================================

// Calcular estoque para uma data específica (padrão: hoje)
function calculateEstoque(data = new Date()) {
    try {
        const itens = readItems();
        const movimentacoes = readMovimentacoes();
        
        // Formatar data para comparação (YYYY-MM-DD)
        const dataFormatada = data.toISOString().split('T')[0];
        
        const estoqueDiario = {};
        
        // Inicializar estoque diário para todos os itens
        itens.forEach(item => {
            estoqueDiario[item.Código] = {
                Data: dataFormatada,
                Código: item.Código,
                'Nome do Produto': item['Nome do Produto'],
                Categoria: item.Categoria,
                'Quantidade Início Dia': 0,
                'Quantidade Fim Dia': 0,
                Entradas: 0,
                Saídas: 0,
                'Preço de Compra': parseFloat(item['Preço de Compra']) || 0,
                'Preço Varejo': parseFloat(item['Preço Varejo']) || 0,
                'Preço Atacado': parseFloat(item['Preço Atacado']) || 0,
                'Preço Drop': parseFloat(item['Preço Drop']) || 0,
                'Valor Total Estoque': 0,
                Status: '',
                'Última Atualização': new Date().toISOString()
            };
        });
        
        // Calcular estoque inicial do dia (todas as movimentações até o dia anterior)
        const dataAnterior = new Date(data);
        dataAnterior.setDate(dataAnterior.getDate() - 1);
        const dataAnteriorFormatada = dataAnterior.toISOString().split('T')[0];
        
        // Log para debug
        logger.info(`🔍 Calculando estoque para data: ${dataFormatada}`);
        logger.info(`🔍 Data anterior: ${dataAnteriorFormatada}`);
        logger.info(`🔍 Total de movimentações encontradas: ${movimentacoes.length}`);
        
        movimentacoes.forEach((mov, index) => {
            // Converter Data/Hora para objeto Date para comparação correta
            const movData = new Date(mov['Data/Hora']);
            const movDataFormatada = movData.toISOString().split('T')[0];
            const codigo = mov['Código Produto'];
            const quantidade = parseFloat(mov.Quantidade) || 0;
            const tipo = mov.Tipo;
            
            logger.info(`🔍 Movimentação ${index + 1}: ${tipo} ${quantidade}x ${codigo} - Data: ${movDataFormatada}`);
            
            if (estoqueDiario[codigo]) {
                // Se é do dia anterior ou anterior, conta para início do dia
                if (movDataFormatada <= dataAnteriorFormatada) {
                    if (tipo === 'Entrada') {
                        estoqueDiario[codigo]['Quantidade Início Dia'] += quantidade;
                        logger.info(`🔍 ✅ Contabilizado para início do dia: +${quantidade}`);
                    } else if (tipo === 'Saída') {
                        // Para saídas, quantidade já é negativa, então soma (subtrai o valor absoluto)
                        estoqueDiario[codigo]['Quantidade Início Dia'] += quantidade;
                        logger.info(`🔍 ✅ Contabilizado para início do dia: ${quantidade} (já é negativo)`);
                    }
                }
                // Se é do dia atual, conta para entradas/saídas do dia
                else if (movDataFormatada === dataFormatada) {
                    if (tipo === 'Entrada') {
                        estoqueDiario[codigo].Entradas += quantidade;
                        logger.info(`🔍 ✅ Contabilizado para entradas do dia: +${quantidade}`);
                    } else if (tipo === 'Saída') {
                        // Para saídas, quantidade já é negativa, então soma (subtrai o valor absoluto)
                        estoqueDiario[codigo].Saídas += quantidade;
                        logger.info(`🔍 ✅ Contabilizado para saídas do dia: ${quantidade} (já é negativo)`);
                    }
                }
            } else {
                logger.warn(`🔍 ⚠️ Produto ${codigo} não encontrado no estoque diário`);
            }
        });
        
        // Calcular quantidade fim do dia e valores
        Object.values(estoqueDiario).forEach(item => {
            item['Quantidade Fim Dia'] = item['Quantidade Início Dia'] + item.Entradas - item.Saídas;
            
            // Calcular valor total do estoque (baseado na quantidade fim do dia)
            const precoCompra = parseFloat(item['Preço de Compra']) || 0;
            item['Valor Total Estoque'] = (item['Quantidade Fim Dia'] * precoCompra).toFixed(2);
            
            // Definir status baseado na quantidade fim do dia
            if (item['Quantidade Fim Dia'] <= 0) {
                item.Status = 'Sem Estoque';
            } else if (item['Quantidade Fim Dia'] <= 10) {
                item.Status = 'Estoque Baixo';
            } else {
                item.Status = 'Em Estoque';
            }
            
            // Log para debug
            logger.debug(`Estoque calculado para ${item['Nome do Produto']}: Início=${item['Quantidade Início Dia']}, Entradas=${item.Entradas}, Saídas=${item.Saídas}, Fim=${item['Quantidade Fim Dia']}`);
        });
        
        return Object.values(estoqueDiario);
    } catch (error) {
        logger.error('Erro ao calcular estoque diário:', error);
        throw error;
    }
}

// Atualizar aba de estoque no Excel
function updateEstoqueSheet(data = new Date()) {
    try {
        const estoqueDiario = calculateEstoque(data);
        
        // Converter para formato de worksheet
        const headers = ESTOQUE_HEADERS;
        const rows = estoqueDiario.map(item => [
            item.Data,
            item.Código,
            item['Nome do Produto'],
            item.Categoria,
            item['Quantidade Início Dia'],
            item['Quantidade Fim Dia'],
            item.Entradas,
            item.Saídas,
            item['Preço de Compra'],
            item['Preço Varejo'],
            item['Preço Atacado'],
            item['Preço Drop'],
            item['Valor Total Estoque'],
            item.Status,
            item['Última Atualização']
        ]);
        
        // Criar novo worksheet
        const newData = [headers, ...rows];
        const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
        
        // Atualizar o worksheet no workbook
        workbook.Sheets[WORKSHEET_ESTOQUE] = newWorksheet;
        worksheetEstoque = newWorksheet;
        
        // Salvar
        saveWorkbook();
        
        logger.info(`✅ Aba de estoque atualizada para ${data.toISOString().split('T')[0]}`);
        return true;
        
    } catch (error) {
        logger.error(`❌ Erro ao atualizar aba de estoque: ${error.message}`);
        throw error;
    }
}

// Obter estoque atual (última atualização)
function getEstoqueAtual() {
    try {
        const data = XLSX.utils.sheet_to_json(worksheetEstoque, { header: 1 });
        if (data.length <= 1) return [];
        
        const headers = data[0];
        const rows = data.slice(1);
        
        return rows.map(row => {
            const item = {};
            headers.forEach((header, index) => {
                item[header] = row[index] || '';
            });
            return item;
        });
    } catch (error) {
        logger.error('Erro ao ler dados do estoque:', error);
        throw error;
    }
}

// ========================================
// FUNÇÕES DE STATUS E RELATÓRIOS
// ========================================

function getSystemStatus() {
    try {
        const itens = readItems();
        const movimentacoes = readMovimentacoes();
        const estoque = getEstoqueAtual();
        
        const totalItens = itens.length;
        const totalMovimentacoes = movimentacoes.length;
        
        // Calcular valor total do estoque (baseado no estoque atual)
        const valorTotalEstoque = estoque.reduce((total, item) => {
            return total + parseFloat(item['Valor Total Estoque'] || 0);
        }, 0);
        
        // Última movimentação
        const ultimaMovimentacao = movimentacoes.length > 0 
            ? movimentacoes[movimentacoes.length - 1]['Data/Hora']
            : 'Nenhuma';
        
        // Status do estoque
        const estoqueBaixo = estoque.filter(item => item.Status === 'Estoque Baixo').length;
        const semEstoque = estoque.filter(item => item.Status === 'Sem Estoque').length;
        
        return {
            totalItens,
            totalMovimentacoes,
            valorTotalEstoque: valorTotalEstoque.toFixed(2),
            ultimaMovimentacao,
            estoqueBaixo,
            semEstoque,
            status: 'Operacional'
        };
    } catch (error) {
        logger.error(`❌ Erro ao obter status: ${error.message}`);
        return {
            totalItens: 0,
            totalMovimentacoes: 0,
            valorTotalEstoque: '0.00',
            ultimaMovimentacao: 'Erro',
            estoqueBaixo: 0,
            semEstoque: 0,
            status: 'Erro'
        };
    }
}

// ========================================
// FUNÇÕES CRUD PARA VENDEDORES
// ========================================

// CREATE - Criar novo vendedor
function createVendedor(nome, telefone = '', email = '', tipo = 'Vendedor') {
    try {
        // Verificar limite de vendedores (máximo 10)
        const vendedores = readVendedores();
        if (vendedores.length >= 10) {
            throw new Error('Limite máximo de 10 vendedores atingido');
        }
        
        // Validações
        if (!nome || nome.trim() === '') {
            throw new Error('Nome do vendedor é obrigatório');
        }
        
        if (nome.length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        
        // Verificar se vendedor já existe
        const vendedorExistente = vendedores.find(v => v.Nome.toLowerCase() === nome.toLowerCase());
        if (vendedorExistente) {
            throw new Error(`Vendedor com nome "${nome}" já existe`);
        }
        
        // Gerar novo ID
        const novoId = vendedores.length > 0 ? Math.max(...vendedores.map(v => parseInt(v.ID) || 0)) + 1 : 1;
        
        // Criar novo vendedor
        const novoVendedor = {
            ID: novoId.toString(),
            Nome: nome.trim(),
            Telefone: telefone.trim(),
            Email: email.trim(),
            Tipo: tipo.trim(),
            'Data Cadastro': new Date().toISOString(),
            Status: 'Ativo'
        };
        
        // Adicionar à lista existente
        vendedores.push(novoVendedor);
        
        // Atualizar worksheet
        const newWorksheet = XLSX.utils.json_to_sheet(vendedores);
        workbook.Sheets[WORKSHEET_VENDEDORES] = newWorksheet;
        
        // Salvar
        saveWorkbook();
        
        logger.info(`✅ Novo vendedor cadastrado: ${nome} (ID: ${novoId}) - Tipo: ${tipo}`);
        
        return novoVendedor;
        
    } catch (error) {
        logger.error(`❌ Erro ao criar vendedor: ${error.message}`);
        throw error;
    }
}

// READ - Ler todos os vendedores
function readVendedores() {
    try {
        const vendedores = XLSX.utils.sheet_to_json(workbook.Sheets[WORKSHEET_VENDEDORES]);
        return vendedores || [];
    } catch (error) {
        logger.error('Erro ao ler dados dos vendedores:', error);
        return [];
    }
}

// ========================================
// FUNÇÕES CRUD PARA REVENDEDORES
// ========================================

// CREATE - Criar novo revendedor
function createRevendedor(nome, telefone = '', email = '', tipoDropShipping = 'Drop Shipping') {
    try {
        // Verificar limite de revendedores (máximo 10)
        const revendedores = readRevendedores();
        if (revendedores.length >= 10) {
            throw new Error('Limite máximo de 10 revendedores atingido');
        }
        
        // Validações
        if (!nome || nome.trim() === '') {
            throw new Error('Nome do revendedor é obrigatório');
        }
        
        if (nome.length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        
        // Verificar se revendedor já existe
        const revendedorExistente = revendedores.find(r => r.Nome.toLowerCase() === nome.toLowerCase());
        if (revendedorExistente) {
            throw new Error(`Revendedor com nome "${nome}" já existe`);
        }
        
        // Gerar novo ID
        const novoId = revendedores.length > 0 ? Math.max(...vendedores.map(r => parseInt(r.ID) || 0)) + 1 : 1;
        
        // Criar novo revendedor
        const novoRevendedor = {
            ID: novoId.toString(),
            Nome: nome.trim(),
            Telefone: telefone.trim(),
            Email: email.trim(),
            'Tipo Drop Shipping': tipoDropShipping.trim(),
            'Data Cadastro': new Date().toISOString(),
            Status: 'Ativo'
        };
        
        // Adicionar à lista existente
        revendedores.push(novoRevendedor);
        
        // Atualizar worksheet
        const newWorksheet = XLSX.utils.json_to_sheet(revendedores);
        workbook.Sheets[WORKSHEET_REVENDEDORES] = newWorksheet;
        
        // Salvar
        saveWorkbook();
        
        logger.info(`✅ Novo revendedor cadastrado: ${nome} (ID: ${novoId}) - Tipo: ${tipoDropShipping}`);
        
        return novoRevendedor;
        
    } catch (error) {
        logger.error(`❌ Erro ao criar revendedor: ${error.message}`);
        throw error;
    }
}

// READ - Ler todos os revendedores
function readRevendedores() {
    try {
        const revendedores = XLSX.utils.sheet_to_json(workbook.Sheets[WORKSHEET_REVENDEDORES]);
        return revendedores || [];
    } catch (error) {
        logger.error('Erro ao ler dados dos revendedores:', error);
        return [];
    }
}

// ========================================
// EXPORTAÇÃO DAS FUNÇÕES
// ========================================

module.exports = {
    // Inicialização
    initialize: loadWorkbook,
    saveWorkbook,
    
    // CRUD Itens
    createItem,
    readItems,
    readItemByCode,
    updateItem,
    deleteItem,
    
    // CRUD Movimentações
    createMovimentacao,
    readMovimentacoes,
    
    // Estoque e Status (ESTRUTURA CORRETA)
    calculateEstoque,      // Calcula estoque para uma data específica
    updateEstoqueSheet,    // Atualiza aba de estoque no Excel
    getEstoqueAtual,       // Obtém estoque atual da aba
    getSystemStatus,
    
    // CRUD Vendedores
    createVendedor,
    readVendedores,
    
    // CRUD Revendedores
    createRevendedor,
    readRevendedores
};
