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

export default function EstadoPedidoScreen() {
  const [idPedido, setIdPedido] = useState('');
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);

  const consultarEstado = async () => {
    if (!idPedido.trim()) {
      Alert.alert(
        'Dato requerido',
        'Ingresa el ID del pedido.'
      );
      return;
    }

    try {
      setCargando(true);
      setPedido(null);

      const respuesta = await restauranteApi.get(
        `/api/mesero/pedidos/${idPedido}/estado`
      );

      setPedido(respuesta.data);
    } catch (error) {
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.encabezado}>
          <View style={styles.iconoContainer}>
            <Text style={styles.icono}>?</Text>
          </View>

          <Text style={styles.titulo}>
            Estado del pedido
          </Text>

          <Text style={styles.descripcion}>
            Consulta el progreso de una comanda
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.label}>ID del pedido</Text>

          <TextInput
            style={styles.input}
            placeholder="Ejemplo: 15"
            placeholderTextColor="#bd8ea0"
            value={idPedido}
            onChangeText={setIdPedido}
            keyboardType="numeric"
          />

          <Pressable
            style={({ pressed }) => [
              styles.botonConsultar,
              pressed && styles.botonPresionado,
            ]}
            onPress={consultarEstado}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.textoBoton}>
                Consultar estado
              </Text>
            )}
          </Pressable>
        </View>

        {pedido && (
          <View style={styles.cardResultado}>
            <Text style={styles.pedidoTitulo}>
              Pedido #{pedido.id_pedido}
            </Text>

            <View style={styles.fila}>
              <Text style={styles.filaLabel}>Mesa</Text>
              <Text style={styles.filaValor}>
                {pedido.mesa}
              </Text>
            </View>

            <Text style={styles.estadoLabel}>
              Estado actual
            </Text>

            <View style={styles.estadoCard}>
              <Text style={styles.estadoTexto}>
                {pedido.estado}
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
          <Text style={styles.textoBoton}>Regresar</Text>
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
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 35,
    backgroundColor: '#fff1f6',
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: 22,
  },
  iconoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
    borderWidth: 5,
    borderColor: '#f9d5e2',
  },
  icono: {
    color: '#ffffff',
    fontSize: 27,
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
    marginTop: 4,
    textAlign: 'center',
  },
  formulario: {
    backgroundColor: '#fffafb',
    padding: 19,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#efc3d3',
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
  cardResultado: {
    backgroundColor: '#fde8f0',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginTop: 18,
  },
  pedidoTitulo: {
    color: '#8f3658',
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#efc3d3',
    paddingVertical: 9,
  },
  filaLabel: {
    color: '#9d6b7e',
  },
  filaValor: {
    color: '#8f3658',
    fontWeight: 'bold',
  },
  estadoLabel: {
    color: '#9d6b7e',
    textAlign: 'center',
    marginTop: 16,
  },
  estadoCard: {
    backgroundColor: '#f7c8d8',
    padding: 15,
    borderRadius: 15,
    marginTop: 7,
  },
  estadoTexto: {
    color: '#8f3658',
    textAlign: 'center',
    fontSize: 19,
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
  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});