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

export default function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarProductos = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get(
        '/api/mesero/productos'
      );

      setProductos(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los productos.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#d75f8a" />
          <Text style={styles.textoCarga}>
            Cargando productos...
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
            <Text style={styles.icono}>P</Text>
          </View>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.titulo}>Productos</Text>
            <Text style={styles.descripcion}>
              Menú disponible en CoffeReg
            </Text>
          </View>
        </View>

        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          refreshing={cargando}
          onRefresh={cargarProductos}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardSuperior}>
                <View style={styles.productoIcono}>
                  <Text style={styles.productoIconoTexto}>
                    {item.nombre
                      ? item.nombre.charAt(0).toUpperCase()
                      : 'P'}
                  </Text>
                </View>

                <View style={styles.productoInformacion}>
                  <Text style={styles.nombre}>
                    {item.nombre}
                  </Text>

                  <Text style={styles.categoria}>
                    {item.categoria}
                  </Text>
                </View>

                <Text style={styles.precio}>
                  ${Number(item.precio || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.disponibilidad}>
                <View
                  style={[
                    styles.punto,
                    item.disponible
                      ? styles.disponible
                      : styles.noDisponible,
                  ]}
                />

                <Text style={styles.disponibilidadTexto}>
                  {item.disponible
                    ? 'Disponible'
                    : 'No disponible'}
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
          onPress={cargarProductos}
        >
          <Text style={styles.textoBoton}>
            Actualizar productos
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
    paddingHorizontal: 20,
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
  card: {
    backgroundColor: '#fffafb',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#efc3d3',
  },
  cardSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productoIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },
  productoIconoTexto: {
    color: '#8f3658',
    fontSize: 19,
    fontWeight: 'bold',
  },
  productoInformacion: {
    flex: 1,
    marginLeft: 13,
  },
  nombre: {
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
    fontSize: 19,
    fontWeight: 'bold',
  },
  disponibilidad: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f8',
    padding: 9,
    borderRadius: 12,
    marginTop: 12,
  },
  punto: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 7,
  },
  disponible: {
    backgroundColor: '#d75f8a',
  },
  noDisponible: {
    backgroundColor: '#9f8a92',
  },
  disponibilidadTexto: {
    color: '#75505f',
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