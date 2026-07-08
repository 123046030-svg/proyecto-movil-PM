import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import restauranteApi from '../src/api/restauranteApi';
import { useAuth } from '../src/context/AuthContext';
import { obtenerRutaPorRol } from '../src/utils/roles';
import { obtenerMensajeError } from '../src/utils/apiError';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();

  const redirigirPorRol = (roles: string[]) => {
    const ruta = obtenerRutaPorRol(roles);

    if (ruta === '/login') {
      Alert.alert('Sin acceso', 'El usuario no tiene un rol válido.');
      return;
    }

    router.replace(ruta);
  };

  const iniciarSesion = async () => {
    if (!usuario.trim() || !password.trim()) {
      Alert.alert('Campos obligatorios', 'Ingresa usuario y contraseña.');
      return;
    }

    try {
      setCargando(true);

      const respuesta = await restauranteApi.post('/api/auth/login', {
        username: usuario.trim(),
        password: password.trim(),
      });

      const usuarioLogin = respuesta.data.usuario;

      await login(usuarioLogin);

      Alert.alert('Bienvenido', `Hola, ${usuarioLogin.nombre}`);

      redirigirPorRol(usuarioLogin.roles);
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje = obtenerMensajeError(
        error,
        'No se pudo iniciar sesión. Revisa tus datos o la conexión con el API.'
      );

      Alert.alert('Error de login', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const probarConexionApi = async () => {
    try {
      const respuesta = await restauranteApi.get('/');

      Alert.alert(
        'Conexión exitosa',
        respuesta.data.mensaje || 'El API respondió correctamente'
      );
    } catch (error: any) {
      const mensaje = obtenerMensajeError(
        error,
        'No se pudo conectar con el API. Revisa la IP, el backend y la red WiFi.'
      );

      Alert.alert('Error de conexión', mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Restaurante Móvil</Text>
      <Text style={styles.subtitulo}>Inicio de sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.botonPrincipal}
        onPress={iniciarSesion}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Iniciar sesión</Text>
        )}
      </Pressable>

      <Pressable style={styles.botonSecundario} onPress={probarConexionApi}>
        <Text style={styles.textoBoton}>Probar conexión con API</Text>
      </Pressable>

      <View style={styles.usuariosPrueba}>
        <Text style={styles.textoAyuda}>Usuarios de prueba:</Text>
        <Text>Meseero / 12345</Text>
        <Text>cocina / 123456</Text>
        <Text>caja / 123456</Text>
        <Text>admin / 123456</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonPrincipal: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  botonSecundario: {
    backgroundColor: '#0f766e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  usuariosPrueba: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  textoAyuda: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});