import { useEffect, useState } from 'react';
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

const ROLES_PROTEGIDOS = [
  'administrador',
  'mesero',
  'cocina',
  'caja',
];

export default function RolesScreen() {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState(null);

  const cargarRoles = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(
        '/api/web/roles'
      );

      setRoles(respuesta.data);
    } catch (error) {
      console.log(
        'Error al cargar roles:',
        error?.response?.data || error?.message
      );

      const mensaje = obtenerMensajeError(
        error,
        'No se pudieron cargar los roles.'
      );

      await notificar('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const esRolProtegido = (rol) => {
    const nombre = String(
      rol?.nombre || ''
    )
      .trim()
      .toLowerCase();

    return ROLES_PROTEGIDOS.includes(nombre);
  };

  const eliminarRol = async (rol) => {
    try {
      setEliminandoId(rol.id);

      const respuesta = await restauranteApi.delete(
        `/api/web/roles/${rol.id}`
      );

      setRoles((rolesActuales) =>
        rolesActuales.filter(
          (item) => item.id !== rol.id
        )
      );

      await notificar(
        'Rol eliminado',
        respuesta.data?.mensaje ||
          `El rol ${rol.nombre} fue eliminado correctamente.`
      );
    } catch (error) {
      console.log(
        'Error al eliminar rol:',
        error?.response?.data || error?.message
      );

      const mensaje = obtenerMensajeError(
        error,
        'No se pudo eliminar el rol.'
      );

      await notificar('Error', mensaje);
    } finally {
      setEliminandoId(null);
    }
  };

  const confirmarEliminacion = async (rol) => {
    if (esRolProtegido(rol)) {
      await notificar(
        'Rol protegido',
        (
          'Los roles Administrador, Mesero, Cocina y Caja ' +
          'son necesarios para el sistema y no pueden eliminarse.'
        )
      );

      return;
    }

    const confirmado = await confirmarAccion(
      'Eliminar rol',
      `¿Deseas eliminar permanentemente el rol ${rol.nombre}?`,
      'Eliminar'
    );

    if (!confirmado) {
      return;
    }

    await eliminarRol(rol);
  };

  const renderRol = ({ item, index }) => {
    const protegido = esRolProtegido(item);
    const eliminando = eliminandoId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.fila}>
          <View style={styles.numeroContainer}>
            <Text style={styles.numeroTexto}>
              {item.id || index + 1}
            </Text>
          </View>

          <View style={styles.informacion}>
            <Text style={styles.nombre}>
              {item.nombre}
            </Text>

            <Text style={styles.descripcion}>
              {item.descripcion || 'Sin descripción'}
            </Text>
          </View>
        </View>

        {protegido ? (
          <View style={styles.protegidoContainer}>
            <Text style={styles.protegidoTexto}>
              Rol principal del sistema
            </Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.botonEliminar,
              pressed && styles.botonPresionado,
              eliminando && styles.botonDeshabilitado,
            ]}
            onPress={() => confirmarEliminacion(item)}
            disabled={eliminando}
          >
            {eliminando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.textoBoton}>
                Eliminar rol
              </Text>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#d75f8a"
          />

          <Text style={styles.textoCarga}>
            Cargando roles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.encabezado}>
          <View style={styles.iconoContainer}>
            <Text style={styles.icono}>
              R
            </Text>
          </View>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.titulo}>
              Roles
            </Text>

            <Text style={styles.subtitulo}>
              Permisos disponibles en CoffeReg
            </Text>
          </View>
        </View>

        <FlatList
          data={roles}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderRol}
          refreshing={cargando}
          onRefresh={cargarRoles}
          contentContainerStyle={[
            styles.lista,
            roles.length === 0 && styles.listaVacia,
          ]}
          ListEmptyComponent={
            <View style={styles.cardVacia}>
              <Text style={styles.textoVacio}>
                No hay roles registrados.
              </Text>
            </View>
          }
        />

        <Pressable
          style={({ pressed }) => [
            styles.botonActualizar,
            pressed && styles.botonPresionado,
          ]}
          onPress={cargarRoles}
        >
          <Text style={styles.textoBoton}>
            Actualizar roles
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonRegresar,
            pressed && styles.botonPresionado,
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
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 20,
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
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 18,
  },

  iconoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
  },

  icono: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: 'bold',
  },

  encabezadoTexto: {
    flex: 1,
    marginLeft: 17,
  },

  titulo: {
    color: '#8f3658',
    fontSize: 29,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#a45573',
    marginTop: 5,
  },

  lista: {
    paddingBottom: 10,
  },

  listaVacia: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#fffafb',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 14,
  },

  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  numeroContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },

  numeroTexto: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
  },

  informacion: {
    flex: 1,
    marginLeft: 17,
  },

  nombre: {
    color: '#8f3658',
    fontSize: 20,
    fontWeight: 'bold',
  },

  descripcion: {
    color: '#9d6b7e',
    marginTop: 6,
    fontSize: 15,
  },

  protegidoContainer: {
    backgroundColor: '#fde8f0',
    padding: 11,
    borderRadius: 13,
    marginTop: 14,
  },

  protegidoTexto: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  botonEliminar: {
    backgroundColor: '#b84f74',
    padding: 13,
    borderRadius: 14,
    marginTop: 14,
  },

  botonActualizar: {
    backgroundColor: '#d75f8a',
    padding: 15,
    borderRadius: 16,
    marginTop: 5,
  },

  botonRegresar: {
    backgroundColor: '#8f3658',
    padding: 15,
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

  textoCarga: {
    color: '#8f3658',
    marginTop: 10,
    fontWeight: 'bold',
  },

  cardVacia: {
    backgroundColor: '#fffafb',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  textoVacio: {
    color: '#8f3658',
    textAlign: 'center',
  },
});