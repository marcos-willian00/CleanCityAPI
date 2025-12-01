# Configuração do Supabase

Este guia explica como configurar o Supabase para a Clean City API.

## O que é Supabase?

Supabase é um backend moderno baseado em PostgreSQL que oferece:
- Banco de dados PostgreSQL gerenciado
- Autenticação
- Storage para arquivos
- Realtime subscriptions
- Funções serverless (Edge Functions)

## Passos para Configurar

### 1. Criar Conta Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Sign Up"
3. Use Google, GitHub ou email para criar a conta

### 2. Criar um Novo Projeto

1. No dashboard, clique em "New Project"
2. Preencha os dados:
   - **Project Name**: `clean-city-api` (ou outro nome)
   - **Database Password**: Crie uma senha forte (salve-a em local seguro!)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
3. Clique "Create new project"
4. Aguarde 2-5 minutos enquanto o projeto é criado

### 3. Obter Credenciais

1. Vá para **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public**: Sua chave anônima
   - **service_role secret**: Sua chave de service role

3. Vá para **Settings > Database**
4. Copie a **Connection String** (padrão)

### 4. Configurar .env

Atualize o arquivo `.env` com as credenciais:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Database
DATABASE_URL=postgresql://postgres.[seu-projeto]:[sua-senha]@db.[seu-projeto].supabase.co:5432/postgres
```

### 5. Executar Migrations

```bash
npm run prisma:migrate -- --name init
```

Isso criará as tabelas no banco Supabase.

### 6. Criar Storage Bucket (Opcional)

Para armazenar fotos no Supabase Storage:

1. Vá para **Storage > Buckets**
2. Clique em "Create a new bucket"
3. Nome: `photos`
4. Escolha "Public bucket"
5. Clique "Create bucket"

### 7. Configurar Políticas de Segurança

1. Vá para **Authentication > Policies**
2. Clique em "New policy"
3. Configure para permitir:
   - Usuários autenticados: CREATE, READ, UPDATE, DELETE
   - Usuários públicos: READ (apenas visualizar)

## Opções de Plano

### Free Tier (Gratuito)
- ✅ 500 MB de armazenamento
- ✅ 1 GB de bandwidth mensal
- ✅ Até 3 projetos
- ✅ Suporte comunitário
- ✅ Backups diários

### Pro Tier ($25/mês)
- ✅ 100 GB de armazenamento
- ✅ 250 GB de bandwidth
- ✅ Projetos ilimitados
- ✅ Prioridade de suporte
- ✅ Backups diários

## Variáveis de Ambiente

```env
# Autenticação Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=seu-anon-key
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key

# Banco de dados
DATABASE_URL=postgresql://postgres:senha@db.supabase.co:5432/postgres

# JWT
JWT_SECRET=seu-secret-key-aqui
JWT_EXPIRATION=7d

# Servidor
PORT=3000
NODE_ENV=production

# Upload de arquivos
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=https://seu-dominio.com
```

## Conectar CLI do Supabase

Para gerenciar migrations localmente:

```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Fazer login
supabase login

# Ligar ao projeto
supabase link --project-ref seu-projeto

# Criar migration
supabase migration new criar_tabelas

# Fazer deploy de migrations
supabase db push
```

## Monitoramento

### Ver Logs

1. Vá para **Logs**
2. Veja os logs de:
   - API Requests
   - Database Operations
   - Authentication Events

### Métricas

1. Vá para **Statistics**
2. Monitore:
   - Database Size
   - Storage Usage
   - Bandwidth Usage
   - Monthly Active Users

## Troubleshooting

### Erro: "connection refused"
- Verifique se a senha no DATABASE_URL está correta
- Verifique se o IP está whitelist (Supabase geralmente permite todos)

### Erro: "table does not exist"
- Execute: `npm run prisma:migrate`
- Verifique se as migrations foram aplicadas em **Database > Migrations**

### Erro: "authentication failed"
- Copie novamente a connection string
- Verifique espaços ou caracteres especiais

### Erro: "file not found" no upload
- Crie o bucket 'photos' em **Storage > Buckets**
- Verifique as permissões do bucket

## Backup e Restore

### Fazer Backup Manual

1. Vá para **Settings > Database > Backups**
2. Clique em "Backup now"

### Download de Backup

1. Na aba "Backups"
2. Clique no ícone de download próximo ao backup

## Próximos Passos

- ✅ Configurar autenticação social (Google, GitHub)
- ✅ Adicionar Edge Functions para lógica serverless
- ✅ Configurar webhooks para sincronização
- ✅ Monitorar performance do banco de dados

## Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Exemplos Supabase](https://github.com/supabase/supabase/tree/master/examples)
- [Status Page](https://status.supabase.com)
- [Community](https://discord.supabase.io)
