import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import restauranteApi from '../../src/api/restauranteApi';

export default function MesasScreen() {
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarMesas = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(
        '/api/mesero/mesas'
      );

      setMesas(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las mesas.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#d75f8a" />
          <Text style={styles.textoCarga}>
            Cargando mesas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.encabezado}>
          <View style={styles.iconoContainer}>
            <Text style={styles.icono}>M</Text>
          </View>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.titulo}>Mesas</Text>
            <Text style={styles.descripcion}>
              Disponibilidad del restaurante
            </Text>
          </View>
        </View>

        <FlatList
          data={mesas}
          keyExtractor={(item) => item.id.toString()}
          refreshing={cargando}
          onRefresh={cargarMesas}
          numColumns={2}
          columnWrapperStyle={styles.filaMesas}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.numeroContainer}>
                <Text style={styles.numero}>
                  {item.numero}
                </Text>
              </View>

              <Text style={styles.mesaTexto}>
                Mesa {item.numero}
              </Text>

              <View style={styles.estadoEtiqueta}>
                <Text style={styles.estadoTexto}>
                  {item.estado}
                </Text>
              </View>
            </View>
          )}
        />

        <Pressable
          style={({ pressed }) => [
            styles.botonActualizar,
            pressed && styles.botonPresionado,
          ]}
          onPress={cargarMesas}
        >
          <Text style={styles.textoBoton}>
            Actualizar mesas
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff1f6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 22,
    backgroundColor: '#fff1f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f6',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fde8f0',
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 18,
  },
  iconoContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
  },
  icono: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: 'bold',
  },
  encabezadoTexto: {
    flex: 1,
    marginLeft: 14,
  },
  titulo: {
    color: '#8f3658',
    fontSize: 27,
    fontWeight: 'bold',
  },
  descripcion: {
    color: '#9d6b7e',
    fontSize: 13,
    marginTop: 3,
  },
  lista: {
    paddingBottom: 10,
  },
  filaMesas: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fffafb',
    padding: 16,
    borderRadius: 19,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#efc3d3',
    alignItems: 'center',
  },
  numeroContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },
  numero: {
    color: '#8f3658',
    fontSize: 22,
    fontWeight: 'bold',
  },
  mesaTexto: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 9,
  },
  estadoEtiqueta: {
    backgroundColor: '#fde8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 11,
    marginTop: 7,
  },
  estadoTexto: {
    color: '#a45573',
    fontSize: 12,
    fontWeight: '600',
  },
  botonActualizar: {
    backgroundColor: '#d75f8a',
    padding: 14,
    borderRadius: 16,
  },
  botonRegresar: {
    backgroundColor: '#b84f74',
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
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
    marginTop: 10,
    fontWeight: '600',
  },
});