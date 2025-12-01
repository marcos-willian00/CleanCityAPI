# Refatoração Completa - Supabase → MySQL Local

## Resumo das Mudanças

Este documento descreve a refatoração realizada para remover completamente a dependência de Supabase e PostgreSQL, usando apenas **MySQL com armazenamento local de arquivos**.

## O que Foi Removido

### 1. Dependência Supabase
```json
// REMOVIDO de package.json
"@supabase/supabase-js": "^2.86.0"
```

### 2. Variáveis de Ambiente Supabase
```env
# REMOVIDAS de .env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Código Supabase
- Arquivo `src/utils/supabase.ts` foi completamente refatorado
- Removed: `uploadPhotoToSupabase()` - usava Supabase Storage
- Removed: `deletePhotoFromSupabase()` - usava Supabase Storage
- Removed: `supabase` client initialization

## O que Foi Mudado

### 1. Armazenamento de Fotos

**ANTES**: Armazenamento na Supabase
```typescript
// Supabase Storage
const publicUrl = await uploadPhotoToSupabase(
  'photos-bucket',
  `occurrences/${occurrenceId}/${filename}`,
  fileBuffer,
  mimeType
);
```

**DEPOIS**: Armazenamento Local
```typescript
// Sistema de arquivos local
const filepath = await uploadPhotoLocally(filename, fileBuffer);
// Resultado: ./uploads/occurrence-id/photo-uuid.jpg
```

### 2. Banco de Dados

**ANTES**: PostgreSQL via Supabase
```env
DATABASE_URL=postgresql://postgres:[senha]@db.supabase.co:5432/postgres
```

**DEPOIS**: MySQL Local
```env
DATABASE_URL=mysql://user:password@localhost:3306/clean_city_db
```

### 3. Utilitários (`src/utils/supabase.ts`)

**Novas Funções:**
```typescript
// Upload de arquivo local
async function uploadPhotoLocally(
  filename: string,
  file: Buffer
): Promise<string>

// Exclusão de arquivo local
async function deletePhotoLocally(
  filepath: string
): Promise<void>
```

## Estrutura de Diretórios

```
uploads/
├── photo-uuid-1.jpg
├── photo-uuid-2.png
├── photo-uuid-3.webp
└── ...
```

Cada foto é salva com um UUID único para evitar conflitos.

## Arquivos Atualizados

### 1. `.env.example`
- ✅ Removidas variáveis Supabase
- ✅ Mantido DATABASE_URL (MySQL)
- ✅ Mantidas configurações de arquivo

### 2. `package.json`
- ✅ Removido `@supabase/supabase-js`
- ✅ Mantidas todas outras dependências

### 3. `src/utils/supabase.ts`
- ✅ Completamente refatorado
- ✅ Agora usa fs (filesystem) do Node.js
- ✅ Criação automática de diretório `uploads/`

### 4. `README.md`
- ✅ Removidas referências a Supabase
- ✅ Atualizado exemplo de .env
- ✅ Atualizado de "PostgreSQL" para "MySQL"

### 5. Documentação
- ✅ Criado `ARMAZENAMENTO.md` - guia completo de armazenamento
- ✅ Atualizado `COPILOT_INSTRUCTIONS.md`
- ✅ Criado este documento

## Novo Fluxo de Upload

```
1. Cliente envia foto (multipart/form-data)
   ↓
2. Multer recebe e valida
   ↓
3. PhotoController checa autenticação JWT
   ↓
4. PhotoService verifica propriedade da ocorrência
   ↓
5. uploadPhotoLocally() salva em ./uploads/
   ↓
6. Banco de dados (MySQL) registra metadados
   ↓
7. Cliente recebe resposta com filePath
   ↓
8. Para download: GET /api/photos/download/:photoId
   ↓
9. Express serve arquivo via fs.createReadStream()
```

## Benefícios

### Simplicidade
- ❌ Sem conta Supabase necessária
- ❌ Sem configurações complexas
- ✅ Apenas MySQL (já configurado)

### Custo
- ❌ Não há custos de Supabase
- ✅ Apenas hospedagem do servidor

### Controle
- ✅ Acesso total aos arquivos
- ✅ Possibilidade de backup simples
- ✅ Sem dependências externas

### Performance
- ✅ Sem latência de APIs externas
- ✅ Upload e download locais são rápidos
- ✅ Menos requisições HTTP

## Dados Armazenados

### Banco de Dados (MySQL)
```
Photo table:
- id (UUID)
- occurrenceId (FK)
- userId (FK)
- fileName (string)
- filePath (local path)
- fileSize (int)
- mimeType (string)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Sistema de Arquivos
```
./uploads/
- Arquivos binários de fotos
- Nomeados com UUID
- Tipos suportados: JPEG, PNG, WebP
```

## Migração de Dados

Se você tinha fotos no Supabase:

1. **Baixar fotos do Supabase**
   ```bash
   # Usar Supabase CLI ou API
   supabase storage download
   ```

2. **Mover para ./uploads**
   ```bash
   cp -r /supabase/fotos/* ./uploads/
   ```

3. **Atualizar banco de dados**
   - Importar dados de Photo (MySQL já tem tabela)
   - Atualizar filePath para ./uploads/...
   - Executar migration:
   ```bash
   npm run prisma:migrate -- --name migrate_supabase_to_local
   ```

## Configuração Necessária

### 1. Instalar dependências (sem Supabase)
```bash
npm install
```

### 2. Configurar .env
```env
DATABASE_URL=mysql://root:password@localhost:3306/clean_city_db
JWT_SECRET=seu-secret
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Inicializar banco
```bash
npm run prisma:migrate -- --name init
```

### 4. Verificar pasta uploads
```bash
mkdir -p ./uploads
chmod 755 ./uploads
```

### 5. Testar
```bash
npm run dev
```

## Validações Ainda Ativas

✅ Tipos de arquivo (JPEG, PNG, WebP)  
✅ Tamanho máximo (10MB padrão)  
✅ Autenticação JWT  
✅ Autorização (verificação de propriedade)  
✅ Armazenamento seguro em ./uploads/  

## Troubleshooting

### Erro: "ENOENT: no such file or directory"
```
Solução: Criar pasta uploads
mkdir -p ./uploads
```

### Erro: "EACCES: permission denied"
```
Solução: Dar permissão de escrita
chmod 755 ./uploads
```

### Erro: "File not found on download"
```
Solução: Verificar filePath no banco de dados
npm run prisma:studio
```

## Backup de Arquivos

### Estratégia Recomendada

```bash
# Backup diário da pasta uploads
0 0 * * * tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz ./uploads/

# Manter últimos 30 dias
find /backup -name "uploads-*.tar.gz" -mtime +30 -delete
```

## Próximas Melhorias

- [ ] Compressão automática de imagens
- [ ] Geração de thumbnails
- [ ] Cache headers para fotos
- [ ] Limpeza automática de arquivos órfãos
- [ ] Validação de integridade de arquivo
- [ ] Limite de quota por usuário

## Rollback (se necessário)

Se quiser voltar a usar Supabase:

1. **Restaurar dependência**
   ```bash
   npm install @supabase/supabase-js@2.86.0
   ```

2. **Restaurar código original supabase.ts**
   ```bash
   git checkout HEAD -- src/utils/supabase.ts
   ```

3. **Restaurar variáveis .env**
   ```env
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

4. **Instalar dependências**
   ```bash
   npm install
   ```

## Referências

- [Node.js fs Documentation](https://nodejs.org/api/fs.html)
- [Multer Middleware](https://github.com/expressjs/multer)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)

---

**Data da Refatoração**: 01/12/2025  
**Versão**: 1.1.0 (sem Supabase)  
**Status**: ✅ Completo e testado
