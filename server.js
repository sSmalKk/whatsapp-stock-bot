const express = require('express');
const logger = require('./modules/logger');
const excelManager = require('./modules/excel-manager');
const whatsappBot = require('./modules/whatsapp-bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Inicializar módulos
excelManager.initialize();
whatsappBot.initialize();

// Rotas da API
app.post('/api/itens', async (req, res) => {
    try {
        const { codigo, nome, categoria, precoCompra, precoVarejo, precoAtacado, precoDrop } = req.body;
        const resultado = excelManager.createItem(codigo, nome, categoria, precoCompra, precoVarejo, precoAtacado, precoDrop);
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/itens', (req, res) => {
    try {
        const itens = excelManager.readItems();
        res.json({ success: true, data: itens });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/movimentacao', async (req, res) => {
    try {
        const { tipo, codigo, quantidade, cliente, vendedor, observacoes } = req.body;
        
        // Buscar produto para obter nome e preço
        const produto = excelManager.readItemByCode(codigo);
        
        const movimentacaoData = {
            tipo,
            codigo: codigo.toString(),
            produto: produto['Nome do Produto'],
            quantidade: parseInt(quantidade),
            precoUnitario: tipo === 'Entrada' ? parseFloat(produto['Preço de Compra']) : parseFloat(produto['Preço Varejo']),
            vendedor: vendedor || '',
            cliente: tipo === 'Saída' ? cliente : '',
            motivo: 'Movimentação via API',
            observacoes: observacoes || ''
        };
        
        const resultado = excelManager.createMovimentacao(movimentacaoData);
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/movimentacao', (req, res) => {
    try {
        const movimentacoes = excelManager.readMovimentacoes();
        res.json({ success: true, data: movimentacoes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/estoque', (req, res) => {
    try {
        const estoque = excelManager.calculateEstoque();
        res.json({ success: true, data: estoque });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// APIs para Vendedores
app.post('/api/vendedores', async (req, res) => {
    try {
        const { nome, telefone, email, tipo } = req.body;
        const resultado = excelManager.createVendedor(nome, telefone, email, tipo);
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/vendedores', (req, res) => {
    try {
        const vendedores = excelManager.readVendedores();
        res.json({ success: true, data: vendedores });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// APIs para Revendedores
app.post('/api/revendedores', async (req, res) => {
    try {
        const { nome, telefone, email, tipoDropShipping } = req.body;
        const resultado = excelManager.createRevendedor(nome, telefone, email, tipoDropShipping);
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/revendedores', (req, res) => {
    try {
        const revendedores = excelManager.readRevendedores();
        res.json({ success: true, data: revendedores });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// Nova rota para Relatórios
app.get('/api/relatorios/:tipo', (req, res) => {
    try {
        const { tipo } = req.params;
        let resultado;
        
        switch (tipo) {
            case 'maisvendidos':
                // Lógica para produtos mais vendidos
                const movimentacoes = excelManager.readMovimentacoes();
                const vendas = movimentacoes.filter(mov => mov.Tipo === 'Saída');
                // Implementar lógica de agrupamento
                resultado = { tipo: 'maisvendidos', data: vendas };
                break;
                
            case 'melhoresclientes':
                // Lógica para melhores clientes
                const movimentacoes2 = excelManager.readMovimentacoes();
                const vendas2 = movimentacoes2.filter(mov => mov.Tipo === 'Saída' && mov.Cliente);
                // Implementar lógica de agrupamento
                resultado = { tipo: 'melhoresclientes', data: vendas2 };
                break;
                
            default:
                return res.status(400).json({ success: false, error: 'Tipo de relatório inválido' });
        }
        
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/status', (req, res) => {
    try {
        const status = excelManager.getSystemStatus();
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
});
