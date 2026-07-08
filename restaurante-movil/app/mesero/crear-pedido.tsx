import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';
import { useAuth } from '../../src/context/AuthContext';
import { obtenerMensajeError } from '../../src/utils/apiError';

type Mesa = {
  id: number;
  numero: number;
  estado: string;
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
};

export default function CrearPedidoScreen() {
  const { usuario } = useAuth();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [respuestaMesas, respuestaProductos] = await Promise.all([
        restauranteApi.get('/api/mesero/mesas'),
        restauranteApi.get('/api/mesero/productos'),
      ]);

      setMesas(respuestaMesas.data);
      setProductos(respuestaProductos.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar las mesas o productos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cambiarCantidad = (productoId: number, cambio: number) => {
    setCantidades((prev) => {
      const cantidadActual = prev[productoId] || 0;
      const nuevaCantidad = Math.max(0, cantidadActual + cambio);

      return {
        ...prev,
        [productoId]: nuevaCantidad,
      };
    });
  };

  const crearPedido = async () => {
    if (!mesaSeleccionada) {
      Alert.alert('Mesa requerida', 'Selecciona una mesa para el pedido.');
      return;
    }

    const productosSeleccionados = productos
      .filter((producto) => (cantidades[producto.id] || 0) > 0)
      .map((producto) => ({
        producto_id: producto.id,
        cantidad: cantidades[producto.id],
        observaciones: observaciones[producto.id] || null,
      }));

    if (productosSeleccionados.length === 0) {
      Alert.alert('Productos requeridos', 'Agrega al menos un producto al pedido.');
      return;
    }

    try {
      setEnviando(true);

      const respuesta = await restauranteApi.post('/api/mesero/pedidos', {
        mesa: mesaSeleccionada,
        mesero: usuario?.nombre || 'Mesero',
        productos: productosSeleccionados,
      });

      Alert.alert(
        'Pedido creado',
        `Pedido #${respuesta.data.id_pedido}\nTotal: $${respuesta.data.total}`
      );

      setMesaSeleccionada(null);
      setCantidades({});
      setObservaciones({});
    } catch (error: any) {
      console.log(error?.response?.data || error.message);

      const mensaje =
        error?.response?.data?.detail ||
        'No se pudo crear el pedido. Revisa la información.';

      Alert.alert('Error', mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando información...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Crear pedido</Text>

      <Text style={styles.seccion}>Selecciona una mesa</Text>

      <View style={styles.mesasContainer}>
        {mesas.map((mesa) => (
          <Pressable
            key={mesa.id}
            style={[
              styles.mesa,
              mesaSeleccionada === mesa.numero && styles.mesaSeleccionada,
            ]}
            onPress={() => setMesaSeleccionada(mesa.numero)}
          >
            <Text
              style={[
                styles.textoMesa,
                mesaSeleccionada === mesa.numero && styles.textoMesaSeleccionada,
              ]}
            >
              Mesa {mesa.numero}
            </Text>
            <Text
              style={[
                styles.estadoMesa,
                mesaSeleccionada === mesa.numero && styles.textoMesaSeleccionada,
              ]}
            >
              {mesa.estado}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.seccion}>Selecciona productos</Text>

      {productos.map((producto) => (
        <View key={producto.id} style={styles.card}>
          <Text style={styles.nombreProducto}>{producto.nombre}</Text>
          <Text>Categoría: {producto.categoria}</Text>
          <Text>Precio: ${producto.precio}</Text>

          <View style={styles.contador}>
            <Pressable
              style={styles.botonCantidad}
              onPress={() => cambiarCantidad(producto.id, -1)}
            >
              <Text style={styles.textoBoton}>-</Text>
            </Pressable>

            <Text style={styles.cantidad}>{cantidades[producto.id] || 0}</Text>

            <Pressable
              style={styles.botonCantidad}
              onPress={() => cambiarCantidad(producto.id, 1)}
            >
              <Text style={styles.textoBoton}>+</Text>
            </Pressable>
          </View>

          {(cantidades[producto.id] || 0) > 0 && (
            <TextInput
              style={styles.input}
              placeholder="Observaciones, ejemplo: sin cebolla"
              value={observaciones[producto.id] || ''}
              onChangeText={(texto) =>
                setObservaciones((prev) => ({
                  ...prev,
                  [producto.id]: texto,
                }))
              }
            />
          )}
        </View>
      ))}

      <Pressable
        style={styles.botonCrear}
        onPress={crearPedido}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Enviar pedido a cocina</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  seccion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  mesasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mesa: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mesaSeleccionada: {
    backgroundColor: '#222',
  },
  textoMesa: {
    fontWeight: 'bold',
  },
  textoMesaSeleccionada: {
    color: '#fff',
  },
  estadoMesa: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nombreProducto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  botonCantidad: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    width: 45,
    alignItems: 'center',
  },
  cantidad: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  input: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonCrear: {
    backgroundColor: '#166534',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  botonRegresar: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 35,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});