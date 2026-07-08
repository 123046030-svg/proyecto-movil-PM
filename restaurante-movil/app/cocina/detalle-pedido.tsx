import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';
import { obtenerMensajeError } from '../../src/utils/apiError';

type ProductoPedido = {
  nombre: string;
  cantidad: number;
  observaciones: string | null;
};

type PedidoDetalle = {
  id_pedido: number;
  mesa: number;
  mesero: string;
  estado: string;
  fecha: string;
  productos: ProductoPedido[];
};

export default function DetallePedidoCocinaScreen() {
  const { idPedido } = useLocalSearchParams();

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarDetalle = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(`/api/cocina/pedidos/${idPedido}`);

      setPedido(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo cargar el detalle del pedido.');
    } finally {
      setCargando(false);
    }
  };

  const cambiarAEnPreparacion = async () => {
    try {
      setActualizando(true);

      const respuesta = await restauranteApi.patch(
        `/api/cocina/pedidos/${idPedido}/en-preparacion`
      );

      Alert.alert('Estado actualizado', respuesta.data.mensaje);

      await cargarDetalle();
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje =
        error?.response?.data?.detail ||
        'No se pudo cambiar el pedido a En preparación.';

      Alert.alert('Error', mensaje);
    } finally {
      setActualizando(false);
    }
  };

  const marcarComoListo = async () => {
    try {
      setActualizando(true);

      const respuesta = await restauranteApi.patch(
        `/api/cocina/pedidos/${idPedido}/listo`
      );

      Alert.alert('Pedido listo', respuesta.data.mensaje);

      await cargarDetalle();
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje =
        error?.response?.data?.detail ||
        'No se pudo marcar el pedido como listo.';

      Alert.alert('Error', mensaje);
    } finally {
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando detalle...</Text>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el pedido.</Text>

        <Pressable style={styles.botonRegresar} onPress={() => router.back()}>
          <Text style={styles.textoBoton}>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Detalle del pedido</Text>

      <View style={styles.card}>
        <Text style={styles.pedido}>Pedido #{pedido.id_pedido}</Text>
        <Text>Mesa: {pedido.mesa}</Text>
        <Text>Mesero: {pedido.mesero}</Text>
        <Text>Estado: {pedido.estado}</Text>
      </View>

      <Text style={styles.subtitulo}>Productos</Text>

      {pedido.productos.map((producto, index) => (
        <View key={index} style={styles.productoCard}>
          <Text style={styles.productoNombre}>{producto.nombre}</Text>
          <Text>Cantidad: {producto.cantidad}</Text>
          <Text>
            Observaciones:{' '}
            {producto.observaciones ? producto.observaciones : 'Sin observaciones'}
          </Text>
        </View>
      ))}

      <Pressable
        style={styles.botonPreparacion}
        onPress={cambiarAEnPreparacion}
        disabled={actualizando}
      >
        {actualizando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Cambiar a En preparación</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.botonListo}
        onPress={marcarComoListo}
        disabled={actualizando}
      >
        {actualizando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Marcar como Listo</Text>
        )}
      </Pressable>

      <Pressable style={styles.botonRegresar} onPress={() => router.back()}>
        <Text style={styles.textoBoton}>Regresar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  center: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pedido: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  productoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productoNombre: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  botonPreparacion: {
    backgroundColor: '#ca8a04',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  botonListo: {
    backgroundColor: '#166534',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 35,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});