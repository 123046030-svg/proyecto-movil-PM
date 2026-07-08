import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

type Usuario = {
  id: number;
  nombre: string;
  username: string;
  roles: string[];
};

type AuthContextType = {
  usuario: Usuario | null;
  login: (usuario: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  cargando: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarUsuarioGuardado();
  }, []);

  const cargarUsuarioGuardado = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem('usuario');

      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.log('Error al cargar usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const login = async (usuarioData: Usuario) => {
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
    setUsuario(usuarioData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return contexto;
}