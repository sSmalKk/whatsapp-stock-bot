const logger = require('../logger');
const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');

// Função para normalizar preços (completar decimais)
function normalizarPreco(precoStr) {
    logger.info(`🔍 Normalizando preço: "${precoStr}" (tipo: ${typeof precoStr})`);
    
    if (typeof precoStr === 'string') {
        // Se termina com ponto, adiciona 00
        if (precoStr.endsWith('.')) {
            precoStr += '00';
            logger.info(`   → Terminava com ponto, adicionado 00: "${precoStr}"`);
        }
        // Se tem ponto mas só um dígito após, adiciona 0
        else if (precoStr.includes('.') && precoStr.split('.')[1].length === 1) {
            precoStr += '0';
            logger.info(`   → Tinha só 1 dígito após ponto, adicionado 0: "${precoStr}"`);
        }
        // Se não tem ponto, adiciona .00
        else if (!precoStr.includes('.')) {
            precoStr += '.00';
            logger.info(`   → Sem ponto, adicionado .00: "${precoStr}"`);
        }
    }
    
    const resultado = parseFloat(precoStr);
    logger.info(`   → Resultado final: ${resultado} (${typeof resultado})`);
    return resultado;
}

// Função para processar argumentos inteligentemente (reconstruir nomes com aspas)
function processarArgumentosProduto(args) {
    logger.info(`🔧 Processando argumentos de produto inteligentemente...`);
    
    const resultado = {
        codigo: null,
        nome: '',
        categoria: '',
        precoCompra: null,
        precoVarejo: null,
        precoAtacado: null,
        precoDrop: null
    };
    
    let i = 0;
    
    // 1. Código (primeiro argumento)
    if (i < args.length) {
        resultado.codigo = args[i];
        i++;
        logger.info(`   ✅ Código extraído: "${resultado.codigo}"`);
    }
    
    // 2. Nome (primeiro argumento entre aspas)
    if (i < args.length) {
        resultado.nome = args[i].replace(/"/g, '').trim();
        i++;
        logger.info(`   ✅ Nome extraído: "${resultado.nome}"`);
    }
    
    // 3. Categoria (segundo argumento entre aspas)
    if (i < args.length) {
        resultado.categoria = args[i].replace(/"/g, '').trim();
        i++;
        logger.info(`   ✅ Categoria extraída: "${resultado.categoria}"`);
    }
    
    // 4. Preços (os próximos 4 argumentos numéricos)
    logger.info(`💰 Procurando preços a partir da posição ${i}...`);
    const precos = [];
    
    // Coletar os próximos 4 argumentos numéricos
    while (i < args.length && precos.length < 4) {
        const arg = args[i];
        logger.info(`   🔍 Analisando argumento ${i} para preço: "${arg}"`);
        
        // Verificar se é um número (incluindo decimais)
        if (!isNaN(parseFloat(arg)) && arg.trim() !== '') {
            precos.push(arg);
            logger.info(`   ✅ Preço ${precos.length} extraído: "${arg}"`);
        } else {
            logger.info(`   ⏭️ Argumento ignorado (não é preço): "${arg}"`);
        }
        i++;
    }
    
    logger.info(`💰 Total de preços encontrados: ${precos.length}`);
    
    if (precos.length === 4) {
        resultado.precoCompra = normalizarPreco(precos[0]);
        resultado.precoVarejo = normalizarPreco(precos[1]);
        resultado.precoAtacado = normalizarPreco(precos[2]);
        resultado.precoDrop = normalizarPreco(precos[3]);
        
        logger.info(`   ✅ Preços processados:`);
        logger.info(`      • Compra: ${resultado.precoCompra}`);
        logger.info(`      • Varejo: ${resultado.precoVarejo}`);
        logger.info(`      • Atacado: ${resultado.precoAtacado}`);
        logger.info(`      • Drop: ${resultado.precoDrop}`);
    } else {
        logger.error(`❌ Erro: Esperados 4 preços, encontrados ${precos.length}`);
        logger.error(`   Preços encontrados: [${precos.join(', ')}]`);
    }
    
    logger.info(`🔧 Argumentos processados:`, resultado);
    return resultado;
}

// Comando: Cadastrar novo produto
async function handleProduct(message, args) {
    logger.info(`🚀 Iniciando comando /produto com ${args.length} argumentos`);
    logger.info(`📝 Argumentos recebidos: [${args.map((arg, i) => `${i}: "${arg}"`).join(', ')}]`);
    
    if (args.length < 7) {
        message.reply('❌ Uso: /produto <código> <nome> <categoria> <compra> <varejo> <atacado> <drop>\n\n' +
            '💡 *Exemplos:*\n' +
            '• /produto 1 "Marlboro Red" "Premium" 8.50 12.00 10.50 9.80\n' +
            '• /produto 2 "Cigarro Popular" "Popular" 5.00 8.00 6.50 5.80\n\n' +
            '📊 *Campos:*\n' +
            '• código: número de 1 a 30\n' +
            '• nome: nome do produto (use aspas para nomes com espaços)\n' +
            '• categoria: categoria do produto\n' +
            '• compra: preço de compra\n' +
            '• varejo: preço de varejo\n' +
            '• atacado: preço de atacado\n' +
            '• drop: preço para drop shipping\n\n' +
            '💡 *Dica:* Nomes com espaços funcionam: "Marlboro Red"');
        return;
    }

    // Processar argumentos inteligentemente
    const dados = processarArgumentosProduto(args);
    logger.info(`🔧 Argumentos de produto processados:`, dados);
    
    const codigo = dados.codigo;
    const nome = dados.nome;
    const categoria = dados.categoria;
    const precoCompra = dados.precoCompra;
    const precoVarejo = dados.precoVarejo;
    const precoAtacado = dados.precoAtacado;
    const precoDrop = dados.precoDrop;

    // Validar código (1-30)
    const codigoNum = parseInt(codigo);
    if (isNaN(codigoNum) || codigoNum < 1 || codigoNum > 30) {
        message.reply('❌ Erro: Código deve ser um número entre 1 e 30');
        return;
    }

    // Validar preços
    if (precoCompra <= 0 || precoVarejo <= 0 || precoAtacado <= 0 || precoDrop <= 0) {
        message.reply('❌ Erro: Todos os preços devem ser maiores que zero');
        return;
    }

    if (precoCompra >= precoVarejo || precoCompra >= precoAtacado || precoCompra >= precoDrop) {
        message.reply('❌ Erro: Preço de compra deve ser menor que os preços de venda');
        return;
    }

    try {
        // Criar novo produto usando a função centralizada
        const novoItem = await excelManager.createItem(
            codigoNum,
            nome,
            categoria,
            precoCompra,
            precoVarejo,
            precoAtacado,
            precoDrop
        );
        
        logger.info(`✅ Item criado com sucesso:`, novoItem);
        
        const response = responseBuilder.buildProductResponse(novoItem, codigoNum.toString());
        message.reply(response);
    } catch (error) {
        logger.error('❌ Erro ao criar item:', error);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Comando: Editar produto existente
async function handleEdit(message, args) {
    logger.info(`🚀 Iniciando comando /editar com ${args.length} argumentos`);
    logger.info(`📝 Argumentos recebidos: [${args.map((arg, i) => `${i}: "${arg}"`).join(', ')}]`);
    
    if (args.length < 3) {
        message.reply('❌ Uso: /editar <código> <campo> <novo_valor>\n\n' +
            '💡 *Exemplos:*\n' +
            '• /editar 1 "nome" "Produto B"\n' +
            '• /editar 1 "varejo" 16.50\n' +
            '• /editar 1 "categoria" "Nova Categoria"\n\n' +
            '📊 *Campos editáveis:*\n' +
            '• nome: nome do produto\n' +
            '• categoria: categoria do produto\n' +
            '• compra: preço de compra\n' +
            '• varejo: preço de varejo\n' +
            '• atacado: preço de atacado\n' +
            '• drop: preço para drop shipping\n\n' +
            '💡 *Dica:* Nomes com espaços funcionam: "Marlboro Red"');
        return;
    }

    // Processar argumentos inteligentemente para edição
    const dados = processarArgumentosEdicao(args);
    logger.info(`🔧 Argumentos de edição processados:`, dados);
    
    const codigo = dados.codigo;
    const campo = dados.campo;
    const novoValor = dados.novoValor;

    // Validar código (1-30)
    const codigoNum = parseInt(codigo);
    if (isNaN(codigoNum) || codigoNum < 1 || codigoNum > 30) {
        message.reply('❌ Erro: Código deve ser um número entre 1 e 30');
        return;
    }

    // Validar campo
    const camposValidos = ['nome', 'categoria', 'compra', 'varejo', 'atacado', 'drop'];
    if (!camposValidos.includes(campo.toLowerCase())) {
        message.reply(`❌ Erro: Campo inválido. Campos válidos: ${camposValidos.join(', ')}`);
        return;
    }

    try {
        // Buscar item existente para validação
        const itens = await excelManager.readItems();
        const item = itens.find(i => i.Código === codigoNum.toString());

        if (!item) {
            message.reply(`❌ Erro: Produto com código ${codigoNum} não encontrado`);
            return;
        }

        // Validar novo valor
        if (campo === 'compra' || campo === 'varejo' || campo === 'atacado' || campo === 'drop') {
            const valor = normalizarPreco(novoValor);
            if (isNaN(valor) || valor <= 0) {
                message.reply('❌ Erro: Preço deve ser um número maior que zero\n\n' +
                    '💡 *Dica:* Use formato como 16.50, 16.5, ou 16. (será convertido para 16.00)');
                return;
            }

            // Se for preço de compra, verificar se outros preços são maiores
            if (campo === 'compra') {
                const precoVarejo = parseFloat(item['Preço Varejo']) || 0;
                const precoAtacado = parseFloat(item['Preço Atacado']) || 0;
                const precoDrop = parseFloat(item['Preço Drop']) || 0;

                if (valor >= precoVarejo || valor >= precoAtacado || valor >= precoDrop) {
                    message.reply('❌ Erro: Preço de compra deve ser menor que os preços de venda');
                    return;
                }
            }

            // Se for preço de venda, verificar se é maior que o de compra
            if (campo !== 'compra') {
                const precoCompra = parseFloat(item['Preço de Compra']) || 0;
                if (valor <= precoCompra) {
                    message.reply('❌ Erro: Preço de venda deve ser maior que o preço de compra');
                    return;
                }
            }
        }

        // Atualizar o item no Excel usando a função centralizada
        await excelManager.updateItem(codigoNum, campo, novoValor);
        
        // Salvar alterações
        await excelManager.saveWorkbook();

        message.reply(`✅ *PRODUTO EDITADO COM SUCESSO!*\n\n` +
            `📦 Código: ${codigoNum}\n` +
            `🏷️ Campo: ${campo}\n` +
            `🔄 Novo valor: ${novoValor}\n` +
            `⏰ ${new Date().toLocaleString('pt-BR')}\n\n` +
            `💡 Use /estoque para ver o estoque atualizado`);

    } catch (error) {
        logger.error('Erro ao editar produto:', error);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

// Função para processar argumentos de edição inteligentemente
function processarArgumentosEdicao(args) {
    logger.info(`🔧 Processando argumentos de edição inteligentemente...`);
    
    const resultado = {
        codigo: null,
        campo: '',
        novoValor: ''
    };
    
    let i = 0;
    
    // 1. Código (primeiro argumento)
    if (i < args.length) {
        resultado.codigo = args[i];
        i++;
        logger.info(`   ✅ Código extraído: "${resultado.codigo}"`);
    }
    
    // 2. Campo (segundo argumento)
    if (i < args.length) {
        resultado.campo = args[i].replace(/"/g, '').toLowerCase();
        i++;
        logger.info(`   ✅ Campo extraído: "${resultado.campo}"`);
    }
    
    // 3. Novo valor (pode ter espaços, reconstruir)
    const valorParts = [];
    while (i < args.length) {
        valorParts.push(args[i]);
        i++;
    }
    
    resultado.novoValor = valorParts.join(' ').replace(/"/g, '');
    logger.info(`   ✅ Novo valor reconstruído: "${resultado.novoValor}"`);
    
    logger.info(`🔧 Argumentos de edição processados:`, resultado);
    return resultado;
}

module.exports = { handleProduct, handleEdit };
