import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';

type Venta = {
  id_venta: number;
  mesa: number;
  total: number;
  metodo_pago: string;
  fecha: string;
  pedido_ids: string;
};

export default function VentasScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarVentas = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get('/api/caja/ventas');

      setVentas(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar las ventas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando ventas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Ventas registradas</Text>

      {ventas.length === 0 ? (
        <View style={styles.cardVacio}>
          <Text style={styles.textoVacio}>No hay ventas registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={ventas}
          keyExtractor={(item) => item.id_venta.toString()}
          refreshing={cargando}
          onRefresh={cargarVentas}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.venta}>Venta #{item.id_venta}</Text>
              <Text>Mesa: {item.mesa}</Text>
              <Text>Total: ${item.total}</Text>
              <Text>Método de pago: {item.metodo_pago}</Text>
              <Text>Pedidos: {item.pedido_ids}</Text>
              <Text>Fecha: {item.fecha}</Text>
            </View>
          )}
        />
      )}

      <Pressable style={styles.botonActualizar} onPress={cargarVentas}>
        <Text style={styles.textoBoton}>Actualizar ventas</Text>
      </Pressable>

      <Pressable style={styles.botonRegresar} onPress={() => router.back()}>
        <Text style={styles.textoBoton}>Regresar</Text>
      </Pressable>
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  venta: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  botonActualizar: {
    backgroundColor: '#166534',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardVacio: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textoVacio: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});