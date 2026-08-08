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
import { obtenerMensajeError } from '../../src/utils/apiError';

export default function VentasScreen() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarVentas = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(
        '/api/caja/ventas'
      );

      setVentas(respuesta.data);
    } catch (error) {
      console.log(
        'Error al cargar ventas:',
        error?.response?.data || error?.message
      );

      const mensaje = obtenerMensajeError(
        error,
        'No se pudieron cargar las ventas.'
      );

      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const mostrarDinero = (cantidad) => {
    return Number(cantidad || 0).toFixed(2);
  };

  const mostrarFecha = (fecha) => {
    if (!fecha) {
      return 'Sin fecha';
    }

    const fechaConvertida = new Date(fecha);

    if (
      Number.isNaN(fechaConvertida.getTime())
    ) {
      return fecha;
    }

    return fechaConvertida.toLocaleString();
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
            Cargando ventas...
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
            <Text style={styles.icono}>V</Text>
          </View>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.titulo}>
              Ventas registradas
            </Text>

            <Text style={styles.descripcion}>
              Historial de cuentas cobradas
            </Text>
          </View>
        </View>

        {ventas.length === 0 ? (
          <View style={styles.cardVacio}>
            <Text style={styles.textoVacio}>
              No hay ventas registradas.
            </Text>
          </View>
        ) : (
          <FlatList
            data={ventas}
            keyExtractor={(item) =>
              item.id_venta.toString()
            }
            refreshing={cargando}
            onRefresh={cargarVentas}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardEncabezado}>
                  <Text style={styles.ventaTitulo}>
                    Venta #{item.id_venta}
                  </Text>

                  <View style={styles.metodoEtiqueta}>
                    <Text style={styles.metodoTexto}>
                      {item.metodo_pago}
                    </Text>
                  </View>
                </View>

                <Text style={styles.total}>
                  ${mostrarDinero(item.total)}
                </Text>

                <View style={styles.datosContainer}>
                  <View style={styles.fila}>
                    <Text style={styles.filaLabel}>
                      Mesa
                    </Text>

                    <Text style={styles.filaValor}>
                      {item.mesa}
                    </Text>
                  </View>

                  <View style={styles.fila}>
                    <Text style={styles.filaLabel}>
                      Pedidos
                    </Text>

                    <Text style={styles.filaValor}>
                      {item.pedido_ids}
                    </Text>
                  </View>

                  <View style={styles.filaFecha}>
                    <Text style={styles.fecha}>
                      {mostrarFecha(item.fecha)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.botonActualizar,
            pressed && styles.botonPresionado,
          ]}
          onPress={cargarVentas}
        >
          <Text style={styles.textoBoton}>
            Actualizar ventas
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
    fontSize: 25,
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

  ventaTitulo: {
    color: '#8f3658',
    fontSize: 18,
    fontWeight: 'bold',
  },

  metodoEtiqueta: {
    backgroundColor: '#f7c8d8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  metodoTexto: {
    color: '#8f3658',
    fontSize: 12,
    fontWeight: 'bold',
  },

  total: {
    color: '#d75f8a',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },

  datosContainer: {
    backgroundColor: '#fff5f8',
    padding: 12,
    borderRadius: 14,
    marginTop: 11,
  },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },

  filaLabel: {
    color: '#9d6b7e',
  },

  filaValor: {
    color: '#8f3658',
    fontWeight: 'bold',
  },

  filaFecha: {
    borderTopWidth: 1,
    borderTopColor: '#efc3d3',
    marginTop: 7,
    paddingTop: 9,
  },

  fecha: {
    color: '#9d6b7e',
    fontSize: 12,
    textAlign: 'center',
  },

  botonActualizar: {
    backgroundColor: '#d75f8a',
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