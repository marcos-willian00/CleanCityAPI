# Clean City API - Project Context

## Visão Geral

Clean City API é uma API Node.js com TypeScript que funciona como backend para um aplicativo de crowdsensing de limpeza urbana.

## Tecnologias

- **Runtime**: Node.js 16+
- **Linguagem**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **Banco de Dados**: MySQL com Prisma ORM 5.x
- **Autenticação**: JWT
- **Real-time**: Socket.io 4.x
- **Armazenamento**: Local (pasta ./uploads)

## Estrutura do Projeto

```
src/
├── controllers/      # Controladores (handlers das rotas)
├── services/         # Lógica de negócio
├── middleware/       # Middlewares Express
├── routes/           # Definições de rotas
├── types/            # Tipos TypeScript
├── utils/            # Utilitários (JWT, armazenamento local)
└── index.ts          # Ponto de entrada da aplicação

prisma/
├── schema.prisma     # Schema do banco
└── migrations/       # Histórico de migrations

uploads/             # Pasta para armazenar fotos
```

## Modelos de Banco de Dados

### User
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  fullName     String
  passwordHash String
  avatar       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relações
  occurrences      Occurrence[]
  photos           Photo[]
  sharedOccurrences SharedOccurrence[]
  sharedWithMe     SharedOccurrence[] @relation("SharedWith")
  notifications    Notification[]
}
```

### Occurrence
```prisma
model Occurrence {
  id                  String   @id @default(cuid())
  userId              String
  title               String
  description         String
  latitude            Float
  longitude           Float
  address             String?
  status              OccurrenceStatus @default(PENDING)
  
  // Dados ambientais
  accelerometerX      Float?
  accelerometerY      Float?
  accelerometerZ      Float?
  temperature         Float?
  humidity            Float?
  pressure            Float?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relações
  user                User @relation(fields: [userId], references: [id], onDelete: Cascade)
  photos              Photo[]
  sharedWith          SharedOccurrence[]
}
```

### Photo
```prisma
model Photo {
  id              String   @id @default(cuid())
  occurrenceId    String
  userId          String
  fileName        String
  filePath        String
  fileSize        Int
  mimeType        String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  occurrence      Occurrence @relation(fields: [occurrenceId], references: [id], onDelete: Cascade)
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### SharedOccurrence
```prisma
model SharedOccurrence {
  id              String   @id @default(cuid())
  occurrenceId    String
  sharedById      String
  sharedWithId    String
  permission      SharePermission @default(VIEW)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relações
  occurrence      Occurrence @relation(fields: [occurrenceId], references: [id], onDelete: Cascade)
  sharedBy        User @relation(fields: [sharedById], references: [id], onDelete: Cascade)
  sharedWith      User @relation("SharedWith", fields: [sharedWithId], references: [id], onDelete: Cascade)
  
  @@unique([occurrenceId, sharedWithId])
}
```

### Notification
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  // Relações
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil (autenticado)
- `PUT /api/auth/profile` - Atualizar perfil (autenticado)
- `POST /api/auth/change-password` - Mudar senha (autenticado)

### Ocorrências
- `POST /api/occurrences` - Criar ocorrência (autenticado)
- `GET /api/occurrences` - Listar todas
- `GET /api/occurrences/my-occurrences` - Minhas ocorrências (autenticado)
- `GET /api/occurrences/:id` - Detalhe
- `GET /api/occurrences/bounds` - Busca geográfica
- `GET /api/occurrences/stats` - Estatísticas
- `PUT /api/occurrences/:id` - Atualizar (autenticado)
- `DELETE /api/occurrences/:id` - Deletar (autenticado)

### Fotos
- `POST /api/photos/:occurrenceId` - Upload (autenticado)
- `GET /api/photos/:occurrenceId` - Listar fotos
- `GET /api/photos/download/:photoId` - Download
- `DELETE /api/photos/:photoId` - Deletar (autenticado)

### Compartilhamento
- `POST /api/shares` - Compartilhar (autenticado)
- `GET /api/shares/shared-with-me` - Recebidas (autenticado)
- `GET /api/shares/shared-by-me` - Enviadas (autenticado)
- `DELETE /api/shares/:shareId` - Revogar (autenticado)

## Setup e Instalação

### Pré-requisitos
```bash
- Node.js 16+
- npm ou yarn
- MySQL 8.0+
```

### Passos

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar .env**
   ```bash
   cp .env.example .env
   ```
   
   Editar com suas configurações:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/clean_city_db
   JWT_SECRET=seu-secret
   JWT_EXPIRATION=7d
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

3. **Migrations**
   ```bash
   npm run prisma:migrate
   ```

4. **Iniciar servidor**
   ```bash
   npm run dev
   ```

### Scripts Úteis

- `npm run dev` - Desenvolvimento com hot-reload
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar versão compilada
- `npm run type-check` - Verificar tipos
- `npm run lint` - ESLint
- `npm run prisma:migrate` - Executar migrations
- `npm run prisma:studio` - Interface visual do Prisma

## Padrões de Código

### Estrutura de Controllers
```typescript
export class MyController {
  async myMethod(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validar autenticação
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Lógica do controller
      const data = await myService.doSomething();

      // Resposta
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

### Estrutura de Services
```typescript
export class MyService {
  async doSomething(): Promise<Data> {
    // Usar Prisma para dados
    const result = await prisma.model.findUnique({...});
    
    if (!result) throw new Error('Not found');
    
    return result;
  }
}
```

### Autenticação
- Usar `authMiddleware` para rotas protegidas
- JWT tokens com `utils/jwt.ts`
- Senhas com `bcryptjs` (salt rounds: 10)
- Token expiration: 7 dias (configurável)

## WebSocket Events

Conectar em `ws://localhost:3000`:

```typescript
// Conectar
const socket = io('http://localhost:3000');

// Eventos
socket.on('user:login', (data) => {});
socket.on('occurrence:created', (data) => {});
socket.on('occurrence:updated', (data) => {});
socket.on('occurrence:deleted', (data) => {});
socket.on('photo:uploaded', (data) => {});
socket.on('share:created', (data) => {});
```

## Armazenamento de Fotos

- Pasta: `./uploads`
- Tipos: JPEG, PNG, WebP
- Tamanho máximo: 10MB
- Validação: Multer + MIME type
- Autorização: Propriedade verificada

Ver `ARMAZENAMENTO.md` para detalhes.

## Variáveis de Ambiente

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/clean_city_db

# JWT
JWT_SECRET=seu-secret-seguro
JWT_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development|production

# CORS
CORS_ORIGIN=http://localhost:3000

# Files
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Testing

Usar Postman collection: `CleanCityAPI.postman_collection.json`

Ou script bash: `test-api.sh`

## Documentação

- `README.md` - Overview geral
- `DATABASE_SETUP.md` - Configuração do banco
- `ARMAZENAMENTO.md` - Armazenamento de fotos
- `WEBSOCKET.md` - WebSocket e sincronização
- `ARCHITECTURE.md` - Arquitetura detalhada
- `INTEGRATION.md` - Integração com app mobile
- `DEPLOY.md` - Deploy em produção

## Próximas Melhorias

- [ ] Autenticação com Google/GitHub
- [ ] Rate limiting
- [ ] Compressão de imagens
- [ ] Email notifications
- [ ] Analytics
- [ ] Admin dashboard
- [ ] Moderação de conteúdo
- [ ] ML categorização

## Debugging

### Erros Comuns

**"Missing Prisma configuration"**
- Certifique-se que `DATABASE_URL` está configurado em `.env`
- Execute `npm run prisma:generate`

**"JWT verification failed"**
- Token expirado: Regenere fazendo login novamente
- Formato inválido: Use "Bearer TOKEN" no header

**"File too large"**
- Aumente `MAX_FILE_SIZE` no `.env`

**"Database connection refused"**
- Verifique se MySQL está rodando
- Verifique `DATABASE_URL` em `.env`

## Recursos

- [Prisma MySQL](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#mysql)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/docs/)
- [JWT](https://jwt.io/)
- [Multer](https://github.com/expressjs/multer)

---

**Última atualização**: 01/12/2025  
**Versão do Projeto**: 1.0.0
