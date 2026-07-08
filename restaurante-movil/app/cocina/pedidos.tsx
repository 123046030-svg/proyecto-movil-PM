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

type PedidoPendiente = {
  id_pedido: number;
  mesa: number;
  mesero: string;
  estado: string;
  fecha: string;
  total_productos: number;
};

export default function PedidosCocinaScreen() {
  const [pedidos, setPedidos] = useState<PedidoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarPedidos = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get('/api/cocina/pedidos/pendientes');

      setPedidos(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos pendientes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pedidos pendientes</Text>

      {pedidos.length === 0 ? (
        <View style={styles.cardVacio}>
          <Text style={styles.textoVacio}>No hay pedidos pendientes.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id_pedido.toString()}
          refreshing={cargando}
          onRefresh={cargarPedidos}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.pedido}>Pedido #{item.id_pedido}</Text>
              <Text>Mesa: {item.mesa}</Text>
              <Text>Mesero: {item.mesero}</Text>
              <Text>Estado: {item.estado}</Text>
              <Text>Total productos: {item.total_productos}</Text>

              <Pressable
                style={styles.botonDetalle}
                onPress={() =>
                  router.push({
                    pathname: '/cocina/detalle-pedido',
                    params: {
                      idPedido: item.id_pedido.toString(),
                    },
                  })
                }
              >
                <Text style={styles.textoBoton}>Ver detalle</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Pressable style={styles.botonActualizar} onPress={cargarPedidos}>
        <Text style={styles.textoBoton}>Actualizar pedidos</Text>
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
  pedido: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  botonDetalle: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
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