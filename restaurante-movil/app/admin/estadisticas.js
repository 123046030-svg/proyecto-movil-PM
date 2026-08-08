import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';

export default function EstadisticasScreen() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(
        '/api/web/estadisticas'
      );

      setEstadisticas(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las estadísticas.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const mostrarDinero = (cantidad) => {
    return Number(cantidad || 0).toFixed(2);
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#d75f8a" />
          <Text style={styles.textoCarga}>
            Cargando estadísticas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!estadisticas) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.tituloVacio}>
            No se encontraron estadísticas
          </Text>

          <Pressable
            style={styles.botonRegresar}
            onPress={() => router.back()}
          >
            <Text style={styles.textoBoton}>Regresar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.decoracionSuperior} />

        <View style={styles.encabezado}>
          <View style={styles.iconoContainer}>
            <Text style={styles.icono}>%</Text>
          </View>

          <Text style={styles.titulo}>Estadísticas</Text>

          <Text style={styles.descripcion}>
            Resumen general de CoffeReg
          </Text>
        </View>

        <View style={styles.ingresosCard}>
          <Text style={styles.ingresosLabel}>
            Ingresos totales
          </Text>

          <Text style={styles.ingresosNumero}>
            ${mostrarDinero(estadisticas.ingresos_totales)}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.total_pedidos}
            </Text>
            <Text style={styles.label}>Total pedidos</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.pedidos_pendientes}
            </Text>
            <Text style={styles.label}>Pendientes</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.pedidos_en_preparacion}
            </Text>
            <Text style={styles.label}>En preparación</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.pedidos_listos}
            </Text>
            <Text style={styles.label}>Listos</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.pedidos_pagados}
            </Text>
            <Text style={styles.label}>Pagados</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.total_ventas}
            </Text>
            <Text style={styles.label}>Ventas</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.total_productos}
            </Text>
            <Text style={styles.label}>Productos</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>
              {estadisticas.mesas_ocupadas}
            </Text>
            <Text style={styles.label}>Mesas ocupadas</Text>
          </View>

          <View style={styles.cardCompleta}>
            <Text style={styles.numero}>
              {estadisticas.total_usuarios}
            </Text>
            <Text style={styles.label}>
              Usuarios registrados
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botonActualizar,
            pressed && styles.botonPresionado,
          ]}
          onPress={cargarEstadisticas}
        >
          <Text style={styles.textoBoton}>
            Actualizar estadísticas
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonRegresar,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBoton}>Regresar</Text>
        </Pressable>

        <Text style={styles.pie}>
          CoffeReg · Estadísticas
        </Text>
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
    paddingHorizontal: 20,
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
  decoracionSuperior: {
    position: 'absolute',
    top: -100,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#f8cddd',
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: 22,
  },
  iconoContainer: {
    width: 74,
    height: 74,
    borderRadius: 37,
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
    fontSize: 29,
    fontWeight: 'bold',
    marginTop: 12,
  },
  descripcion: {
    color: '#a45573',
    fontSize: 15,
    marginTop: 4,
  },
  ingresosCard: {
    backgroundColor: '#fde2ec',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#efb9cd',
    marginBottom: 16,
  },
  ingresosLabel: {
    color: '#a45573',
    fontSize: 15,
    fontWeight: '600',
  },
  ingresosNumero: {
    color: '#8f3658',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fffafb',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
    alignItems: 'center',
    marginBottom: 13,
  },
  cardCompleta: {
    width: '100%',
    backgroundColor: '#fffafb',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
    alignItems: 'center',
    marginBottom: 13,
  },
  numero: {
    color: '#8f3658',
    fontSize: 25,
    fontWeight: 'bold',
  },
  label: {
    color: '#9d6b7e',
    textAlign: 'center',
    marginTop: 5,
  },
  botonActualizar: {
    backgroundColor: '#d75f8a',
    padding: 15,
    borderRadius: 16,
    marginTop: 8,
  },
  botonRegresar: {
    backgroundColor: '#b84f74',
    padding: 15,
    borderRadius: 16,
    marginTop: 11,
  },
  botonPresionado: {
    opacity: 0.8,
  },
  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textoCarga: {
    color: '#8f3658',
    marginTop: 12,
    fontWeight: '600',
  },
  tituloVacio: {
    color: '#8f3658',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pie: {
    color: '#b37a8f',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
});