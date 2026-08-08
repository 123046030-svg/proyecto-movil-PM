import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function MeseroScreen() {
  const { usuario, logout } = useAuth();

  const cerrarSesion = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.decoracionSuperior} />

        <View style={styles.encabezado}>
          <View style={styles.iconoContainer}>
            <Text style={styles.icono}>M</Text>
          </View>

          <Text style={styles.titulo}>Mesero</Text>

          <Text style={styles.descripcion}>
            Atención de mesas y pedidos
          </Text>

          <View style={styles.usuarioCard}>
            <Text style={styles.usuarioLabel}> Mesero
            </Text>
            <Text style={styles.usuarioNombre}>
              {usuario?.nombre || 'Personal de Mesero'}
              </Text>
          </View>
        </View>

        <View style={styles.menu}>
          <Pressable
            style={({ pressed }) => [
              styles.opcion,
              pressed && styles.opcionPresionada,
            ]}
            onPress={() => router.push('/mesero/mesas')}
          >
            <View style={styles.numeroOpcion}>
              <Text style={styles.numeroTexto}>1</Text>
            </View>

            <View style={styles.informacionOpcion}>
              <Text style={styles.tituloOpcion}>Mesas</Text>
              <Text style={styles.descripcionOpcion}>
                Consultar mesas y disponibilidad
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.opcion,
              pressed && styles.opcionPresionada,
            ]}
            onPress={() => router.push('/mesero/productos')}
          >
            <View style={styles.numeroOpcion}>
              <Text style={styles.numeroTexto}>2</Text>
            </View>

            <View style={styles.informacionOpcion}>
              <Text style={styles.tituloOpcion}>Productos</Text>
              <Text style={styles.descripcionOpcion}>
                Consultar el menú disponible
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.opcion,
              pressed && styles.opcionPresionada,
            ]}
            onPress={() => router.push('/mesero/crear-pedido')}
          >
            <View style={styles.numeroOpcion}>
              <Text style={styles.numeroTexto}>3</Text>
            </View>

            <View style={styles.informacionOpcion}>
              <Text style={styles.tituloOpcion}>Crear pedido</Text>
              <Text style={styles.descripcionOpcion}>
                Registrar una nueva comanda
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.opcion,
              pressed && styles.opcionPresionada,
            ]}
            onPress={() => router.push('/mesero/estado-pedido')}
          >
            <View style={styles.numeroOpcion}>
              <Text style={styles.numeroTexto}>4</Text>
            </View>

            <View style={styles.informacionOpcion}>
              <Text style={styles.tituloOpcion}>Estado del pedido</Text>
              <Text style={styles.descripcionOpcion}>
                Consultar el progreso de una comanda
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botonSalir,
            pressed && styles.botonPresionado,
          ]}
          onPress={cerrarSesion}
        >
          <Text style={styles.textoBotonSalir}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.pie}>CoffeReg · Módulo Mesero</Text>
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
    paddingHorizontal: 22,
    paddingTop: 45,
    paddingBottom: 35,
    backgroundColor: '#fff1f6',
  },
  decoracionSuperior: {
    position: 'absolute',
    top: -95,
    right: -70,
    width: 245,
    height: 245,
    borderRadius: 125,
    backgroundColor: '#f8cddd',
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: 25,
  },
  iconoContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
    borderWidth: 5,
    borderColor: '#f9d5e2',
    shadowColor: '#9d4164',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icono: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
  },
  titulo: {
    color: '#8f3658',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  descripcion: {
    color: '#a45573',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 5,
  },
  usuarioCard: {
    width: '100%',
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fde8f0',
    borderWidth: 1,
    borderColor: '#efc3d3',
  },
  usuarioLabel: {
    color: '#a45a75',
    fontSize: 13,
  },
  usuarioNombre: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 3,
  },
  menu: {
    width: '100%',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffafb',
    padding: 16,
    borderRadius: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#efc3d3',
    shadowColor: '#9d4164',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 3,
  },
  opcionPresionada: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  numeroOpcion: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },
  numeroTexto: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
  },
  informacionOpcion: {
    flex: 1,
    marginLeft: 14,
  },
  tituloOpcion: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
  },
  descripcionOpcion: {
    color: '#9d6b7e',
    fontSize: 13,
    marginTop: 3,
  },
  flecha: {
    color: '#cf6f91',
    fontSize: 30,
    marginLeft: 8,
  },
  botonSalir: {
    backgroundColor: '#b84f74',
    padding: 15,
    borderRadius: 16,
    marginTop: 14,
  },
  botonPresionado: {
    opacity: 0.8,
  },
  textoBotonSalir: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pie: {
    color: '#b37a8f',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 22,
  },
});