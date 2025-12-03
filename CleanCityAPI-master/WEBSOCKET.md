# Sincronização em Tempo Real com WebSocket

Este documento explica como usar o WebSocket da Clean City API para sincronização em tempo real.

## Visão Geral

A API usa Socket.IO para permitir comunicação bidirecional em tempo real entre o servidor e os clientes. Isso é essencial para:

- Notificações em tempo real
- Sincronização de dados
- Compartilhamento de ocorrências
- Atualizações de status

## Eventos Disponíveis

### Eventos do Cliente → Servidor

#### `user:login`
Notifica que um usuário fez login e deseja receber atualizações.

```typescript
socket.emit('user:login', {
  userId: 'user-id-123',
  token: 'jwt-token'
});
```

#### `occurrence:created`
Notifica que uma nova ocorrência foi criada.

```typescript
socket.emit('occurrence:created', {
  id: 'occ-123',
  title: 'Lixo encontrado',
  description: 'Entulho na rua',
  latitude: -23.5505,
  longitude: -46.6333,
  userId: 'user-id-123'
});
```

#### `occurrence:updated`
Notifica que uma ocorrência foi atualizada.

```typescript
socket.emit('occurrence:updated', {
  id: 'occ-123',
  title: 'Atualizado',
  description: 'Descrição nova',
  userId: 'user-id-123'
});
```

#### `occurrence:deleted`
Notifica que uma ocorrência foi deletada.

```typescript
socket.emit('occurrence:deleted', {
  id: 'occ-123',
  userId: 'user-id-123'
});
```

#### `photo:uploaded`
Notifica que uma foto foi enviada.

```typescript
socket.emit('photo:uploaded', {
  id: 'photo-123',
  occurrenceId: 'occ-123',
  userId: 'user-id-123',
  fileName: 'photo.jpg',
  fileSize: 2048576
});
```

#### `share:created`
Notifica que uma ocorrência foi compartilhada.

```typescript
socket.emit('share:created', {
  id: 'share-123',
  occurrenceId: 'occ-123',
  sharedById: 'user-1',
  sharedWithId: 'user-2',
  permission: 'VIEW'
});
```

### Eventos do Servidor → Cliente

#### `occurrence:new`
Uma nova ocorrência foi criada por outro usuário.

```typescript
socket.on('occurrence:new', (data) => {
  console.log('Nova ocorrência:', data);
  // Atualizar interface gráfica
});
```

#### `occurrence:changed`
Uma ocorrência foi atualizada.

```typescript
socket.on('occurrence:changed', (data) => {
  console.log('Ocorrência atualizada:', data);
  // Sincronizar dados locais
});
```

#### `occurrence:removed`
Uma ocorrência foi deletada.

```typescript
socket.on('occurrence:removed', (data) => {
  console.log('Ocorrência removida:', data);
  // Remover da interface gráfica
});
```

#### `photo:new`
Uma nova foto foi enviada para uma ocorrência que você tem acesso.

```typescript
socket.on('photo:new', (data) => {
  console.log('Nova foto:', data);
  // Atualizar galeria
});
```

#### `share:received`
Uma ocorrência foi compartilhada com você.

```typescript
socket.on('share:received', (data) => {
  console.log('Ocorrência compartilhada:', data);
  // Notificar usuário
});
```

## Exemplo de Implementação (React Native/Flutter)

### JavaScript/React

```javascript
import io from 'socket.io-client';

// Conectar ao servidor
const socket = io('http://localhost:3000', {
  auth: {
    token: 'seu-jwt-token'
  }
});

// Quando conectado
socket.on('connect', () => {
  console.log('Conectado ao servidor');
  
  // Notificar que fez login
  socket.emit('user:login', {
    userId: 'user-id-123'
  });
});

// Criar nova ocorrência
async function createOccurrence(data) {
  // Fazer requisição HTTP à API
  const response = await fetch('http://localhost:3000/api/occurrences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const occurrence = await response.json();
  
  // Emitir evento de criação
  socket.emit('occurrence:created', occurrence.data);
}

// Ouvir novas ocorrências
socket.on('occurrence:new', (data) => {
  console.log('Nova ocorrência:', data);
  // Atualizar lista de ocorrências
  setOccurrences([...occurrences, data]);
});

// Sincronizar ao receber atualização
socket.on('occurrence:changed', (data) => {
  console.log('Ocorrência atualizada:', data);
  // Atualizar ocorrência na lista
  setOccurrences(occurrences.map(occ => 
    occ.id === data.id ? data : occ
  ));
});

// Desconectar quando componente é desmontado
return () => {
  socket.disconnect();
};
```

### Flutter (Dart)

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class WebSocketService {
  late IO.Socket socket;
  
  void connect(String token) {
    socket = IO.io('http://localhost:3000', IO.SocketIoClientOption(
      'reconnection',
      true,
    )..auth = {'token': token});
    
    socket.onConnect((_) {
      print('Conectado ao servidor');
      socket.emit('user:login', {'userId': 'user-123'});
    });
    
    socket.on('occurrence:new', (data) {
      print('Nova ocorrência: $data');
      // Atualizar UI
    });
    
    socket.on('occurrence:changed', (data) {
      print('Ocorrência atualizada: $data');
      // Sincronizar dados
    });
  }
  
  void disconnect() {
    socket.disconnect();
  }
}
```

## Rooms e Namespaces

### Room de Usuário

Cada usuário é automaticamente adicionado a um "room":

```
user:user-id-123
```

Eventos enviados para este room chegam apenas para este usuário:

```javascript
socket.to(`user:${userId}`).emit('notification', data);
```

### Namespaces

Você pode organizar eventos em namespaces:

```javascript
// Servidor
const occurrenceNamespace = io.of('/occurrences');
occurrenceNamespace.on('connection', (socket) => {
  socket.on('update', (data) => {
    occurrenceNamespace.emit('updated', data);
  });
});

// Cliente
const occSocket = io('http://localhost:3000/occurrences');
occSocket.emit('update', { id: 123 });
occSocket.on('updated', (data) => {
  console.log('Atualizado:', data);
});
```

## Boas Práticas

### 1. Autenticação
```javascript
// ❌ Sem autenticação
const socket = io('http://localhost:3000');

// ✅ Com autenticação
const socket = io('http://localhost:3000', {
  auth: {
    token: jwtToken
  }
});
```

### 2. Tratamento de Desconexão
```javascript
socket.on('disconnect', () => {
  console.log('Desconectado');
  // Reconectar automaticamente
  setTimeout(() => {
    socket.connect();
  }, 5000);
});
```

### 3. Validação de Dados
```javascript
// ❌ Sem validação
socket.on('occurrence:created', (data) => {
  updateUI(data);
});

// ✅ Com validação
socket.on('occurrence:created', (data) => {
  if (validateOccurrence(data)) {
    updateUI(data);
  }
});
```

### 4. Gerenciar Listeners
```javascript
// ✅ Remover listeners antigos
socket.off('occurrence:new');

// ✅ One-time listeners
socket.once('occurrence:new', (data) => {
  console.log('Primeira ocorrência:', data);
});
```

## Performance

### Compressão de Dados
```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  compress: true
});
```

### Polling Fallback
```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});
```

### Throttling de Eventos
```javascript
let throttle = false;

socket.on('occurrence:changed', (data) => {
  if (!throttle) {
    updateUI(data);
    throttle = true;
    setTimeout(() => { throttle = false; }, 300);
  }
});
```

## Troubleshooting

### Conexão Recusada
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solução**: Verifique se o servidor está rodando em `npm run dev`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solução**: Verifique `CORS_ORIGIN` no `.env`

### Timeout
```
Error: connect_error
```
**Solução**: Aumente o timeout:
```javascript
const socket = io('http://localhost:3000', {
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ['websocket']
});
```

## Monitoramento

Para ver conexões ativas em desenvolvimento:

```javascript
// No servidor
io.on('connection', (socket) => {
  console.log(`Total de conexões: ${io.engine.clientsCount}`);
});
```

## Links Úteis

- [Socket.IO Docs](https://socket.io/docs/)
- [Socket.IO Cliente JavaScript](https://socket.io/docs/v4/client-api/)
- [Socket.IO Flutter](https://pub.dev/packages/socket_io_client)
- [Socket.IO React Native](https://github.com/socketio/socket.io-client-js)
