# 🤖 Sistema de Controle de Estoque - WhatsApp Bot

Sistema completo de controle de estoque integrado com WhatsApp, Excel e interface web para gerenciamento de produtos e movimentações.

## 🎯 **Modelo Exato Solicitado**

### **📦 Controle de Estoque**
- **Modelos de 1 a 30** (códigos únicos)
- **4 tipos de preços:**
  - Preço de compra
  - Preço de varejo
  - Preço de atacado
  - Preço de drop shipping
- **Cálculo automático de lucros** em reais e percentuais
- **Controle de entrada e saída** de estoque
- **Atualização por digitação direta** na planilha
- **Atualização por comandos** via WhatsApp

### **🔧 Sistema Técnico**
- **3 abas Excel** organizadas e estruturadas
- Interface web responsiva
- Comandos WhatsApp intuitivos
- API REST completa
- Código modular e organizado

## 🏗️ **Arquitetura do Sistema**

```
whatsapp/
├── modules/                    # Módulos principais
│   ├── excel-manager.js       # Gerenciador do Excel
│   ├── whatsapp-bot.js       # Bot do WhatsApp
│   ├── message-processor.js   # Processador de mensagens
│   ├── command-handler.js     # Handler principal de comandos
│   ├── response-builder.js    # Construtor de respostas
│   └── command-executors/     # Executores específicos
│       ├── estoque-commands.js    # Comandos de estoque
│       ├── item-commands.js       # Comandos de produtos
│       └── system-commands.js     # Comandos do sistema
├── public/                    # Interface web
│   └── index.html            # Dashboard principal
├── server.js                 # Servidor Express + APIs
├── package.json              # Dependências
└── .env                      # Variáveis de ambiente
```

## 📊 **Estrutura das Planilhas Excel**

### **1. Aba "Itens" (Modelos 1-30)**
| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| Código | Código do produto (1-30) | 1 |
| Nome do Produto | Nome completo | "Produto A" |
| Categoria | Categoria do produto | "Categoria" |
| Preço de Compra | Preço de compra | 10.00 |
| Preço Varejo | Preço de varejo | 15.00 |
| Preço Atacado | Preço de atacado | 13.00 |
| Preço Drop Shipping | Preço para drop | 12.00 |
| Lucro Varejo (R$) | Lucro em reais varejo | 5.00 |
| Lucro Atacado (R$) | Lucro em reais atacado | 3.00 |
| Lucro Drop (R$) | Lucro em reais drop | 2.00 |
| % Lucro Varejo | Percentual de lucro varejo | 50.00 |
| % Lucro Atacado | Percentual de lucro atacado | 30.00 |
| % Lucro Drop | Percentual de lucro drop | 20.00 |
| Estoque Mínimo | Estoque mínimo | 10 |
| Estoque Máximo | Estoque máximo | 1000 |
| Fornecedor | Nome do fornecedor | "Fornecedor A" |
| Observações | Observações adicionais | "Produto premium" |
| Data Cadastro | Data de cadastro | 2025-08-22 |
| Última Atualização | Última atualização | 2025-08-22 |

### **2. Aba "Movimentações" (Entrada e Saída)**
| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| ID | Identificador único | 1 |
| Data/Hora | Data e hora da movimentação | 2025-08-22T10:00:00 |
| Tipo | Tipo (Entrada/Saída) | "Entrada" |
| Código Produto | Código do produto (1-30) | 1 |
| Nome Produto | Nome do produto | "Produto A" |
| Quantidade | Quantidade movimentada | 100 |
| Preço Unitário | Preço unitário | 10.00 |
| Preço Total | Preço total | 1000.00 |
| Cliente | Cliente (para saídas) | "João Silva" |
| Motivo | Motivo da movimentação | "Compra" |
| Observações | Observações adicionais | "Entrada via WhatsApp" |

### **3. Aba "Estoque" (Calculado automaticamente)**
| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| Código | Código do produto (1-30) | 1 |
| Nome Produto | Nome do produto | "Produto A" |
| Categoria | Categoria do produto | "Categoria" |
| Quantidade Atual | Quantidade em estoque | 150 |
| Preço Compra | Preço de compra | 10.00 |
| Preço Varejo | Preço de varejo | 15.00 |
| Preço Atacado | Preço de atacado | 13.00 |
| Preço Drop | Preço para drop | 12.00 |
| Valor Total Estoque | Valor total do estoque | 1500.00 |
| Status | Status do estoque | "Em Estoque" |
| Última Movimentação | Última movimentação | 2025-08-22T10:00:00 |

## 📱 **Comandos WhatsApp Disponíveis**

### **📚 Comandos Principais**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/ajuda` | Mostra esta mensagem | `/ajuda` |
| `/estoque [data]` | Resumo do estoque | `/estoque 2025-08-22` |
| `/status` | Status do sistema | `/status` |

### **📦 Gerenciar Estoque (Entrada e Saída)**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/add <código> <qtd>` | Registrar entrada | `/add 1 100` |
| `/rm <código> <qtd> <cliente>` | Registrar saída | `/rm 1 5 "João Silva"` |

### **➕ Cadastros**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/produto <código> <nome> <categoria> <compra> <varejo> <atacado> <drop>` | Cadastrar produto (1-30) | `/produto 1 "Produto A" "Categoria" 10.00 15.00 13.00 12.00` |

## 🚀 **Instalação e Configuração**

### **1. Pré-requisitos**
- Node.js 18+ instalado
- WhatsApp Web conectado
- Acesso ao Excel

### **2. Instalação**
```bash
# Clonar repositório
git clone <url-do-repositorio>
cd whatsapp

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### **3. Configuração do .env**
```env
# Configurações do WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-session

# Configurações do Excel
EXCEL_FILE_PATH=./estoque.xlsx

# Configurações do servidor
PORT=3000
```

### **4. Executar**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 💻 **Interface Web**

Acesse `http://localhost:3000` para usar a interface web que inclui:

- **Dashboard** com visão geral do sistema
- **Abas organizadas** para cada funcionalidade
- **Formulários** para cadastros
- **Tabelas** para visualização de dados

## 🔧 **Desenvolvimento**

### **Adicionando Novos Módulos**
1. Crie o arquivo em `modules/`
2. Implemente as funções necessárias
3. Adicione ao `command-handler.js`
4. Atualize o `response-builder.js` se necessário

### **Estrutura de um Módulo**
```javascript
const logger = require('../logger');
const excelManager = require('../excel-manager');
const responseBuilder = require('../response-builder');

async function handleCommand(message, args) {
    try {
        // Lógica do comando
        const response = responseBuilder.buildResponse(data);
        message.reply(response);
    } catch (error) {
        logger.error('Erro:', error);
        message.reply(`❌ Erro: ${error.message}`);
    }
}

module.exports = { handleCommand };
```

## 📝 **Logs e Monitoramento**

- **Logs automáticos** de todas as operações
- **Arquivo de log** em `logs/bot.log`
- **Monitoramento** via interface web
- **Status em tempo real** do sistema

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 **Suporte**

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação
- Use o comando `/ajuda` no WhatsApp

---

**Desenvolvido com ❤️ para controle eficiente de estoque seguindo exatamente o modelo solicitado**
