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
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import restauranteApi from '../../src/api/restauranteApi';
import { obtenerMensajeError } from '../../src/utils/apiError';
import {
  notificar,
  confirmarAccion,
} from '../../src/utils/notificaciones';


export default function DetallePedidoScreen() {
  const { idPedido } =
    useLocalSearchParams();

  const pedidoId =
    Array.isArray(idPedido)
      ? idPedido[0]
      : idPedido;

  const [pedido, setPedido] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const cargarDetalle = async () => {
    if (!pedidoId) {
      return;
    }

    try {
      setCargando(true);

      const respuesta =
        await restauranteApi.get(
          `/api/cocina/pedidos/${pedidoId}`
        );

      setPedido(respuesta.data);

    } catch (error) {
      console.log(
        'Error al cargar pedido:',
        error?.response?.data ||
        error?.message
      );

      const mensaje =
        obtenerMensajeError(
          error,
          (
            'No se pudo cargar el ' +
            'detalle del pedido.'
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
    cargarDetalle();
  }, [pedidoId]);

  const cambiarAEnPreparacion =
    async () => {
      try {
        setActualizando(true);

        const respuesta =
          await restauranteApi.patch(
            (
              `/api/cocina/pedidos/` +
              `${pedidoId}/en-preparacion`
            )
          );

        await notificar(
          'Pedido en preparación',
          respuesta.data?.mensaje ||
            (
              `El pedido #${pedidoId} ` +
              'está en preparación.'
            )
        );

        await cargarDetalle();

      } catch (error) {
        const mensaje =
          obtenerMensajeError(
            error,
            (
              'No se pudo cambiar el pedido ' +
              'a En preparación.'
            )
          );

        await notificar(
          'Error',
          mensaje
        );

      } finally {
        setActualizando(false);
      }
    };

  const marcarComoListo = async () => {
    const confirmado =
      await confirmarAccion(
        'Confirmar pedido',
        (
          `¿Deseas marcar el pedido ` +
          `#${pedidoId} como Listo?`
        ),
        'Marcar listo'
      );

    if (!confirmado) {
      return;
    }

    try {
      setActualizando(true);

      const respuesta =
        await restauranteApi.patch(
          (
            `/api/cocina/pedidos/` +
            `${pedidoId}/listo`
          )
        );

      await notificar(
        'Pedido listo',
        respuesta.data?.mensaje ||
          (
            `El pedido #${pedidoId} ` +
            'está listo para entregar.'
          )
      );

      await cargarDetalle();

    } catch (error) {
      const mensaje =
        obtenerMensajeError(
          error,
          (
            'No se pudo marcar el pedido ' +
            'como listo.'
          )
        );

      await notificar(
        'Error',
        mensaje
      );

    } finally {
      setActualizando(false);
    }
  };

  const eliminarPedido = async () => {
    const confirmado =
      await confirmarAccion(
        'Eliminar pedido',
        (
          `¿Deseas eliminar permanentemente ` +
          `el pedido #${pedidoId}?`
        ),
        'Eliminar'
      );

    if (!confirmado) {
      return;
    }

    try {
      setActualizando(true);

      const respuesta =
        await restauranteApi.delete(
          `/api/cocina/pedidos/${pedidoId}`
        );

      await notificar(
        'Pedido eliminado',
        respuesta.data?.mensaje ||
          (
            `El pedido #${pedidoId} fue ` +
            'eliminado correctamente.'
          )
      );

      router.back();

    } catch (error) {
      const mensaje =
        obtenerMensajeError(
          error,
          'No se pudo eliminar el pedido.'
        );

      await notificar(
        'Error',
        mensaje
      );

    } finally {
      setActualizando(false);
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
            Cargando detalle...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pedido) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.center}>
          <Text style={styles.textoVacio}>
            No se encontró el pedido.
          </Text>

          <Pressable
            style={styles.botonRegresar}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.encabezado}>
          <View
            style={styles.iconoContainer}
          >
            <Text style={styles.icono}>
              C
            </Text>
          </View>

          <Text style={styles.titulo}>
            Detalle del pedido
          </Text>

          <Text style={styles.descripcion}>
            Pedido #{pedido.id_pedido}
          </Text>
        </View>

        <View style={styles.cardInformacion}>
          <View style={styles.fila}>
            <Text style={styles.filaLabel}>
              Mesa
            </Text>

            <Text style={styles.filaValor}>
              {pedido.mesa}
            </Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.filaLabel}>
              Mesero
            </Text>

            <Text style={styles.filaValor}>
              {pedido.mesero}
            </Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.filaLabel}>
              Estado
            </Text>

            <View style={styles.estadoEtiqueta}>
              <Text style={styles.estadoTexto}>
                {pedido.estado}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.subtitulo}>
          Productos
        </Text>

        {(pedido.productos || []).map(
          (producto, index) => (
            <View
              key={index}
              style={styles.productoCard}
            >
              <View
                style={styles.productoNumero}
              >
                <Text
                  style={styles.productoNumeroTexto}
                >
                  {index + 1}
                </Text>
              </View>

              <View
                style={styles.productoInformacion}
              >
                <Text
                  style={styles.productoNombre}
                >
                  {producto.nombre}
                </Text>

                <Text
                  style={styles.productoDato}
                >
                  Cantidad: {producto.cantidad}
                </Text>

                <Text
                  style={styles.productoObservacion}
                >
                  {producto.observaciones ||
                    'Sin observaciones'}
                </Text>
              </View>
            </View>
          )
        )}

        <Pressable
          style={({ pressed }) => [
            styles.botonPreparacion,
            pressed &&
              styles.botonPresionado,
            actualizando &&
              styles.botonDeshabilitado,
          ]}
          onPress={cambiarAEnPreparacion}
          disabled={actualizando}
        >
          {actualizando ? (
            <ActivityIndicator
              color="#ffffff"
            />
          ) : (
            <Text style={styles.textoBoton}>
              Cambiar a En preparación
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonListo,
            pressed &&
              styles.botonPresionado,
            actualizando &&
              styles.botonDeshabilitado,
          ]}
          onPress={marcarComoListo}
          disabled={actualizando}
        >
          <Text style={styles.textoBoton}>
            Marcar como Listo
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonEliminar,
            pressed &&
              styles.botonPresionado,
            actualizando &&
              styles.botonDeshabilitado,
          ]}
          onPress={eliminarPedido}
          disabled={actualizando}
        >
          <Text style={styles.textoBoton}>
            Eliminar pedido
          </Text>
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
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
  },

  descripcion: {
    color: '#a45573',
    marginTop: 4,
  },

  cardInformacion: {
    backgroundColor: '#fde8f0',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#efc3d3',
  },

  filaLabel: {
    color: '#9d6b7e',
  },

  filaValor: {
    color: '#8f3658',
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

  subtitulo: {
    color: '#8f3658',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 11,
  },

  productoCard: {
    flexDirection: 'row',
    backgroundColor: '#fffafb',
    padding: 15,
    borderRadius: 18,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },

  productoNumero: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },

  productoNumeroTexto: {
    color: '#8f3658',
    fontWeight: 'bold',
  },

  productoInformacion: {
    flex: 1,
    marginLeft: 13,
  },

  productoNombre: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
  },

  productoDato: {
    color: '#75505f',
    marginTop: 4,
  },

  productoObservacion: {
    color: '#9d6b7e',
    fontStyle: 'italic',
    marginTop: 4,
  },

  botonPreparacion: {
    backgroundColor: '#e9a3b9',
    padding: 15,
    borderRadius: 16,
    marginTop: 13,
  },

  botonListo: {
    backgroundColor: '#d75f8a',
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
  },

  botonEliminar: {
    backgroundColor: '#ad4569',
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
  },

  botonRegresar: {
    backgroundColor: '#8f3658',
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

  textoVacio: {
    color: '#8f3658',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});