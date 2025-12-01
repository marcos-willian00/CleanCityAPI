# Arquitetura da Clean City API

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (App Mobile)                          │
│             React Native / Flutter / Expo                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - Autenticação (JWT)                                     │   │
│  │ - Criar/Listar Ocorrências                              │   │
│  │ - Upload de Fotos                                       │   │
│  │ - Dados Ambientais (Sensores)                           │   │
│  │ - Sincronização Tempo Real (WebSocket)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP + WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                  CLEAN CITY API                                 │
│            Node.js + Express + TypeScript                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MIDDLEWARES                                 │   │
│  │  - Autenticação JWT                                     │   │
│  │  - CORS                                                 │   │
│  │  - Body Parser                                          │   │
│  │  - Multer (Upload)                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                ROTAS                                      │  │
│  │  /api/auth     - Autenticação                           │  │
│  │  /api/occurrences - Ocorrências                         │  │
│  │  /api/photos   - Fotos                                  │  │
│  │  /api/shares   - Compartilhamento                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            CONTROLLERS                                   │  │
│  │  - AuthController                                       │  │
│  │  - OccurrenceController                                 │  │
│  │  - PhotoController                                      │  │
│  │  - ShareController                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SERVICES                                    │  │
│  │  - AuthService                                          │  │
│  │  - OccurrenceService                                    │  │
│  │  - PhotoService                                         │  │
│  │  - ShareService                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           WebSocket (Socket.IO)                          │  │
│  │  - Eventos em tempo real                                │  │
│  │  - Sincronização de dados                               │  │
│  │  - Notificações                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           UTILITÁRIOS                                    │  │
│  │  - JWT (Geração e Verificação)                          │  │
│  │  - Supabase (Storage)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬────────────────────────┬─────────────────┘
                       │                        │
                       ▼                        ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │   PostgreSQL DB      │    │  Supabase Storage    │
        │  (com Prisma ORM)    │    │   (Armazenamento)    │
        │                      │    │                      │
        │ - Users              │    │ - Fotos              │
        │ - Occurrences        │    │ - Outros arquivos    │
        │ - Photos             │    │                      │
        │ - SharedOccurrences  │    │                      │
        │ - Notifications      │    │                      │
        └──────────────────────┘    └──────────────────────┘
```

## Fluxo de Autenticação

```
┌─────────────────┐
│  SIGNUP/LOGIN   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ POST /auth/signup ou /login  │
│ Body: { email, password }    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ AuthController.signup()      │
│ AuthController.login()       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ AuthService                  │
│ - Validar credenciais        │
│ - Hash de senha              │
│ - Gerar JWT                  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Banco de Dados               │
│ - Salvar/Buscar usuário      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response com JWT             │
│ { user, token }              │
└──────────────────────────────┘
```

## Fluxo de Criação de Ocorrência

```
┌──────────────────────────┐
│ App: Seleciona localização │
│      Descreve problema     │
│      Captura foto          │
│      Coleta dados ambientais│
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ POST /api/occurrences                           │
│ Headers: { Authorization: Bearer <token> }      │
│ Body: { title, description, latitude,           │
│         longitude, sensors... }                 │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ OccurrenceController.create()                   │
│ - Validar token JWT                             │
│ - Validar dados de entrada                      │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ OccurrenceService.createOccurrence()            │
│ - Lógica de negócio                             │
│ - Cálculos/validações                           │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Prisma ORM                                      │
│ - SQL Query                                     │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ PostgreSQL Database                             │
│ - Inserir em occurrences                        │
│ - Retornar ID                                   │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ WebSocket Event                                 │
│ socket.emit('occurrence:created', data)         │
│ - Todos clientes recebem notificação            │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ POST /api/photos/:occurrenceId                  │
│ - Upload da foto                                │
│ - Multipart/form-data                           │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ PhotoController.uploadPhoto()                   │
│ - Validar arquivo                               │
│ - Salvar em uploads/                            │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Banco de Dados                                  │
│ - Inserir registro em photos                    │
└────────┬──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Response com sucesso                            │
│ { occurrence, photos }                          │
└─────────────────────────────────────────────────┘
```

## Fluxo de Compartilhamento

```
┌──────────────────────────────┐
│ Usuário A quer compartilhar  │
│ uma ocorrência com Usuário B │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ POST /api/shares                         │
│ { occurrenceId, userEmail, permission }  │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ ShareController.shareOccurrence()        │
│ - Validar ownership                      │
│ - Verificar se user existe               │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ ShareService.shareOccurrence()           │
│ - Criar relacionamento                   │
│ - Definir permissões                     │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Banco de Dados                           │
│ - Inserir em shared_occurrences          │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ WebSocket Event                          │
│ socket.to(`user:${userBId}`)             │
│     .emit('share:received', data)        │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Usuário B é notificado em tempo real     │
│ Pode acessar ocorrência compartilhada    │
└──────────────────────────────────────────┘
```

## Stack de Tecnologias

### Backend
- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework Web**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Realtime**: Socket.io
- **Upload**: Multer
- **Password**: bcryptjs

### Frontend (Integração)
- **React Native** ou **Flutter** ou **Expo**
- **HTTP Client**: axios ou dio
- **Storage**: SecureStore ou flutter_secure_storage
- **WebSocket**: socket.io-client
- **State Management**: Context API ou Redux/Riverpod

### Deployment
- **Database**: Supabase ou AWS RDS
- **Server**: Heroku, DigitalOcean, Railway, Render
- **Storage**: Supabase Storage ou AWS S3
- **CI/CD**: GitHub Actions

## Estrutura de Pastas Detalhada

```
CleanCityAPI/
├── src/
│   ├── controllers/           # Handlers das rotas
│   │   ├── AuthController.ts
│   │   ├── OccurrenceController.ts
│   │   ├── PhotoController.ts
│   │   └── ShareController.ts
│   │
│   ├── services/              # Lógica de negócio
│   │   ├── AuthService.ts
│   │   ├── OccurrenceService.ts
│   │   ├── PhotoService.ts
│   │   └── ShareService.ts
│   │
│   ├── routes/                # Definição de rotas
│   │   ├── auth.ts
│   │   ├── occurrences.ts
│   │   ├── photos.ts
│   │   └── shares.ts
│   │
│   ├── middleware/            # Middlewares
│   │   ├── auth.ts            # JWT validation
│   │   └── errorHandler.ts
│   │
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── utils/                 # Utilitários
│   │   ├── jwt.ts
│   │   └── supabase.ts
│   │
│   └── index.ts               # Ponto de entrada
│
├── prisma/
│   ├── schema.prisma          # Esquema do BD
│   ├── prisma.config.ts
│   └── migrations/            # Histórico de migrations
│
├── dist/                      # Compilado (gerado)
├── uploads/                   # Fotos locais (dev)
├── node_modules/              # Dependências
│
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── .env                       # Variáveis de ambiente
├── .env.example
├── .gitignore
│
├── README.md                  # Overview geral
├── DATABASE_SETUP.md          # Setup do banco
├── SUPABASE_SETUP.md          # Setup Supabase
├── WEBSOCKET.md               # Documentação WebSocket
├── DEPLOY.md                  # Deploy em produção
├── INTEGRATION.md             # Integração com app
│
└── CleanCityAPI.postman_collection.json  # Collection Postman
```

## Fluxo de Requisição HTTP

```
1. Cliente envia requisição HTTP
   ↓
2. Express recebe e passa por middlewares
   ├─ Body Parser (JSON)
   ├─ CORS
   ├─ Autenticação JWT
   └─ Multer (para uploads)
   ↓
3. Rota encontra o controller apropriado
   ↓
4. Controller:
   ├─ Valida entrada
   ├─ Chama o service
   └─ Formata resposta
   ↓
5. Service:
   ├─ Aplica lógica de negócio
   ├─ Consulta banco via Prisma
   └─ Retorna resultado
   ↓
6. Banco de dados (PostgreSQL)
   ├─ Executa query
   └─ Retorna dados
   ↓
7. Service retorna para Controller
   ↓
8. Controller monta resposta JSON
   ↓
9. Express envia response ao cliente
   ↓
10. (Opcional) WebSocket emite evento para outros clientes
```

## Escalabilidade

Para escalar a aplicação:

```
┌─────────────────────────────────────────────┐
│     Load Balancer (Nginx/HAProxy)           │
└─────────────────────────────────────────────┘
           │      │      │
    ┌──────▼─┬────▼─┬────▼──┐
    ▼        ▼      ▼       ▼
┌───────┐┌───────┐┌───────┐┌───────┐
│ API 1 ││ API 2 ││ API 3 ││ API N │
└───────┘└───────┘└───────┘└───────┘
    │        │      │       │
    └────────┴──────┴───────┘
           │
    ┌──────▼──────────┐
    │  PostgreSQL DB  │ (com replicação)
    └─────────────────┘
           │
    ┌──────▼──────────┐
    │ Redis Cache     │ (opcional)
    └─────────────────┘
```

## Segurança

- ✅ Senhas hasheadas com bcryptjs
- ✅ JWT para autenticação
- ✅ Validação de entrada em todas as rotas
- ✅ CORS configurado
- ✅ Rate limiting em produção
- ✅ HTTPS em produção
- ✅ Secrets em variáveis de ambiente
- ✅ Permissões por usuário
