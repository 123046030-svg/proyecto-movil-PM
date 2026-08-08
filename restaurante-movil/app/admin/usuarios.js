import {
  useEffect,
  useState,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import restauranteApi from '../../src/api/restauranteApi';
import { obtenerMensajeError } from '../../src/utils/apiError';
import {
  notificar,
  confirmarAccion,
} from '../../src/utils/notificaciones';


export default function UsuariosScreen() {
  const [usuarios, setUsuarios] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [
    eliminandoId,
    setEliminandoId,
  ] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);

      const respuesta =
        await restauranteApi.get(
          '/api/web/usuarios'
        );

      setUsuarios(respuesta.data);

    } catch (error) {
      console.log(
        'Error al cargar usuarios:',
        error?.response?.data ||
        error?.message
      );

      const mensaje =
        obtenerMensajeError(
          error,
          'No se pudieron cargar los usuarios.'
        );

      await notificar(
        'Error',
        mensaje
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const esAdministrador = (usuario) => {
    const username = String(
      usuario?.username || ''
    )
      .trim()
      .toLowerCase();

    const roles = Array.isArray(
      usuario?.roles
    )
      ? usuario.roles
      : [];

    const tieneRolAdministrador =
      roles.some(
        (rol) =>
          String(rol)
            .trim()
            .toLowerCase() ===
          'administrador'
      );

    return (
      username === 'admin' ||
      tieneRolAdministrador
    );
  };

  const eliminarUsuario = async (
    usuario
  ) => {
    try {
      setEliminandoId(usuario.id);

      const respuesta =
        await restauranteApi.delete(
          `/api/web/usuarios/${usuario.id}`
        );

      setUsuarios(
        (usuariosActuales) =>
          usuariosActuales.filter(
            (item) =>
              item.id !== usuario.id
          )
      );

      await notificar(
        'Usuario eliminado',
        respuesta.data?.mensaje ||
          (
            `${usuario.nombre} fue eliminado ` +
            'correctamente.'
          )
      );

    } 
    catch (error) {
    console.log(
    'Error al eliminar usuario:',
    error?.response?.status,
    error?.response?.data ||
      error?.message ||
      error
  );

  const mensaje =
    error?.response?.data?.detail ||
    error?.response?.data?.mensaje ||
    error?.message ||
    'No se pudo eliminar el usuario.';

  await notificar(
    'Error al eliminar usuario',
    mensaje
  );
} finally {
  setEliminandoId(null);
}
  };

  const confirmarEliminacion = async (
    usuario
  ) => {
    if (esAdministrador(usuario)) {
      await notificar(
        'Cuenta protegida',
        (
          'La cuenta del administrador ' +
          'no puede eliminarse.'
        )
      );

      return;
    }

    const confirmado =
      await confirmarAccion(
        'Eliminar usuario',
        (
          `¿Deseas eliminar permanentemente ` +
          `a ${usuario.nombre}?`
        ),
        'Eliminar'
      );

    if (!confirmado) {
      return;
    }

    await eliminarUsuario(usuario);
  };

  const renderUsuario = ({ item }) => {
    const protegido =
      esAdministrador(item);

    const eliminando =
      eliminandoId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.filaPrincipal}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {item.nombre
                ? item.nombre
                    .charAt(0)
                    .toUpperCase()
                : 'U'}
            </Text>
          </View>

          <View
            style={styles.informacionUsuario}
          >
            <Text style={styles.nombre}>
              {item.nombre}
            </Text>

            <Text style={styles.dato}>
              Usuario: {item.username}
            </Text>

            <View
              style={styles.estadoContainer}
            >
              <View
                style={[
                  styles.estadoPunto,
                  item.activo
                    ? styles.estadoActivo
                    : styles.estadoInactivo,
                ]}
              />

              <Text style={styles.dato}>
                {item.activo
                  ? 'Usuario activo'
                  : 'Usuario inactivo'}
              </Text>
            </View>

            <Text style={styles.roles}>
              Rol:{' '}
              {item.roles?.length > 0
                ? item.roles.join(', ')
                : 'Sin rol'}
            </Text>
          </View>
        </View>

        {protegido ? (
          <View
            style={styles.protegidoContainer}
          >
            <Text
              style={styles.protegidoTexto}
            >
              Cuenta de administrador protegida
            </Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.botonEliminar,
              pressed &&
                styles.botonPresionado,
              eliminando &&
                styles.botonDeshabilitado,
            ]}
            onPress={() =>
              confirmarEliminacion(item)
            }
            disabled={eliminando}
          >
            {eliminando ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.textoBoton}>
                Eliminar usuario
              </Text>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#d75f8a"
          />

          <Text style={styles.textoCarga}>
            Cargando usuarios...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.encabezado}>
          <View
            style={styles.iconoContainer}
          >
            <Text style={styles.icono}>
              U
            </Text>
          </View>

          <View
            style={styles.encabezadoTexto}
          >
            <Text style={styles.titulo}>
              Usuarios
            </Text>

            <Text style={styles.descripcion}>
              Personal registrado en el sistema
            </Text>
          </View>
        </View>

        <FlatList
          data={usuarios}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderUsuario}
          refreshing={cargando}
          onRefresh={cargarUsuarios}
          contentContainerStyle={[
            styles.lista,
            usuarios.length === 0 &&
              styles.listaVacia,
          ]}
          ListEmptyComponent={
            <View style={styles.cardVacio}>
              <Text style={styles.textoVacio}>
                No hay usuarios registrados.
              </Text>
            </View>
          }
        />

        <Pressable
          style={({ pressed }) => [
            styles.botonActualizar,
            pressed &&
              styles.botonPresionado,
          ]}
          onPress={cargarUsuarios}
        >
          <Text style={styles.textoBoton}>
            Actualizar usuarios
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonRegresar,
            pressed &&
              styles.botonPresionado,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBoton}>
            Regresar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff1f6',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 22,
    backgroundColor: '#fff1f6',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f6',
  },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fde8f0',
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 18,
  },

  iconoContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
  },

  icono: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: 'bold',
  },

  encabezadoTexto: {
    flex: 1,
    marginLeft: 14,
  },

  titulo: {
    color: '#8f3658',
    fontSize: 27,
    fontWeight: 'bold',
  },

  descripcion: {
    color: '#9d6b7e',
    fontSize: 13,
    marginTop: 3,
  },

  lista: {
    paddingBottom: 10,
  },

  listaVacia: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#fffafb',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  filaPrincipal: {
    flexDirection: 'row',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },

  avatarTexto: {
    color: '#8f3658',
    fontSize: 21,
    fontWeight: 'bold',
  },

  informacionUsuario: {
    flex: 1,
    marginLeft: 14,
  },

  nombre: {
    color: '#8f3658',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  dato: {
    color: '#7f5968',
    marginTop: 2,
  },

  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  estadoPunto: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  estadoActivo: {
    backgroundColor: '#d75f8a',
  },

  estadoInactivo: {
    backgroundColor: '#9f8a92',
  },

  roles: {
    color: '#a45573',
    marginTop: 5,
    fontWeight: '600',
  },

  botonEliminar: {
    backgroundColor: '#b84f74',
    padding: 12,
    borderRadius: 13,
    marginTop: 14,
  },

  protegidoContainer: {
    backgroundColor: '#fde8f0',
    padding: 11,
    borderRadius: 13,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  protegidoTexto: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },

  botonActualizar: {
    backgroundColor: '#d75f8a',
    padding: 14,
    borderRadius: 16,
    marginTop: 5,
  },

  botonRegresar: {
    backgroundColor: '#8f3658',
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
  },

  botonPresionado: {
    opacity: 0.8,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  cardVacio: {
    backgroundColor: '#fffafb',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  textoVacio: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textoCarga: {
    color: '#8f3658',
    marginTop: 10,
    fontWeight: '600',
  },
});