import { useEffect, useState } from 'react';
import {
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

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
};

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await restauranteApi.get('/api/mesero/productos');
      setProductos(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Productos disponibles</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text>Categoría: {item.categoria}</Text>
            <Text>Precio: ${item.precio}</Text>
            <Text>Disponible: {item.disponible ? 'Sí' : 'No'}</Text>
          </View>
        )}
      />

      <Pressable style={styles.boton} onPress={() => router.back()}>
        <Text style={styles.textoBoton}>Regresar</Text>
      </Pressable>
    </View>
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
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  boton: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});