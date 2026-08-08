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
} from 'react-native';
import { router } from 'expo-router';

import restauranteApi from '../../src/api/restauranteApi';
import { obtenerMensajeError } from '../../src/utils/apiError';
import { notificar } from '../../src/utils/notificaciones';


export default function RegistrarPagoScreen() {
  const [mesa, setMesa] =
    useState('');

  const [
    metodoPago,
    setMetodoPago,
  ] = useState('Efectivo');

  const [
    respuestaPago,
    setRespuestaPago,
  ] = useState(null);

  const [cargando, setCargando] =
    useState(false);

  const registrarPago = async () => {
    if (!mesa.trim()) {
      await notificar(
        'Dato requerido',
        'Ingresa el número de mesa.'
      );

      return;
    }

    try {
      setCargando(true);
      setRespuestaPago(null);

      const respuesta =
        await restauranteApi.post(
          '/api/caja/pagos',
          {
            mesa: Number(mesa),
            metodo_pago: metodoPago,
          }
        );

      setRespuestaPago(
        respuesta.data
      );

      await notificar(
        'Pago registrado',
        (
          `La cuenta de la mesa ` +
          `${respuesta.data.mesa} ` +
          `fue pagada correctamente.\n\n` +
          `Venta: #${respuesta.data.id_venta}\n` +
          `Método: ${respuesta.data.metodo_pago}\n` +
          `Total: $${Number(
            respuesta.data.total || 0
          ).toFixed(2)}`
        )
      );

      setMesa('');

    } catch (error) {
      console.log(
        'Error al registrar pago:',
        error?.response?.data ||
        error?.message
      );

      const mensaje =
        obtenerMensajeError(
          error,
          (
            'No se pudo registrar el pago. ' +
            'Verifica que la mesa tenga ' +
            'pedidos en estado Listo.'
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
              $
            </Text>
          </View>

          <Text style={styles.titulo}>
            Registrar pago
          </Text>

          <Text style={styles.descripcion}>
            Cobra la cuenta pendiente de una mesa
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

          <Text style={styles.label}>
            Método de pago
          </Text>

          <View
            style={styles.metodosContainer}
          >
            <Pressable
              style={[
                styles.metodo,
                metodoPago === 'Efectivo' &&
                  styles.metodoSeleccionado,
              ]}
              onPress={() =>
                setMetodoPago('Efectivo')
              }
            >
              <Text
                style={[
                  styles.textoMetodo,
                  metodoPago === 'Efectivo' &&
                    styles.textoMetodoSeleccionado,
                ]}
              >
                Efectivo
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.metodo,
                metodoPago === 'Tarjeta' &&
                  styles.metodoSeleccionado,
              ]}
              onPress={() =>
                setMetodoPago('Tarjeta')
              }
            >
              <Text
                style={[
                  styles.textoMetodo,
                  metodoPago === 'Tarjeta' &&
                    styles.textoMetodoSeleccionado,
                ]}
              >
                Tarjeta
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.botonRegistrar,
              pressed &&
                styles.botonPresionado,
              cargando &&
                styles.botonDeshabilitado,
            ]}
            onPress={registrarPago}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.textoBoton}>
                Confirmar pago
              </Text>
            )}
          </Pressable>
        </View>

        {respuestaPago && (
          <View style={styles.cardResultado}>
            <View style={styles.confirmacion}>
              <Text
                style={styles.confirmacionTexto}
              >
                ✓
              </Text>
            </View>

            <Text style={styles.pagoTitulo}>
              Pago realizado correctamente
            </Text>

            <View style={styles.fila}>
              <Text style={styles.filaLabel}>
                Venta
              </Text>

              <Text style={styles.filaValor}>
                #{respuestaPago.id_venta}
              </Text>
            </View>

            <View style={styles.fila}>
              <Text style={styles.filaLabel}>
                Mesa
              </Text>

              <Text style={styles.filaValor}>
                {respuestaPago.mesa}
              </Text>
            </View>

            <View style={styles.fila}>
              <Text style={styles.filaLabel}>
                Total pagado
              </Text>

              <Text style={styles.filaValor}>
                $
                {Number(
                  respuestaPago.total || 0
                ).toFixed(2)}
              </Text>
            </View>

            <View style={styles.fila}>
              <Text style={styles.filaLabel}>
                Método
              </Text>

              <Text style={styles.filaValor}>
                {respuestaPago.metodo_pago}
              </Text>
            </View>

            <Text style={styles.pedidosPagados}>
              Pedidos pagados:{' '}
              {respuestaPago
                .pedidos_pagados
                ?.join(', ')}
            </Text>
          </View>
        )}

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
    fontSize: 30,
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
    marginBottom: 17,
  },

  metodosContainer: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 17,
  },

  metodo: {
    flex: 1,
    backgroundColor: '#fff5f8',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8b9ca',
    marginHorizontal: 5,
  },

  metodoSeleccionado: {
    backgroundColor: '#d75f8a',
    borderColor: '#d75f8a',
  },

  textoMetodo: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textoMetodoSeleccionado: {
    color: '#ffffff',
  },

  botonRegistrar: {
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

  confirmacion: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
  },

  confirmacionTexto: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  pagoTitulo: {
    color: '#8f3658',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 11,
    marginBottom: 14,
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

  pedidosPagados: {
    color: '#8f3658',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 14,
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
    opacity: 0.6,
  },

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});