import {
  useEffect,
  useState,
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import restauranteApi from '../../src/api/restauranteApi';
import { useAuth } from '../../src/context/AuthContext';
import { obtenerMensajeError } from '../../src/utils/apiError';
import { notificar } from '../../src/utils/notificaciones';


export default function CrearPedidoScreen() {
  const { usuario } = useAuth();

  const [mesas, setMesas] =
    useState([]);

  const [productos, setProductos] =
    useState([]);

  const [
    mesaSeleccionada,
    setMesaSeleccionada,
  ] = useState(null);

  const [cantidades, setCantidades] =
    useState({});

  const [
    observaciones,
    setObservaciones,
  ] = useState({});

  const [cargando, setCargando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [
        respuestaMesas,
        respuestaProductos,
      ] = await Promise.all([
        restauranteApi.get(
          '/api/mesero/mesas'
        ),
        restauranteApi.get(
          '/api/mesero/productos'
        ),
      ]);

      setMesas(respuestaMesas.data);
      setProductos(
        respuestaProductos.data
      );

    } catch (error) {
      console.log(
        'Error al cargar datos:',
        error?.response?.data ||
        error?.message
      );

      const mensaje =
        obtenerMensajeError(
          error,
          (
            'No se pudieron cargar las ' +
            'mesas o productos.'
          )
        );

      await notificar(
        'Error',
        mensaje
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cambiarCantidad = (
    productoId,
    cambio
  ) => {
    setCantidades((anteriores) => {
      const cantidadActual =
        anteriores[productoId] || 0;

      const nuevaCantidad =
        Math.max(
          0,
          cantidadActual + cambio
        );

      return {
        ...anteriores,
        [productoId]: nuevaCantidad,
      };
    });
  };

  const crearPedido = async () => {
    if (!mesaSeleccionada) {
      await notificar(
        'Mesa requerida',
        'Selecciona una mesa para el pedido.'
      );

      return;
    }

    const productosSeleccionados =
      productos
        .filter(
          (producto) =>
            (
              cantidades[producto.id] || 0
            ) > 0
        )
        .map((producto) => ({
          producto_id: producto.id,
          cantidad:
            cantidades[producto.id],
          observaciones:
            observaciones[producto.id] ||
            null,
        }));

    if (
      productosSeleccionados.length === 0
    ) {
      await notificar(
        'Productos requeridos',
        (
          'Agrega al menos un producto ' +
          'al pedido.'
        )
      );

      return;
    }

    try {
      setEnviando(true);

      const respuesta =
        await restauranteApi.post(
          '/api/mesero/pedidos',
          {
            mesa: mesaSeleccionada,
            mesero:
              usuario?.nombre ||
              'Mesero',
            productos:
              productosSeleccionados,
          }
        );

      await notificar(
        'Pedido enviado a cocina',
        (
          `El pedido #` +
          `${respuesta.data.id_pedido} ` +
          `de la mesa ` +
          `${respuesta.data.mesa} ` +
          `fue creado correctamente.\n\n` +
          `Total: $${Number(
            respuesta.data.total || 0
          ).toFixed(2)}`
        )
      );

      setMesaSeleccionada(null);
      setCantidades({});
      setObservaciones({});

      await cargarDatos();

    } catch (error) {
      console.log(
        'Error al crear pedido:',
        error?.response?.data ||
        error?.message
      );

      const mensaje =
        obtenerMensajeError(
          error,
          (
            'No se pudo crear el pedido. ' +
            'Revisa la información.'
          )
        );

      await notificar(
        'Error',
        mensaje
      );

    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#d75f8a"
          />

          <Text style={styles.textoCarga}>
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encabezado}>
          <View
            style={styles.iconoContainer}
          >
            <Text style={styles.icono}>
              +
            </Text>
          </View>

          <Text style={styles.titulo}>
            Crear pedido
          </Text>

          <Text style={styles.descripcion}>
            Selecciona la mesa y los productos
          </Text>
        </View>

        <Text style={styles.seccion}>
          1. Selecciona una mesa
        </Text>

        <View style={styles.mesasContainer}>
          {mesas.map((mesa) => {
            const seleccionada =
              mesaSeleccionada ===
              mesa.numero;

            return (
              <Pressable
                key={mesa.id}
                style={[
                  styles.mesa,
                  seleccionada &&
                    styles.mesaSeleccionada,
                ]}
                onPress={() =>
                  setMesaSeleccionada(
                    mesa.numero
                  )
                }
              >
                <Text
                  style={[
                    styles.textoMesa,
                    seleccionada &&
                      styles.textoMesaSeleccionada,
                  ]}
                >
                  Mesa {mesa.numero}
                </Text>

                <Text
                  style={[
                    styles.estadoMesa,
                    seleccionada &&
                      styles.textoMesaSeleccionada,
                  ]}
                >
                  {mesa.estado}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.seccion}>
          2. Selecciona productos
        </Text>

        {productos.map((producto) => (
          <View
            key={producto.id}
            style={styles.card}
          >
            <View
              style={styles.productoEncabezado}
            >
              <View
                style={styles.productoInformacion}
              >
                <Text
                  style={styles.nombreProducto}
                >
                  {producto.nombre}
                </Text>

                <Text style={styles.categoria}>
                  {producto.categoria}
                </Text>
              </View>

              <Text style={styles.precio}>
                $
                {Number(
                  producto.precio || 0
                ).toFixed(2)}
              </Text>
            </View>

            <View style={styles.contador}>
              <Pressable
                style={styles.botonCantidad}
                onPress={() =>
                  cambiarCantidad(
                    producto.id,
                    -1
                  )
                }
              >
                <Text
                  style={styles.textoCantidad}
                >
                  −
                </Text>
              </Pressable>

              <View
                style={styles.cantidadContainer}
              >
                <Text style={styles.cantidad}>
                  {cantidades[producto.id] || 0}
                </Text>
              </View>

              <Pressable
                style={styles.botonCantidad}
                onPress={() =>
                  cambiarCantidad(
                    producto.id,
                    1
                  )
                }
              >
                <Text
                  style={styles.textoCantidad}
                >
                  +
                </Text>
              </Pressable>
            </View>

            {(cantidades[producto.id] || 0) >
              0 && (
              <TextInput
                style={styles.input}
                placeholder={
                  'Observaciones, ejemplo: ' +
                  'sin cebolla'
                }
                placeholderTextColor="#bd8ea0"
                value={
                  observaciones[
                    producto.id
                  ] || ''
                }
                onChangeText={(texto) =>
                  setObservaciones(
                    (anteriores) => ({
                      ...anteriores,
                      [producto.id]: texto,
                    })
                  )
                }
              />
            )}
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.botonCrear,
            pressed &&
              styles.botonPresionado,
            enviando &&
              styles.botonDeshabilitado,
          ]}
          onPress={crearPedido}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator
              color="#ffffff"
            />
          ) : (
            <Text style={styles.textoBoton}>
              Enviar pedido a cocina
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonRegresar,
            pressed &&
              styles.botonPresionado,
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f6',
  },

  encabezado: {
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 30,
    fontWeight: 'bold',
  },

  titulo: {
    color: '#8f3658',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },

  descripcion: {
    color: '#a45573',
    marginTop: 4,
  },

  seccion: {
    color: '#8f3658',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 11,
  },

  mesasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  mesa: {
    backgroundColor: '#fffafb',
    padding: 13,
    borderRadius: 16,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 10,
  },

  mesaSeleccionada: {
    backgroundColor: '#d75f8a',
    borderColor: '#d75f8a',
  },

  textoMesa: {
    color: '#8f3658',
    fontWeight: 'bold',
  },

  textoMesaSeleccionada: {
    color: '#ffffff',
  },

  estadoMesa: {
    color: '#9d6b7e',
    fontSize: 11,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fffafb',
    padding: 16,
    borderRadius: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  productoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productoInformacion: {
    flex: 1,
  },

  nombreProducto: {
    color: '#8f3658',
    fontSize: 18,
    fontWeight: 'bold',
  },

  categoria: {
    color: '#9d6b7e',
    marginTop: 3,
  },

  precio: {
    color: '#d75f8a',
    fontSize: 18,
    fontWeight: 'bold',
  },

  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  botonCantidad: {
    backgroundColor: '#d75f8a',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCantidad: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  cantidadContainer: {
    minWidth: 55,
    alignItems: 'center',
  },

  cantidad: {
    color: '#8f3658',
    fontSize: 22,
    fontWeight: 'bold',
  },

  input: {
    color: '#603342',
    marginTop: 14,
    backgroundColor: '#fff5f8',
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e8b9ca',
  },

  botonCrear: {
    backgroundColor: '#d75f8a',
    padding: 16,
    borderRadius: 16,
    marginTop: 18,
  },

  botonRegresar: {
    backgroundColor: '#b84f74',
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
  },

  botonPresionado: {
    opacity: 0.8,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textoCarga: {
    color: '#8f3658',
    marginTop: 10,
    fontWeight: '600',
  },
});