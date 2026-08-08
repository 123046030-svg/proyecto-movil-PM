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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';
import { obtenerMensajeError } from '../../src/utils/apiError';

export default function CuentaMesaScreen() {
  const [mesa, setMesa] = useState('');
  const [cuenta, setCuenta] = useState(null);
  const [cargando, setCargando] = useState(false);

  const consultarCuenta = async () => {
    if (!mesa.trim()) {
      Alert.alert(
        'Dato requerido',
        'Ingresa el número de mesa.'
      );
      return;
    }

    try {
      setCargando(true);
      setCuenta(null);

      const respuesta = await restauranteApi.get(
        `/api/caja/cuentas/${mesa.trim()}`
      );

      setCuenta(respuesta.data);
    } catch (error) {
      console.log(
        'Error al consultar cuenta:',
        error?.response?.data || error?.message
      );

      const mensaje = obtenerMensajeError(
        error,
        'No se pudo consultar la cuenta de la mesa.'
      );

      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const mostrarDinero = (cantidad) => {
    return Number(cantidad || 0).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encabezado}>
          <View style={styles.iconoContainer}>
            <Text style={styles.icono}>?</Text>
          </View>

          <Text style={styles.titulo}>
            Consultar cuenta
          </Text>

          <Text style={styles.descripcion}>
            Revisa los pedidos pendientes de una mesa
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.label}>
            Número de mesa
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ejemplo: 4"
            placeholderTextColor="#bd8ea0"
            value={mesa}
            onChangeText={setMesa}
            keyboardType="numeric"
          />

          <Pressable
            style={({ pressed }) => [
              styles.botonConsultar,
              pressed && styles.botonPresionado,
              cargando && styles.botonDeshabilitado,
            ]}
            onPress={consultarCuenta}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.textoBoton}>
                Consultar cuenta
              </Text>
            )}
          </Pressable>
        </View>

        {cuenta && (
          <View style={styles.resultado}>
            <View style={styles.mesaCard}>
              <Text style={styles.mesaTitulo}>
                Mesa {cuenta.mesa}
              </Text>

              <Text style={styles.mesaDescripcion}>
                Pedidos pendientes de pago
              </Text>
            </View>

            {cuenta.pedidos?.length === 0 ? (
              <View style={styles.cardVacio}>
                <Text style={styles.textoVacio}>
                  No hay pedidos pendientes de pago.
                </Text>
              </View>
            ) : (
              cuenta.pedidos?.map((pedido) => (
                <View
                  key={pedido.id_pedido}
                  style={styles.cardPedido}
                >
                  <View style={styles.pedidoEncabezado}>
                    <Text style={styles.pedidoTitulo}>
                      Pedido #{pedido.id_pedido}
                    </Text>

                    <View style={styles.estadoEtiqueta}>
                      <Text style={styles.estadoTexto}>
                        {pedido.estado}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.totalPedido}>
                    Total del pedido: $
                    {mostrarDinero(pedido.total)}
                  </Text>

                  <Text style={styles.productosTitulo}>
                    Productos
                  </Text>

                  {pedido.productos?.map(
                    (producto, index) => (
                      <View
                        key={`${pedido.id_pedido}-${index}`}
                        style={styles.producto}
                      >
                        <Text style={styles.productoNombre}>
                          {producto.nombre}
                        </Text>

                        <Text style={styles.productoDato}>
                          Cantidad: {producto.cantidad}
                        </Text>

                        <Text style={styles.productoDato}>
                          Precio unitario: $
                          {mostrarDinero(
                            producto.precio_unitario
                          )}
                        </Text>

                        <Text style={styles.productoDato}>
                          Observaciones:{' '}
                          {producto.observaciones ||
                            'Sin observaciones'}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ))
            )}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>
                Total a pagar
              </Text>

              <Text style={styles.total}>
                ${mostrarDinero(cuenta.total)}
              </Text>
            </View>
          </View>
        )}

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
    padding: 20,
    paddingTop: 35,
    paddingBottom: 35,
    backgroundColor: '#fff1f6',
  },

  encabezado: {
    alignItems: 'center',
    marginBottom: 22,
  },

  iconoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
    borderWidth: 5,
    borderColor: '#f9d5e2',
  },

  icono: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: 'bold',
  },

  titulo: {
    color: '#8f3658',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },

  descripcion: {
    color: '#a45573',
    marginTop: 5,
    textAlign: 'center',
  },

  formulario: {
    backgroundColor: '#fffafb',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 18,
  },

  label: {
    color: '#8f3658',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    color: '#603342',
    backgroundColor: '#fff5f8',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8b9ca',
    marginBottom: 13,
  },

  botonConsultar: {
    backgroundColor: '#d75f8a',
    padding: 15,
    borderRadius: 15,
  },

  resultado: {
    marginTop: 3,
  },

  mesaCard: {
    backgroundColor: '#fde8f0',
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 14,
  },

  mesaTitulo: {
    color: '#8f3658',
    fontSize: 22,
    fontWeight: 'bold',
  },

  mesaDescripcion: {
    color: '#9d6b7e',
    marginTop: 4,
  },

  cardPedido: {
    backgroundColor: '#fffafb',
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 14,
  },

  pedidoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pedidoTitulo: {
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
    fontSize: 12,
    fontWeight: 'bold',
  },

  totalPedido: {
    color: '#a45573',
    fontWeight: 'bold',
    marginTop: 10,
  },

  productosTitulo: {
    color: '#8f3658',
    fontWeight: 'bold',
    marginTop: 14,
  },

  producto: {
    backgroundColor: '#fff5f8',
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
  },

  productoNombre: {
    color: '#8f3658',
    fontWeight: 'bold',
    marginBottom: 4,
  },

  productoDato: {
    color: '#75505f',
    marginTop: 2,
  },

  totalCard: {
    backgroundColor: '#f7c8d8',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 3,
  },

  totalLabel: {
    color: '#a45573',
    fontWeight: '600',
  },

  total: {
    color: '#8f3658',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 4,
  },

  cardVacio: {
    backgroundColor: '#fffafb',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  textoVacio: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  botonRegresar: {
    backgroundColor: '#b84f74',
    padding: 15,
    borderRadius: 16,
    marginTop: 18,
  },

  botonPresionado: {
    opacity: 0.8,
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});