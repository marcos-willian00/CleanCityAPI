# Integrando o App com a API

Este documento explica como conectar seu aplicativo mobile (React Native, Flutter, etc) com a Clean City API.

## Configuração Inicial

### 1. URL Base da API

```typescript
// React Native / Flutter
const API_BASE_URL = 'http://seu-servidor.com:3000/api';
// Em desenvolvimento: http://localhost:3000/api
```

### 2. Armazenar JWT Localmente

#### React Native
```typescript
import * as SecureStore from 'expo-secure-store';

// Armazenar
await SecureStore.setItemAsync('auth_token', token);

// Recuperar
const token = await SecureStore.getItemAsync('auth_token');

// Remover
await SecureStore.deleteItemAsync('auth_token');
```

#### Flutter
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Armazenar
await storage.write(key: 'auth_token', value: token);

// Recuperar
final token = await storage.read(key: 'auth_token');

// Remover
await storage.delete(key: 'auth_token');
```

## Serviço de Autenticação

### React Native

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const authService = {
  async signup(fullName: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/signup', {
        fullName,
        email,
        password,
      });
      
      const { token, user } = response.data.data;
      
      // Armazenar token
      await SecureStore.setItemAsync('auth_token', token);
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data.data;
      
      // Armazenar token
      await SecureStore.setItemAsync('auth_token', token);
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async getProfile(token: string) {
    try {
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get profile');
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync('auth_token');
  },
};
```

### Flutter

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api'));
  final storage = FlutterSecureStorage();

  Future<Map<String, dynamic>> signup({
    required String fullName,
    required String email,
    required String password,
  }) async {
    try {
      final response = await dio.post(
        '/auth/signup',
        data: {
          'fullName': fullName,
          'email': email,
          'password': password,
        },
      );

      final token = response.data['data']['token'];
      final user = response.data['data']['user'];

      await storage.write(key: 'auth_token', value: token);

      return {'token': token, 'user': user};
    } catch (e) {
      throw Exception('Signup failed: $e');
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      final token = response.data['data']['token'];
      final user = response.data['data']['user'];

      await storage.write(key: 'auth_token', value: token);

      return {'token': token, 'user': user};
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  Future<void> logout() async {
    await storage.delete(key: 'auth_token');
  }
}
```

## Serviço de Ocorrências

### React Native

```typescript
export const occurrenceService = {
  async createOccurrence(
    token: string,
    data: {
      title: string;
      description: string;
      latitude: number;
      longitude: number;
      address?: string;
      accelerometerX?: number;
      accelerometerY?: number;
      accelerometerZ?: number;
      temperature?: number;
      humidity?: number;
      pressure?: number;
    }
  ) {
    try {
      const response = await api.post('/occurrences', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create occurrence');
    }
  },

  async getOccurrences(page = 1, limit = 10) {
    try {
      const response = await api.get(`/occurrences?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch occurrences');
    }
  },

  async getMyOccurrences(token: string, page = 1, limit = 10) {
    try {
      const response = await api.get(
        `/occurrences/my-occurrences?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch occurrences');
    }
  },

  async getOccurrencesByBounds(minLat: number, maxLat: number, minLon: number, maxLon: number) {
    try {
      const response = await api.get(
        `/occurrences/bounds?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch occurrences');
    }
  },

  async deleteOccurrence(token: string, occurrenceId: string) {
    try {
      await api.delete(`/occurrences/${occurrenceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete occurrence');
    }
  },

  async getStats() {
    try {
      const response = await api.get('/occurrences/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get stats');
    }
  },
};
```

## Upload de Fotos

### React Native

```typescript
import * as ImagePicker from 'expo-image-picker';

export const photoService = {
  async uploadPhoto(token: string, occurrenceId: string, photoUri: string) {
    try {
      const formData = new FormData();

      // Criar blob da imagem
      const response = await fetch(photoUri);
      const blob = await response.blob();

      formData.append('photo', blob, 'photo.jpg');

      const uploadResponse = await fetch(
        `http://localhost:3000/api/photos/${occurrenceId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await uploadResponse.json();
      return result.data;
    } catch (error) {
      throw new Error(`Failed to upload photo: ${error}`);
    }
  },

  async pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled) {
        return result.uri;
      }
    } catch (error) {
      throw new Error(`Failed to pick image: ${error}`);
    }
  },

  async takePhoto() {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled) {
        return result.uri;
      }
    } catch (error) {
      throw new Error(`Failed to take photo: ${error}`);
    }
  },
};
```

## Dados Ambientais

### React Native (com Expo)

```typescript
import { Accelerometer } from 'expo-sensors';

export const sensorService = {
  async getAccelerometerData(): Promise<{
    x: number;
    y: number;
    z: number;
  }> {
    return new Promise((resolve) => {
      const subscription = Accelerometer.addListener((data) => {
        subscription.remove();
        resolve(data);
      });
    });
  },

  async getTemperatureAndHumidity() {
    // Integrar com API de clima ou sensor
    // Exemplo com OpenWeatherMap
    const response = await fetch(
      'https://api.openweathermap.org/data/2.5/weather?lat=X&lon=Y&appid=YOUR_KEY'
    );
    const data = await response.json();
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
    };
  },
};
```

## Sincronização em Tempo Real

### React Native

```typescript
import { io } from 'socket.io-client';

export const socketService = {
  socket: null as any,

  connect(token: string, userId: string) {
    this.socket = io('http://localhost:3000', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('user:login', { userId });
    });

    this.socket.on('occurrence:new', (data) => {
      console.log('New occurrence:', data);
      // Atualizar lista de ocorrências
    });

    this.socket.on('occurrence:changed', (data) => {
      console.log('Occurrence updated:', data);
      // Sincronizar dados
    });

    this.socket.on('photo:new', (data) => {
      console.log('New photo:', data);
      // Atualizar galeria
    });
  },

  emitOccurrenceCreated(occurrence: any) {
    this.socket?.emit('occurrence:created', occurrence);
  },

  emitPhotoUploaded(photo: any) {
    this.socket?.emit('photo:uploaded', photo);
  },

  disconnect() {
    this.socket?.disconnect();
  },
};
```

## Contexto de Autenticação (React/React Native)

```typescript
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recuperar token ao iniciar
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      if (savedToken) {
        const profile = await authService.getProfile(savedToken);
        setToken(savedToken);
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to restore token', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login(email, password);
    setToken(token);
    setUser(user);
  };

  const signup = async (fullName: string, email: string, password: string) => {
    const { token, user } = await authService.signup(fullName, email, password);
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

## Hook de Autenticação

```typescript
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Uso em Componentes

### React Native com Expo

```typescript
import { useAuth } from './hooks/useAuth';
import { occurrenceService } from './services/occurrenceService';
import { photoService } from './services/photoService';

export default function CreateOccurrenceScreen() {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateOccurrence = async () => {
    if (!token) return;

    try {
      const occurrence = await occurrenceService.createOccurrence(token, {
        title,
        description,
        latitude: -23.5505,
        longitude: -46.6333,
      });

      // Upload de foto
      const photoUri = await photoService.pickImage();
      if (photoUri) {
        await photoService.uploadPhoto(token, occurrence.id, photoUri);
      }

      // Sucesso
      Alert.alert('Sucesso', 'Ocorrência criada!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    // JSX aqui
  );
}
```

## Tratamento de Erros

```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expirou - fazer logout
    return 'Session expired. Please login again.';
  }
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An error occurred';
};
```

## Checklist de Integração

- [ ] Variáveis de ambiente da API configuradas
- [ ] Serviço de autenticação implementado
- [ ] Token JWT armazenado localmente
- [ ] Contexto de autenticação criado
- [ ] Serviço de ocorrências implementado
- [ ] Upload de fotos configurado
- [ ] Sensores (acelerômetro, etc) integrados
- [ ] WebSocket configurado
- [ ] Tratamento de erros implementado
- [ ] Testado em device real ou emulador
