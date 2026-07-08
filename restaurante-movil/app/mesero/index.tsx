import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function MeseroScreen() {
  const { usuario, logout } = useAuth();

  const cerrarSesion = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Módulo Mesero</Text>
      <Text style={styles.usuario}>Usuario: {usuario?.nombre}</Text>

      <Pressable style={styles.boton} onPress={() => router.push('/mesero/mesas')}>
        <Text style={styles.textoBoton}>Ver mesas</Text>
      </Pressable>

      <Pressable style={styles.boton} onPress={() => router.push('/mesero/productos')}>
        <Text style={styles.textoBoton}>Ver productos</Text>
      </Pressable>

      <Pressable style={styles.boton} onPress={() => router.push('/mesero/crear-pedido')}>
        <Text style={styles.textoBoton}>Crear pedido</Text>
      </Pressable>

      <Pressable style={styles.boton} onPress={() => router.push('/mesero/estado-pedido')}>
        <Text style={styles.textoBoton}>Consultar estado de pedido</Text>
      </Pressable>

      <Pressable style={styles.botonSalir} onPress={cerrarSesion}>
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </Pressable>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  usuario: {
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  botonSalir: {
    backgroundColor: '#991b1b',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});