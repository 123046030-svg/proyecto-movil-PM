import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';

type Estadisticas = {
  total_pedidos: number;
  pedidos_pendientes: number;
  pedidos_en_preparacion: number;
  pedidos_listos: number;
  pedidos_pagados: number;
  total_ventas: number;
  ingresos_totales: number;
  total_productos: number;
  mesas_ocupadas: number;
  total_usuarios: number;
};

export default function EstadisticasScreen() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get('/api/web/estadisticas');

      setEstadisticas(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!estadisticas) {
    return (
      <View style={styles.center}>
        <Text>No se encontraron estadísticas.</Text>

        <Pressable style={styles.botonRegresar} onPress={() => router.back()}>
          <Text style={styles.textoBoton}>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Estadísticas</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.total_pedidos}</Text>
          <Text style={styles.label}>Total pedidos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.pedidos_pendientes}</Text>
          <Text style={styles.label}>Pendientes</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.pedidos_en_preparacion}</Text>
          <Text style={styles.label}>En preparación</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.pedidos_listos}</Text>
          <Text style={styles.label}>Listos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.pedidos_pagados}</Text>
          <Text style={styles.label}>Pagados</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.total_ventas}</Text>
          <Text style={styles.label}>Ventas</Text>
        </View>

        <View style={styles.cardGrande}>
          <Text style={styles.numero}>${estadisticas.ingresos_totales}</Text>
          <Text style={styles.label}>Ingresos totales</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.total_productos}</Text>
          <Text style={styles.label}>Productos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.mesas_ocupadas}</Text>
          <Text style={styles.label}>Mesas ocupadas</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.numero}>{estadisticas.total_usuarios}</Text>
          <Text style={styles.label}>Usuarios</Text>
        </View>
      </View>

      <Pressable style={styles.botonActualizar} onPress={cargarEstadisticas}>
        <Text style={styles.textoBoton}>Actualizar estadísticas</Text>
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cardGrande: {
    backgroundColor: '#dcfce7',
    width: '100%',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
  },
  numero: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    textAlign: 'center',
    marginTop: 5,
  },
  botonActualizar: {
    backgroundColor: '#166534',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 35,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});