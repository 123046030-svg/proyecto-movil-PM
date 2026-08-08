import { useEffect, useState } from 'react';
import {
  SafeAreaView,
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

export default function PedidosCocinaScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarPedidos = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(
        '/api/cocina/pedidos/pendientes'
      );

      setPedidos(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los pedidos pendientes.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#d75f8a" />
          <Text style={styles.textoCarga}>
            Cargando pedidos...
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
            <Text style={styles.icono}>C</Text>
          </View>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.titulo}>
              Pedidos pendientes
            </Text>

            <Text style={styles.descripcion}>
              Comandas recibidas en cocina
            </Text>
          </View>
        </View>

        {pedidos.length === 0 ? (
          <View style={styles.cardVacio}>
            <Text style={styles.textoVacio}>
              No hay pedidos pendientes.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pedidos}
            keyExtractor={(item) =>
              item.id_pedido.toString()
            }
            refreshing={cargando}
            onRefresh={cargarPedidos}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardEncabezado}>
                  <Text style={styles.pedido}>
                    Pedido #{item.id_pedido}
                  </Text>

                  <View style={styles.estadoEtiqueta}>
                    <Text style={styles.estadoTexto}>
                      {item.estado}
                    </Text>
                  </View>
                </View>

                <View style={styles.datos}>
                  <Text style={styles.dato}>
                    Mesa: {item.mesa}
                  </Text>

                  <Text style={styles.dato}>
                    Mesero: {item.mesero}
                  </Text>

                  <Text style={styles.dato}>
                    Total productos: {item.total_productos}
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.botonDetalle,
                    pressed && styles.botonPresionado,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/cocina/detalle-pedido',
                      params: {
                        idPedido:
                          item.id_pedido.toString(),
                      },
                    })
                  }
                >
                  <Text style={styles.textoBoton}>
                    Ver detalle del pedido
                  </Text>
                </Pressable>
              </View>
            )}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.botonActualizar,
            pressed && styles.botonPresionado,
          ]}
          onPress={cargarPedidos}
        >
          <Text style={styles.textoBoton}>
            Actualizar pedidos
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonRegresar,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBoton}>Regresar</Text>
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
    fontSize: 24,
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
  card: {
    backgroundColor: '#fffafb',
    padding: 17,
    borderRadius: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },
  cardEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pedido: {
    color: '#8f3658',
    fontSize: 18,
    fontWeight: 'bold',
  },
  estadoEtiqueta: {
    backgroundColor: '#f7c8d8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  estadoTexto: {
    color: '#8f3658',
    fontSize: 11,
    fontWeight: 'bold',
  },
  datos: {
    backgroundColor: '#fff5f8',
    padding: 12,
    borderRadius: 13,
    marginTop: 12,
  },
  dato: {
    color: '#75505f',
    marginBottom: 4,
  },
  botonDetalle: {
    backgroundColor: '#d75f8a',
    padding: 13,
    borderRadius: 14,
    marginTop: 13,
  },
  botonActualizar: {
    backgroundColor: '#c87896',
    padding: 14,
    borderRadius: 16,
    marginTop: 5,
  },
  botonRegresar: {
    backgroundColor: '#b84f74',
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  botonPresionado: {
    opacity: 0.8,
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