# WhatsApp Stock Bot

Inventory control driven by WhatsApp messages. A small business registers
products, stock entries and sales by sending commands such as `/add 1 100` to a
WhatsApp number; the bot validates the command, updates an Excel workbook and
replies with the result. The same data is available through a REST API.

The workbook is the source of truth on purpose: the owner can still open it and
edit it by hand, and the bot reads it back.

**Stack:** Node.js · whatsapp-web.js · Express · SheetJS (xlsx)

## Architecture

```text
WhatsApp ─▶ whatsapp-bot.js ─▶ message-processor.js ─▶ command-handler.js
                                                          │  (command → executor map)
                                                          ▼
                                         command-executors/*  ─▶ excel-manager.js ─▶ estoque.xlsx
                                                          │
                                   response-builder.js ◀──┘  (formats the reply)

Express (server.js) ─▶ /api/* ─▶ excel-manager.js
```

- **Layered command handling.** Parsing, dispatch, execution and reply
  formatting are separate modules. A new command is one executor plus one entry
  in the map in `modules/command-handler.js`.
- **One persistence module.** `modules/excel-manager.js` owns the workbook:
  six sheets (Itens, Movimentações, Estoque, Vendedores, Revendedores,
  Relatórios), with stock and profit margins recalculated from the movements.
- **Session persistence.** The WhatsApp session uses `LocalAuth`, so the QR code
  is scanned once.

## Commands

| Command | What it does |
| --- | --- |
| `/produto <code> <name> <category> <buy> <retail> <wholesale> <dropship>` | Register a product |
| `/editar <code> <field> <value>` | Edit one field of a product |
| `/add <code> <qty>` | Stock entry |
| `/rm <code> <qty> <customer>` | Stock exit (sale) |
| `/estoque [date]` | Stock summary |
| `/vendedor add\|list`, `/revendedor add\|list` | Sellers and resellers |
| `/maisvendidos`, `/melhoresclientes` | Reports |
| `/status`, `/ajuda` | System status and help |

## REST API

`GET/POST /api/itens` · `GET/POST /api/movimentacao` · `GET /api/estoque` ·
`GET/POST /api/vendedores` · `GET/POST /api/revendedores` ·
`GET /api/relatorios/:tipo` · `GET /api/status`

## Running locally

Requirements: Node.js 18+ and a phone with WhatsApp to scan the QR code.

```sh
npm install
cp .env.example .env
npm start            # prints a QR code in the terminal; scan it with WhatsApp
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `EXCEL_FILE_PATH` | `./estoque.xlsx` | Workbook used as the data store |
| `SESSION_NAME` | `estoque_bot` | WhatsApp session id (`LocalAuth`) |
| `LOG_LEVEL` | `info` | `debug` for verbose logs |
| `PORT` | `3000` | REST API port |

Logs are written to `logs/bot.log`.

## Known limitations

- Excel is not a database: there is no concurrency control, so the bot and a
  person editing the file at the same time can overwrite each other. SQLite
  would be the next step if the business grows.
- `excel-manager.js` concentrates a lot of logic and should be split by sheet.
- There are no automated tests yet.
- `npm audit` reports advisories in `xlsx` (no fixed version on npm) and in the
  Puppeteer version pulled by whatsapp-web.js.
