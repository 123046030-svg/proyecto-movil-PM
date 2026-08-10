import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import restauranteApi from '../src/api/restauranteApi';
import { useAuth } from '../src/context/AuthContext';
import { obtenerRutaPorRol } from '../src/utils/roles';
import { obtenerMensajeError } from '../src/utils/apiError';
import { notificar } from '../src/utils/notificaciones';


const ROLES_DISPONIBLES = [
  'Mesero',
  'Cocina',
  'Caja',
];


export default function RegistroScreen() {
  const [nombre, setNombre] =
    useState('');

  const [edad, setEdad] =
    useState('');

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState('');

  const [rol, setRol] =
    useState('Mesero');

  const [cargando, setCargando] =
    useState(false);

  const { login } = useAuth();

  const registrar = async () => {
    if (
      !nombre.trim() ||
      !edad.trim() ||
      !username.trim() ||
      !password.trim() ||
      !confirmarPassword.trim()
    ) {
      await notificar(
        'Campos obligatorios',
        'Completa todos los campos.'
      );

      return;
    }

    const edadNumero = Number(edad);

    if (
      !Number.isInteger(edadNumero) ||
      edadNumero <= 0 ||
      edadNumero > 100
    ) {
      await notificar(
        'Edad no válida',
        'Ingresa una edad válida entre 18 y 100 años.'
      );

      return;
    }

    if (edadNumero < 18) {
      await notificar(
        'Edad mínima requerida',
        (
          'Debes tener al menos 18 años para ' +
          'registrarte en CoffeReg.'
        )
      );

      return;
    }

    if (
      password !== confirmarPassword
    ) {
      await notificar(
        'Contraseñas diferentes',
        'Las contraseñas no coinciden.'
      );

      return;
    }

    try {
      setCargando(true);

      const respuesta =
        await restauranteApi.post(
          '/api/auth/registro',
          {
            nombre: nombre.trim(),
            edad: edadNumero,
            username: username.trim(),
            password: password.trim(),
            rol,
          }
        );

      const usuarioRegistrado =
        respuesta.data.usuario;

      await login(usuarioRegistrado);

      const rolesTexto =
        usuarioRegistrado.roles?.join(', ') ||
        rol;

      await notificar(
        'Usuario agregado',
        (
          `${usuarioRegistrado.nombre} fue ` +
          `registrado correctamente como ` +
          `${rolesTexto}.`
        )
      );

      router.replace(
        obtenerRutaPorRol(
          usuarioRegistrado.roles
        )
      );

    } catch (error) {
      console.log(
        'Error de registro:',
        error?.response?.data ||
        error?.message ||
        error
      );

      const mensaje =
        obtenerMensajeError(
          error,
          'No se pudo crear la cuenta.'
        );

      await notificar(
        'Error de registro',
        mensaje
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>
            Crear cuenta
          </Text>

          <Text style={styles.descripcion}>
            Registra al personal de CoffeReg
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.label}>
            Nombre completo
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ejemplo: Sebastián Pérez"
            placeholderTextColor="#bd8ea0"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>
            Edad
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ejemplo: 25"
            placeholderTextColor="#bd8ea0"
            value={edad}
            onChangeText={(valor) =>
              setEdad(
                valor
                  .replace(/\D/g, '')
                  .slice(0, 3)
              )
            }
            keyboardType="number-pad"
            maxLength={3}
          />

          <Text style={styles.ayudaEdad}>
            Debes tener entre 18 y 100 años.
          </Text>

          <Text style={styles.label}>
            Nombre de usuario
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ejemplo: sebastian"
            placeholderTextColor="#bd8ea0"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Contraseña
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Mínimo 4 caracteres"
            placeholderTextColor="#bd8ea0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>
            Confirmar contraseña
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Repite la contraseña"
            placeholderTextColor="#bd8ea0"
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
            secureTextEntry
          />

          <Text style={styles.label}>
            Área de trabajo
          </Text>

          <View style={styles.roles}>
            {ROLES_DISPONIBLES.map(
              (rolDisponible) => {
                const seleccionado =
                  rol === rolDisponible;

                return (
                  <Pressable
                    key={rolDisponible}
                    style={[
                      styles.rol,
                      seleccionado &&
                        styles.rolSeleccionado,
                    ]}
                    onPress={() =>
                      setRol(rolDisponible)
                    }
                  >
                    <Text
                      style={[
                        styles.rolTexto,
                        seleccionado &&
                          styles.rolTextoSeleccionado,
                      ]}
                    >
                      {rolDisponible}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>
              El rol Administrador está reservado
              para la propietaria del sistema.
            </Text>
          </View>

          <Pressable
            style={[
              styles.botonRegistrar,
              cargando &&
                styles.botonDeshabilitado,
            ]}
            onPress={registrar}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.textoBoton}>
                Registrar y entrar
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.botonRegresar}
            onPress={() => router.back()}
          >
            <Text style={styles.textoRegresar}>
              Ya tengo una cuenta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff1f6',
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    paddingVertical: 35,
    backgroundColor: '#fff1f6',
  },

  encabezado: {
    alignItems: 'center',
    marginBottom: 20,
  },

  titulo: {
    color: '#8f3658',
    fontSize: 31,
    fontWeight: 'bold',
  },

  descripcion: {
    color: '#a45573',
    marginTop: 5,
  },

  formulario: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: '#fffafb',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  label: {
    color: '#8f3658',
    fontWeight: 'bold',
    marginBottom: 7,
  },

  input: {
    color: '#603342',
    backgroundColor: '#fff5f8',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8b9ca',
    marginBottom: 15,
  },

  ayudaEdad: {
    color: '#a45573',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 15,
  },

  roles: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 15,
  },

  rol: {
    flex: 1,
    backgroundColor: '#fff5f8',
    paddingVertical: 13,
    marginHorizontal: 4,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e8b9ca',
  },

  rolSeleccionado: {
    backgroundColor: '#d75f8a',
    borderColor: '#d75f8a',
  },

  rolTexto: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  rolTextoSeleccionado: {
    color: '#ffffff',
  },

  aviso: {
    backgroundColor: '#fde8f0',
    padding: 12,
    borderRadius: 13,
    marginBottom: 15,
  },

  avisoTexto: {
    color: '#9a4e6a',
    textAlign: 'center',
    fontSize: 12,
  },

  botonRegistrar: {
    backgroundColor: '#d75f8a',
    padding: 15,
    borderRadius: 15,
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  botonRegresar: {
    padding: 14,
    marginTop: 5,
  },

  textoRegresar: {
    color: '#a45573',
    textAlign: 'center',
    fontWeight: '600',
  },
});