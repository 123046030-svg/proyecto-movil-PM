import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';

type ProductoCuenta = {
  nombre: string;
  cantidad: number;
  observaciones: string | null;
  precio_unitario: number;
};

type PedidoCuenta = {
  id_pedido: number;
  estado: string;
  total: number;
  productos: ProductoCuenta[];
};

type Cuenta = {
  mesa: number;
  pedidos: PedidoCuenta[];
  total: number;
};

export default function CuentaMesaScreen() {
  const [mesa, setMesa] = useState('');
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [cargando, setCargando] = useState(false);

  const consultarCuenta = async () => {
    if (!mesa.trim()) {
      Alert.alert('Dato requerido', 'Ingresa el número de mesa.');
      return;
    }

    try {
      setCargando(true);
      setCuenta(null);

      const respuesta = await restauranteApi.get(`/api/caja/cuentas/${mesa}`);

      setCuenta(respuesta.data);
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje =
        error?.response?.data?.detail ||
        'No se pudo consultar la cuenta de la mesa.';

      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Consultar cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Número de mesa"
        value={mesa}
        onChangeText={setMesa}
        keyboardType="numeric"
      />

      <Pressable style={styles.botonConsultar} onPress={consultarCuenta}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Consultar cuenta</Text>
        )}
      </Pressable>

      {cuenta && (
        <View style={styles.resultado}>
          <Text style={styles.subtitulo}>Mesa {cuenta.mesa}</Text>

          {cuenta.pedidos.length === 0 ? (
            <Text style={styles.textoVacio}>No hay pedidos pendientes de pago.</Text>
          ) : (
            cuenta.pedidos.map((pedido) => (
              <View key={pedido.id_pedido} style={styles.card}>
                <Text style={styles.pedido}>Pedido #{pedido.id_pedido}</Text>
                <Text>Estado: {pedido.estado}</Text>
                <Text>Total del pedido: ${pedido.total}</Text>

                <Text style={styles.productosTitulo}>Productos:</Text>

                {pedido.productos.map((producto, index) => (
                  <View key={index} style={styles.producto}>
                    <Text style={styles.productoNombre}>{producto.nombre}</Text>
                    <Text>Cantidad: {producto.cantidad}</Text>
                    <Text>Precio unitario: ${producto.precio_unitario}</Text>
                    <Text>
                      Observaciones:{' '}
                      {producto.observaciones ? producto.observaciones : 'Sin observaciones'}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          <View style={styles.totalCard}>
            <Text style={styles.total}>Total a pagar: ${cuenta.total}</Text>
          </View>
        </View>
      )}

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
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonConsultar: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  resultado: {
    marginTop: 5,
  },
  subtitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
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
  productosTitulo: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  producto: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  productoNombre: {
    fontWeight: 'bold',
  },
  totalCard: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textoVacio: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 35,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});