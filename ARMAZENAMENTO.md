# Armazenamento de Fotos - Clean City API

## Visão Geral

A Clean City API usa **armazenamento local de arquivos** para fotos. Todos os arquivos são salvos na pasta `./uploads` do servidor.

## Configuração

### Variáveis de Ambiente

```env
# Caminho para pasta de uploads (padrão: ./uploads)
UPLOAD_PATH=./uploads

# Tamanho máximo de arquivo (padrão: 10MB = 10485760 bytes)
MAX_FILE_SIZE=10485760
```

### Estrutura de Pastas

```
project-root/
├── uploads/
│   ├── occurrence-1/
│   │   ├── photo-1.jpg
│   │   └── photo-2.png
│   ├── occurrence-2/
│   │   └── photo-1.webp
│   └── ...
├── src/
├── dist/
└── node_modules/
```

## Endpoints de Upload

### 1. Upload de Foto

**POST** `/api/photos/:occurrenceId`

```bash
curl -X POST http://localhost:3000/api/photos/occurrence-123 \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "photo=@/caminho/para/foto.jpg"
```

**Requisitos:**
- Autenticação obrigatória (JWT)
- Arquivo no campo `photo` (multipart/form-data)
- Tipos suportados: JPEG, PNG, WebP
- Tamanho máximo: 10MB

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "photo-uuid-123",
    "occurrenceId": "occurrence-123",
    "userId": "user-456",
    "fileName": "foto.jpg",
    "filePath": "./uploads/occurrence-123/photo-uuid-123.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T10:30:00Z"
  }
}
```

### 2. Listar Fotos de uma Ocorrência

**GET** `/api/photos/:occurrenceId`

```bash
curl http://localhost:3000/api/photos/occurrence-123 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "photo-123",
      "fileName": "foto.jpg",
      "filePath": "./uploads/occurrence-123/photo-123.jpg",
      "fileSize": 2048576,
      "createdAt": "2024-12-01T10:30:00Z"
    }
  ]
}
```

### 3. Download de Foto

**GET** `/api/photos/download/:photoId`

```bash
curl http://localhost:3000/api/photos/download/photo-123 \
  -H "Authorization: Bearer seu_token_jwt" \
  -O -J
```

Retorna o arquivo binário com headers apropriados.

### 4. Deletar Foto

**DELETE** `/api/photos/:photoId`

```bash
curl -X DELETE http://localhost:3000/api/photos/photo-123 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

## Validações

### Tipos de Arquivo Aceitos

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',   // .jpg, .jpeg
  'image/png',    // .png
  'image/webp'    // .webp
];
```

### Tamanho Máximo

- **Padrão**: 10MB (10,485,760 bytes)
- **Configurável**: Via `MAX_FILE_SIZE` no `.env`

### Validações Aplicadas

✅ Arquivo obrigatório  
✅ Tipo MIME validado  
✅ Tamanho verificado  
✅ Propriedade da ocorrência verificada  
✅ Autorização do usuário verificada  

## Fluxo de Upload

```
1. Cliente envia arquivo
   ↓
2. Multer valida arquivo
   ↓
3. PhotoController recebe request
   ↓
4. Valida autenticação JWT
   ↓
5. PhotoService verifica ownership
   ↓
6. Arquivo salvo em ./uploads/
   ↓
7. Registro criado no banco de dados
   ↓
8. Resposta com dados da foto
```

## Segurança

### Boas Práticas Implementadas

1. **Validação de Tipo**: Apenas JPEG, PNG, WebP aceitos
2. **Limite de Tamanho**: Máximo 10MB por arquivo
3. **Autenticação**: JWT obrigatório
4. **Autorização**: Apenas proprietário pode deletar
5. **Isolamento**: Fotos organizadas por ocorrência
6. **Nomeação**: UUIDs para evitar colisões

### Considerações para Produção

Para ambientes de produção, considere:

```bash
# 1. Usar CDN para servir fotos
# 2. Implementar compressão automática
# 3. Usar cache headers apropriados
# 4. Backup regular da pasta uploads/
# 5. Monitorar espaço em disco
# 6. Implementar limpeza de arquivos órfãos
```

## Backup

### Estratégia Recomendada

```bash
# Backup diário
0 0 * * * tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /caminho/para/uploads/

# Manter últimos 30 dias
find /backup -name "uploads-*.tar.gz" -mtime +30 -delete
```

## Troubleshooting

### Erro: "No file provided"
```
Solução: Certifique-se que o arquivo está no campo 'photo' da requisição
```

### Erro: "File too large"
```
Solução: Arquivo maior que MAX_FILE_SIZE
- Reduza tamanho da imagem
- Ou aumente MAX_FILE_SIZE no .env
```

### Erro: "Invalid file type"
```
Solução: Tipo de arquivo não suportado
- Use JPEG, PNG ou WebP
```

### Erro: "Unauthorized"
```
Solução: JWT inválido ou ausente
- Verifique token JWT
- Regenere se necessário
```

## Performance

### Otimizações Implementadas

- ✅ Uso de streams para download
- ✅ Buffer eficiente no upload
- ✅ Sincronização de arquivo no disco
- ✅ Cache de metadata no banco

### Melhorias Futuras

- [ ] Compressão de imagem automática
- [ ] Geração de thumbnails
- [ ] CDN integration
- [ ] Processamento assíncrono de imagens
- [ ] Cache headers otimizados

## Estatísticas

Informações sobre uso de armazenamento:

```bash
# Tamanho total
du -sh ./uploads/

# Número de fotos
find ./uploads -type f | wc -l

# Maior arquivo
find ./uploads -type f -exec ls -lh {} \; | sort -k5 -h | tail -1
```

## Referências

- [Multer Documentation](https://github.com/expressjs/multer)
- [MIME Types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)

---

**Última atualização**: 01/12/2025
