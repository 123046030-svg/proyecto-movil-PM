import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

import restauranteApi from '../src/api/restauranteApi';
import { useAuth } from '../src/context/AuthContext';
import {
  obtenerRutaPorRol,
  obtenerRolPrincipal,
} from '../src/utils/roles';
import { obtenerMensajeError } from '../src/utils/apiError';
import { notificar } from '../src/utils/notificaciones';


function obtenerMensajeBienvenida(
  usuarioLogin
) {
  const rol = obtenerRolPrincipal(
    usuarioLogin.roles
  );

  if (rol === 'Administrador') {
    return (
      `Hola, ${usuarioLogin.nombre}. ` +
      'Ingresaste al módulo de Administración.'
    );
  }

  if (rol === 'Mesero') {
    return (
      `Hola, ${usuarioLogin.nombre}. ` +
      'Ingresaste como Mesero.'
    );
  }

  if (rol === 'Cocina') {
    return (
      `Hola, ${usuarioLogin.nombre}. ` +
      'Ingresaste como Cocinero.'
    );
  }

  if (rol === 'Caja') {
    return (
      `Hola, ${usuarioLogin.nombre}. ` +
      'Ingresaste al módulo de Caja.'
    );
  }

  return (
    `Bienvenido, ${usuarioLogin.nombre}.`
  );
}


export default function LoginScreen() {
  const [usuario, setUsuario] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [cargando, setCargando] =
    useState(false);

  const { login } = useAuth();

  const iniciarSesion = async () => {
    if (
      !usuario.trim() ||
      !password.trim()
    ) {
      await notificar(
        'Campos obligatorios',
        'Ingresa usuario y contraseña.'
      );

      return;
    }

    try {
      setCargando(true);

      const respuesta =
        await restauranteApi.post(
          '/api/auth/login',
          {
            username: usuario.trim(),
            password: password.trim(),
          }
        );

      const usuarioLogin =
        respuesta.data.usuario;

      const ruta = obtenerRutaPorRol(
        usuarioLogin.roles
      );

      if (ruta === '/login') {
        await notificar(
          'Sin acceso',
          'El usuario no tiene un rol válido.'
        );

        return;
      }

      await login(usuarioLogin);

      await notificar(
        'Bienvenido a CoffeReg',
        obtenerMensajeBienvenida(
          usuarioLogin
        )
      );

      router.replace(ruta);

    } catch (error) {
      console.log(
        'Error de login:',
        error?.response?.data ||
        error?.message ||
        error
      );

      const mensaje =
        obtenerMensajeError(
          error,
          'No se pudo iniciar sesión.'
        );

      await notificar(
        'Error de inicio de sesión',
        mensaje
      );

    } finally {
      setCargando(false);
    }
  };

  const probarConexionApi = async () => {
    try {
      const respuesta =
        await restauranteApi.get('/');

      await notificar(
        'Conexión exitosa',
        respuesta.data.mensaje ||
          'La API respondió correctamente.'
      );

    } catch (error) {
      const mensaje =
        obtenerMensajeError(
          error,
          'No se pudo conectar con la API.'
        );

      await notificar(
        'Error de conexión',
        mensaje
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={styles.decoracionSuperior}
        />

        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>
            CoffeReg
          </Text>

          <View style={styles.marcoImagen}>
            <Image
              source={require(
                '../assets/images/coffereg.jpeg'
              )}
              style={styles.imagen}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.descripcion}>
            Restaurante & Cafetería Coqueta
          </Text>

          <Text style={styles.subtitulo}>
            Inicio de sesión
          </Text>

          <Text style={styles.label}>
            Usuario
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#bd8ea0"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Contraseña
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#bd8ea0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [
              styles.botonPrincipal,
              pressed &&
                styles.botonPresionado,
              cargando &&
                styles.botonDeshabilitado,
            ]}
            onPress={iniciarSesion}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.textoBoton}>
                Iniciar sesión
              </Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.botonRegistro,
              pressed &&
                styles.botonPresionado,
            ]}
            onPress={() =>
              router.push('/registro')
            }
          >
            <Text
              style={styles.textoBotonRegistro}
            >
              Crear una cuenta
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.botonConexion,
              pressed &&
                styles.botonPresionado,
            ]}
            onPress={probarConexionApi}
          >
            <Text
              style={styles.textoBotonConexion}
            >
              Probar conexión con API
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#fff1f6',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 35,
  },

  decoracionSuperior: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#f8cddd',
  },

  tarjeta: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#fffafb',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#efc3d3',
    shadowColor: '#9d4164',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 7,
  },

  titulo: {
    color: '#8f3658',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  marcoImagen: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    padding: 6,
    backgroundColor: '#f7c8d8',
    borderWidth: 3,
    borderColor: '#e798b5',
  },

  imagen: {
    width: '100%',
    height: '100%',
    borderRadius: 69,
  },

  descripcion: {
    color: '#a45573',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },

  subtitulo: {
    color: '#8f3658',
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },

  label: {
    color: '#91425f',
    fontWeight: 'bold',
    marginBottom: 7,
  },

  input: {
    color: '#603342',
    backgroundColor: '#fff5f8',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e8b9ca',
  },

  botonPrincipal: {
    backgroundColor: '#d75f8a',
    padding: 15,
    borderRadius: 14,
    marginTop: 4,
  },

  botonRegistro: {
    backgroundColor: '#fde8f0',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8b9ca',
    marginTop: 11,
  },

  botonConexion: {
    padding: 13,
    marginTop: 5,
  },

  botonPresionado: {
    opacity: 0.8,
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textoBotonRegistro: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textoBotonConexion: {
    color: '#a45573',
    textAlign: 'center',
    fontWeight: '600',
  },
});