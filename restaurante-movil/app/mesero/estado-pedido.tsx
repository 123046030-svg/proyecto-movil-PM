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

type EstadoPedido = {
  id_pedido: number;
  mesa: number;
  estado: string;
};

export default function EstadoPedidoScreen() {
  const [idPedido, setIdPedido] = useState('');
  const [pedido, setPedido] = useState<EstadoPedido | null>(null);
  const [cargando, setCargando] = useState(false);

  const consultarEstado = async () => {
    if (!idPedido.trim()) {
      Alert.alert('Dato requerido', 'Ingresa el ID del pedido.');
      return;
    }

    try {
      setCargando(true);
      setPedido(null);

      const respuesta = await restauranteApi.get(
        `/api/mesero/pedidos/${idPedido}/estado`
      );

      setPedido(respuesta.data);
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje =
        error?.response?.data?.detail ||
        'No se pudo consultar el estado del pedido.';

      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Consultar estado</Text>

      <TextInput
        style={styles.input}
        placeholder="ID del pedido"
        value={idPedido}
        onChangeText={setIdPedido}
        keyboardType="numeric"
      />

      <Pressable style={styles.boton} onPress={consultarEstado}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Consultar</Text>
        )}
      </Pressable>

      {pedido && (
        <View style={styles.card}>
          <Text style={styles.pedido}>Pedido #{pedido.id_pedido}</Text>
          <Text>Mesa: {pedido.mesa}</Text>
          <Text>Estado: {pedido.estado}</Text>
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
  boton: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pedido: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});