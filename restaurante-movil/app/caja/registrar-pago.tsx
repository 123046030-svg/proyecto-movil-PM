import { useState } from 'react';
import {
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

type PagoRespuesta = {
  mensaje: string;
  id_venta: number;
  mesa: number;
  total: number;
  metodo_pago: string;
  pedidos_pagados: number[];
};

export default function RegistrarPagoScreen() {
  const [mesa, setMesa] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [respuestaPago, setRespuestaPago] = useState<PagoRespuesta | null>(null);
  const [cargando, setCargando] = useState(false);

  const registrarPago = async () => {
    if (!mesa.trim()) {
      Alert.alert('Dato requerido', 'Ingresa el número de mesa.');
      return;
    }

    if (!metodoPago.trim()) {
      Alert.alert('Dato requerido', 'Selecciona un método de pago.');
      return;
    }

    try {
      setCargando(true);
      setRespuestaPago(null);

      const respuesta = await restauranteApi.post('/api/caja/pagos', {
        mesa: Number(mesa),
        metodo_pago: metodoPago,
      });

      setRespuestaPago(respuesta.data);

      Alert.alert(
        'Pago registrado',
        `Venta #${respuesta.data.id_venta}\nTotal: $${respuesta.data.total}`
      );
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje =
        error?.response?.data?.detail ||
        'No se pudo registrar el pago. Revisa que los pedidos estén en estado Listo.';

      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar pago</Text>

      <TextInput
        style={styles.input}
        placeholder="Número de mesa"
        value={mesa}
        onChangeText={setMesa}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Método de pago</Text>

      <View style={styles.metodosContainer}>
        <Pressable
          style={[
            styles.metodo,
            metodoPago === 'Efectivo' && styles.metodoSeleccionado,
          ]}
          onPress={() => setMetodoPago('Efectivo')}
        >
          <Text
            style={[
              styles.textoMetodo,
              metodoPago === 'Efectivo' && styles.textoMetodoSeleccionado,
            ]}
          >
            Efectivo
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.metodo,
            metodoPago === 'Tarjeta' && styles.metodoSeleccionado,
          ]}
          onPress={() => setMetodoPago('Tarjeta')}
        >
          <Text
            style={[
              styles.textoMetodo,
              metodoPago === 'Tarjeta' && styles.textoMetodoSeleccionado,
            ]}
          >
            Tarjeta
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.botonRegistrar}
        onPress={registrarPago}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Registrar pago</Text>
        )}
      </Pressable>

      {respuestaPago && (
        <View style={styles.card}>
          <Text style={styles.pagoTitulo}>Pago realizado</Text>
          <Text>Venta: #{respuestaPago.id_venta}</Text>
          <Text>Mesa: {respuestaPago.mesa}</Text>
          <Text>Total: ${respuestaPago.total}</Text>
          <Text>Método: {respuestaPago.metodo_pago}</Text>
          <Text>Pedidos pagados: {respuestaPago.pedidos_pagados.join(', ')}</Text>
        </View>
      )}

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
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metodosContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  metodo: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  metodoSeleccionado: {
    backgroundColor: '#222',
  },
  textoMetodo: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textoMetodoSeleccionado: {
    color: '#fff',
  },
  botonRegistrar: {
    backgroundColor: '#166534',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  pagoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 14,
    borderRadius: 10,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});