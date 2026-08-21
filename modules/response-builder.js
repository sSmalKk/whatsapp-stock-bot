// Construtor centralizado de respostas para evitar duplicação

// Resposta para comando /add
function buildAddResponse(resultado, item, quantidade) {
    return `✅ *ENTRADA REGISTRADA COM SUCESSO!*\n\n` +
        `📦 Código: ${item.Código}\n` +
        `🏷️ Produto: ${item['Nome do Produto']}\n` +
        `➕ Quantidade: ${quantidade}\n` +
        `💰 Preço Compra: R$ ${parseFloat(item['Preço de Compra'] || 0).toFixed(2)}\n` +
        `⏰ ${new Date(resultado['Data/Hora']).toLocaleString('pt-BR')}\n\n` +
        `💡 Use /estoque para ver o estoque atualizado`;
}

// Resposta para comando /rm
function buildRemoveResponse(resultado, item, quantidade, estoqueAtual, cliente, vendedor = '') {
    // Calcular estoque restante baseado na nova estrutura
    const estoqueRestante = estoqueAtual ? (estoqueAtual - parseFloat(quantidade)) : 'Calculando...';
    
    let response = `✅ *SAÍDA REGISTRADA COM SUCESSO!*\n\n` +
        `📦 Código: ${item.Código}\n` +
        `🏷️ Produto: ${item['Nome do Produto']}\n` +
        `➖ Quantidade: ${quantidade}\n` +
        `👤 Cliente: ${cliente}\n`;
    
    if (vendedor) {
        response += `🏪 Vendedor: ${vendedor}\n`;
    }
    
    response += `📊 Estoque restante: ${estoqueRestante}\n` +
        `⏰ ${new Date(resultado['Data/Hora']).toLocaleString('pt-BR')}\n\n` +
        `💡 Use /estoque para ver o estoque atualizado`;
    
    return response;
}

// Resposta para comando /produto
function buildProductResponse(novoItem, codigo) {
    return `✅ *NOVO PRODUTO CADASTRADO COM SUCESSO!*\n\n` +
        `📦 Código: ${novoItem.Código}\n` +
        `🏷️ Nome: ${novoItem['Nome do Produto']}\n` +
        `📂 Categoria: ${novoItem.Categoria}\n` +
        `💰 *Preços:*\n` +
        `   • Compra: R$ ${novoItem['Preço de Compra']}\n` +
        `   • Varejo: R$ ${novoItem['Preço Varejo']}\n` +
        `   • Atacado: R$ ${novoItem['Preço Atacado']}\n` +
        `   • Drop: R$ ${novoItem['Preço Drop']}\n` +
        `📈 Lucros calculados automaticamente\n` +
        `⏰ ${new Date().toLocaleString('pt-BR')}\n\n` +
        `💡 Use /add ${codigo} <quantidade> para registrar entrada`;
}

// Resposta para comando /estoque
function buildEstoqueResponse(estoque, filtroData = null) {
    const totalProdutos = estoque.length;
    
    let response = `📊 *RESUMO DO ESTOQUE*\n\n`;
    
    if (filtroData) {
        const dataFormatada = filtroData.toLocaleDateString('pt-BR');
        response += `📅 Filtro: ${dataFormatada}\n`;
    }
    
    response += `📦 Total de produtos: ${totalProdutos}\n` +
        `⏰ ${new Date().toLocaleString('pt-BR')}\n\n`;

    if (totalProdutos === 0) {
        response += `📝 *Nenhum produto em estoque*\n\n` +
            `💡 Use /produto para cadastrar produtos (códigos 1-30)\n` +
            `💡 Use /add para registrar entradas`;
    } else {
        // Calcular valor total do estoque (nova estrutura)
        const totalValor = estoque.reduce((sum, item) => {
            const quantidade = parseFloat(item['Quantidade Fim Dia']) || 0;
            const precoCompra = parseFloat(item['Preço de Compra']) || 0;
            return sum + (quantidade * precoCompra);
        }, 0);
        
        response += `💰 Valor total do estoque: R$ ${totalValor.toFixed(2)}\n\n`;
        
        // Mostrar produtos com limite de linhas
        const maxLinhas = 8; // Limite para WhatsApp
        const produtosParaMostrar = estoque.slice(0, maxLinhas);
        
        response += `*PRODUTOS EM ESTOQUE:*\n`;
        produtosParaMostrar.forEach((item, index) => {
            const quantidadeInicio = parseFloat(item['Quantidade Início Dia']) || 0;
            const quantidadeFim = parseFloat(item['Quantidade Fim Dia']) || 0;
            const entradas = parseFloat(item.Entradas) || 0;
            const saidas = parseFloat(item.Saídas) || 0;
            const precoCompra = parseFloat(item['Preço de Compra']) || 0;
            const valorTotal = (quantidadeFim * precoCompra).toFixed(2);
            const status = item.Status || 'Em Estoque';
            
            response += `${index + 1}. ${item.Código} - ${item['Nome do Produto']}\n` +
                `   📊 Início: ${quantidadeInicio} | Entradas: +${entradas} | Saídas: ${saidas < 0 ? saidas : `-${saidas}`} | Fim: ${quantidadeFim}\n` +
                `   💰 R$ ${valorTotal} | ${status}\n`;
        });
        
        if (totalProdutos > maxLinhas) {
            response += `\n... e mais ${totalProdutos - maxLinhas} produtos\n`;
        }
    }

    response += `\n💡 Use /ajuda para ver todos os comandos`;
    return response;
}

// Resposta para comando /status
function buildStatusResponse(status) {
    return `🔧 *STATUS DO SISTEMA*\n\n` +
        `📱 WhatsApp: ✅ Conectado\n` +
        `📊 Excel: ✅ Carregado\n` +
        `🏷️ Produtos: ${status.totalItens}/30 (códigos 1-30)\n` +
        `📊 Movimentações: ${status.totalMovimentacoes}\n` +
        `💰 Valor Total Estoque: R$ ${status.valorTotalEstoque}\n` +
        `📅 Última Movimentação: ${status.ultimaMovimentacao}\n` +
        `🟢 Status: ${status.status}\n` +
        `⏰ ${new Date().toLocaleString('pt-BR')}`;
}

// Resposta para comando /ajuda
function buildHelpResponse() {
    return `🤖 *BOT DE ESTOQUE - COMANDOS COMPLETOS*\n\n` +
        `📦 *PRODUTOS (Códigos 1-30):*\n` +
        `• \`/produto <código> "<nome>" "<categoria>" <compra> <varejo> <atacado> <drop>\`\n` +
        `  → Cadastra novo produto\n` +
        `  → Exemplo: \`/produto 1 "Marlboro" "Premium" 8.50 12.00 10.50 9.80\`\n\n` +
        `• \`/editar <código> "<campo>" "<novoValor>"\`\n` +
        `  → Edita campo do produto\n` +
        `  → Campos: nome, categoria, compra, varejo, atacado, drop\n` +
        `  → Exemplo: \`/editar 1 "nome" "Marlboro Red"\`\n\n` +
        `📊 *ESTOQUE (MOVIMENTAÇÕES):*\n` +
        `• \`/add <código> <quantidade>\`\n` +
        `  → Registra ENTRADA no estoque (compra)\n` +
        `  → Exemplo: \`/add 1 50\`\n\n` +
        `• \`/rm <código> <quantidade> "<cliente>" [vendedor]\`\n` +
        `  → Registra SAÍDA do estoque (venda)\n` +
        `  → Exemplo: \`/rm 1 10 "João Silva"\` ou \`/rm 1 10 "João Silva" "Loja ABC"\`\n\n` +
        `• \`/estoque [data]\`\n` +
        `  → Mostra resumo do estoque (início/fim do dia)\n` +
        `  → Exemplo: \`/estoque hoje\` ou \`/estoque 2025-01-22\`\n\n` +
        `👥 *VENDEDORES (Máximo 10):*\n` +
        `• \`/vendedor add "<nome>" [telefone] [email] [tipo]\`\n` +
        `  → Cadastra novo vendedor (Vendedor, Atacado, Online, etc.)\n` +
        `  → Exemplo: \`/vendedor add "João Silva" "11999999999" "joao@email.com" "Vendedor"\`\n` +
        `  → Exemplo: \`/vendedor add "Loja ABC" "11977777777" "contato@abc.com" "Atacado"\`\n\n` +
        `• \`/vendedor list\`\n` +
        `  → Lista todos os vendedores\n\n` +
        `🔄 *REVENDEDORES (Máximo 10):*\n` +
        `• \`/revendedor add "<nome>" [telefone] [email] [tipo]\`\n` +
        `  → Cadastra novo revendedor (Drop Shipping, Atacado, etc.)\n` +
        `  → Exemplo: \`/revendedor add "Distribuidor XYZ" "11966666666" "vendas@xyz.com" "Drop Shipping"\`\n` +
        `  → Exemplo: \`/revendedor add "Loja ABC" "11977777777" "contato@abc.com" "Atacado"\`\n\n` +
        `• \`/revendedor list\`\n` +
        `  → Lista todos os revendedores\n\n` +
 +
        `📈 *RELATÓRIOS:*\n` +
        `• \`/maisvendidos\`\n` +
        `  → TOP 10 produtos mais vendidos\n\n` +
        `• \`/melhoresclientes\`\n` +
        `  → TOP 10 clientes que mais compram\n\n` +
        `⚙️ *SISTEMA:*\n` +
        `• \`/status\`\n` +
        `  → Status geral do sistema\n\n` +
        `• \`/ajuda\`\n` +
        `  → Mostra esta mensagem de ajuda\n\n` +
        `💡 *ESTRUTURA DO SISTEMA:*\n` +
        `• **MOVIMENTAÇÃO** = Histórico completo de entradas/saídas\n` +
        `• **ESTOQUE** = Resumo diário com início/fim de cada item\n` +
        `• **AUTOMÁTICO** = Estoque atualiza após cada movimentação\n\n` +
        `💡 *DICAS:*\n` +
        `• Use aspas para nomes com espaços: \`"João Silva"\`\n` +
        `• Códigos de produtos: 1 a 30\n` +
        `• Preços devem ser números positivos\n` +
        `• Preços de venda devem ser > preço de compra\n` +
        `• Lucros são calculados automaticamente\n\n` +
        `🎯 *DIFERENÇA VENDEDORES vs REVENDEDORES:*\n` +
        `• **VENDEDORES** = Vendem para cliente final (preço varejo)\n` +
        `• **REVENDEDORES** = Compram para revender (preço drop)\n` +
        `• **Limite**: 10 de cada tipo\n` +
        `• **Comandos separados** para cada categoria`;
}

// Ajuda para filtros de data inválidos
function buildDateFilterHelp() {
    return `❌ Formato de data inválido. Use:\n` +
        `• /estoque - Estoque atual\n` +
        `• /estoque hoje - Estoque de hoje\n` +
        `• /estoque semana - Estoque da semana\n` +
        `• /estoque 2025-08-22 - Data específica`;
}

// Respostas para Vendedores
function buildVendedorResponse(vendedor) {
    return `✅ *VENDEDOR CADASTRADO COM SUCESSO!*\n\n` +
        `👤 *ID:* ${vendedor.ID}\n` +
        `🏷️ *Nome:* ${vendedor.Nome}\n` +
        `📱 *Telefone:* ${vendedor.Telefone || 'Não informado'}\n` +
        `📧 *Email:* ${vendedor.Email || 'Não informado'}\n` +
        `🏪 *Tipo:* ${vendedor.Tipo || 'Vendedor'}\n` +
        `📅 *Data Cadastro:* ${vendedor['Data Cadastro']}\n` +
        `🟢 *Status:* ${vendedor.Status}\n\n` +
        `💡 Use \`/vendedor list\` para ver todos os vendedores`;
}

function buildVendedorListResponse(vendedores) {
    let resposta = `📋 *LISTA DE VENDEDORES*\n\n`;
    
    vendedores.forEach((vendedor, index) => {
        resposta += `${index + 1}. *${vendedor.Nome}*\n` +
            `   📱 ${vendedor.Telefone || 'Sem telefone'}\n` +
            `   📧 ${vendedor.Email || 'Sem email'}\n` +
            `   🏪 ${vendedor.Tipo || 'Vendedor'}\n` +
            `   📅 ${vendedor['Data Cadastro']}\n` +
            `   🟢 ${vendedor.Status}\n\n`;
    });
    
    resposta += `💡 *Total:* ${vendedores.length} vendedor(es)\n` +
        `📝 Use \`/vendedor add <nome>\` para adicionar mais vendedores`;
    
    return resposta;
}

// Respostas para Revendedores
function buildRevendedorResponse(revendedor) {
    return `✅ *REVENDEDOR CADASTRADO COM SUCESSO!*\n\n` +
        `👤 *ID:* ${revendedor.ID}\n` +
        `🏷️ *Nome:* ${revendedor.Nome}\n` +
        `📱 *Telefone:* ${revendedor.Telefone || 'Não informado'}\n` +
        `📧 *Email:* ${revendedor.Email || 'Não informado'}\n` +
        `🔄 *Tipo:* ${revendedor['Tipo Drop Shipping'] || 'Drop Shipping'}\n` +
        `📅 *Data Cadastro:* ${revendedor['Data Cadastro']}\n` +
        `🟢 *Status:* ${revendedor.Status}\n\n` +
        `💡 Use \`/revendedor list\` para ver todos os revendedores`;
}

function buildRevendedorListResponse(revendedores) {
    let resposta = `📋 *LISTA DE REVENDEDORES*\n\n`;
    
    revendedores.forEach((revendedor, index) => {
        resposta += `${index + 1}. *${revendedor.Nome}*\n` +
            `   📱 ${revendedor.Telefone || 'Sem telefone'}\n` +
            `   📧 ${revendedor.Email || 'Sem email'}\n` +
            `   🔄 ${revendedor['Tipo Drop Shipping'] || 'Drop Shipping'}\n` +
            `   📅 ${revendedor['Data Cadastro']}\n` +
            `   🟢 ${revendedor.Status}\n\n`;
    });
    
    resposta += `💡 *Total:* ${revendedores.length} revendedor(es)\n` +
        `📝 Use \`/revendedor add <nome>\` para adicionar mais revendedores`;
    
    return resposta;
}



// Respostas para Relatórios
function buildMaisVendidosResponse(ranking) {
    let resposta = `📊 *RELATÓRIO - PRODUTOS MAIS VENDIDOS*\n\n`;
    
    if (ranking.length === 0) {
        resposta += `❌ Nenhum produto vendido ainda.`;
        return resposta;
    }
    
    resposta += `🏆 *TOP ${ranking.length} PRODUTOS:*\n\n`;
    
    ranking.forEach((produto, index) => {
        const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        resposta += `${medalha} *${produto.nome}* (Código: ${produto.codigo})\n` +
            `   📦 Quantidade: ${produto.quantidadeTotal}\n` +
            `   💰 Valor Total: R$ ${produto.valorTotal.toFixed(2)}\n\n`;
    });
    
    resposta += `💡 *Dica:* Produtos com maior quantidade de vendas aparecem primeiro.`;
    
    return resposta;
}

function buildMelhoresClientesResponse(ranking) {
    let resposta = `📊 *RELATÓRIO - MELHORES CLIENTES*\n\n`;
    
    if (ranking.length === 0) {
        resposta += `❌ Nenhum cliente registrado ainda.`;
        return resposta;
    }
    
    resposta += `🏆 *TOP ${ranking.length} CLIENTES:*\n\n`;
    
    ranking.forEach((cliente, index) => {
        const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        resposta += `${medalha} *${cliente.nome}*\n` +
            `   📦 Quantidade: ${cliente.quantidadeTotal}\n` +
            `   💰 Valor Total: R$ ${cliente.valorTotal.toFixed(2)}\n` +
            `   🛒 Compras: ${cliente.compras}\n\n`;
    });
    
    resposta += `💡 *Dica:* Clientes com maior valor total de compras aparecem primeiro.`;
    
    return resposta;
}

module.exports = {
    buildAddResponse,
    buildRemoveResponse,
    buildProductResponse,
    buildEstoqueResponse,
    buildStatusResponse,
    buildHelpResponse,
    buildDateFilterHelp,
    buildVendedorResponse,
    buildVendedorListResponse,
    buildRevendedorResponse,
    buildRevendedorListResponse,

    buildMaisVendidosResponse,
    buildMelhoresClientesResponse
};
