# Clean City API

API Node.js com TypeScript para aplicativo de crowdsensing de limpeza urbana.

## Características

- Autenticação com JWT
- Banco de dados MySQL com Prisma ORM
- Migrations automáticas
- Sincronização em tempo real com WebSocket (Socket.io)
- Compartilhamento de ocorrências entre usuários
- Upload de fotos com armazenamento local
- Dados ambientais (acelerômetro, temperatura, umidade, pressão)
- Sistema de estatísticas
- Busca geográfica (por coordenadas)

## Requisitos

- Node.js 16+
- npm ou yarn
- MySQL 8.0+

## Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd CleanCityAPI
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Atualize o arquivo `.env` com suas configurações:
```env
DATABASE_URL=mysql://user:password@localhost:3306/clean_city_db
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

5. Execute as migrations do Prisma:
```bash
npm run prisma:migrate
```

6. Inicie o servidor:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia o servidor compilado
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrations pendentes
- `npm run prisma:deploy` - Faz deploy de migrations em produção
- `npm run prisma:studio` - Abre o Prisma Studio para gerenciar dados
- `npm run lint` - Executa ESLint
- `npm run type-check` - Verifica tipos TypeScript

## Estrutura do Projeto

```
src/
├── controllers/      # Controllers da API
├── services/         # Lógica de negócio
├── middleware/       # Middlewares Express
├── routes/           # Rotas da API
├── types/            # Tipos TypeScript
├── utils/            # Utilitários (JWT, armazenamento local)
└── index.ts          # Ponto de entrada

prisma/
├── schema.prisma     # Esquema do banco de dados
└── migrations/       # Histórico de migrations

uploads/             # Pasta para armazenar fotos
```

## API Endpoints

### Autenticação
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obter perfil (requer autenticação)
- `PUT /api/auth/profile` - Atualizar perfil (requer autenticação)
- `POST /api/auth/change-password` - Mudar senha (requer autenticação)

### Ocorrências
- `GET /api/occurrences` - Listar todas as ocorrências (público)
- `GET /api/occurrences/stats` - Obter estatísticas (público)
- `GET /api/occurrences/bounds` - Buscar por coordenadas (público)
- `POST /api/occurrences` - Criar ocorrência (requer autenticação)
- `GET /api/occurrences/:id` - Obter ocorrência (público)
- `GET /api/occurrences/my-occurrences` - Listar minhas ocorrências (requer autenticação)
- `PUT /api/occurrences/:id` - Atualizar ocorrência (requer autenticação)
- `DELETE /api/occurrences/:id` - Deletar ocorrência (requer autenticação)

### Fotos
- `POST /api/photos/:occurrenceId` - Upload de foto (requer autenticação)
- `GET /api/photos/:occurrenceId` - Listar fotos de uma ocorrência
- `GET /api/photos/download/:photoId` - Baixar foto
- `DELETE /api/photos/:photoId` - Deletar foto (requer autenticação)

### Compartilhamento
- `POST /api/shares` - Compartilhar ocorrência (requer autenticação)
- `GET /api/shares/shared-with-me` - Ocorrências compartilhadas comigo (requer autenticação)
- `GET /api/shares/shared-by-me` - Ocorrências que compartilhei (requer autenticação)
- `DELETE /api/shares/:shareId` - Revogar compartilhamento (requer autenticação)

## WebSocket Events

### Cliente → Servidor
- `user:login` - Notifica login do usuário
- `occurrence:created` - Nova ocorrência criada
- `occurrence:updated` - Ocorrência atualizada
- `occurrence:deleted` - Ocorrência deletada
- `photo:uploaded` - Foto enviada
- `share:created` - Ocorrência compartilhada

### Servidor → Cliente
- `occurrence:new` - Nova ocorrência criada
- `occurrence:changed` - Ocorrência atualizada
- `occurrence:removed` - Ocorrência deletada
- `photo:new` - Foto enviada
- `share:received` - Ocorrência compartilhada com você

## Exemplo de Uso

### Cadastro
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Criar Ocorrência
```bash
curl -X POST http://localhost:3000/api/occurrences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Entulho encontrado",
    "description": "Grande quantidade de entulho na rua",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "address": "Rua Exemplo, São Paulo",
    "accelerometerX": 0.5,
    "accelerometerY": 0.2,
    "accelerometerZ": 9.8
  }'
```

### Upload de Foto
```bash
curl -X POST http://localhost:3000/api/photos/OCCURRENCE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

## Banco de Dados

### Modelos

#### User
- id (String, único)
- email (String, único)
- fullName (String)
- passwordHash (String)
- avatar (String, opcional)
- createdAt (DateTime)
- updatedAt (DateTime)

#### Occurrence
- id (String, único)
- userId (String, chave estrangeira)
- title (String)
- description (String)
- latitude (Float)
- longitude (Float)
- address (String, opcional)
- accelerometerX, Y, Z (Float, opcional)
- temperature, humidity, pressure (Float, opcional)
- status (OccurrenceStatus: PENDING, VERIFIED, RESOLVED, DISPUTED)
- createdAt (DateTime)
- updatedAt (DateTime)

#### Photo
- id (String, único)
- occurrenceId (String, chave estrangeira)
- userId (String, chave estrangeira)
- fileName (String)
- filePath (String)
- fileSize (Int)
- mimeType (String)
- createdAt (DateTime)

#### SharedOccurrence
- id (String, único)
- occurrenceId (String, chave estrangeira)
- sharedById (String, chave estrangeira)
- sharedWithId (String, chave estrangeira)
- permission (SharePermission: VIEW, EDIT, ADMIN)
- createdAt (DateTime)

## Sincronização de Dados

A API usa WebSocket para sincronização em tempo real:

1. Quando um usuário faz login, ele se conecta a um "room" específico
2. Eventos de criação, atualização e deleção são transmitidos em tempo real
3. Compartilhamentos notificam o usuário que recebeu a ocorrência
4. Fotos são sincronizadas para os usuários autorizados

## Segurança

- Senhas são hasheadas com bcryptjs
- Autenticação via JWT
- CORS configurável
- Validação de uploads (tipo de arquivo, tamanho)
- Autorização em endpoints protegidos

## Desenvolvimento

### Adicionando uma nova migration

```bash
npm run prisma:migrate -- --name nova_migration
```

### Atualizando o schema

1. Edite `prisma/schema.prisma`
2. Execute `npm run prisma:migrate`
3. A migration será criada e aplicada automaticamente

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

## Licença

MIT
