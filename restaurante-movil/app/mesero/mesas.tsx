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

type Mesa = {
  id: number;
  numero: number;
  estado: string;
};

export default function MesasScreen() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarMesas = async () => {
    try {
      setCargando(true);
      const respuesta = await restauranteApi.get('/api/mesero/mesas');
      setMesas(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar las mesas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando mesas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mesas</Text>

      <FlatList
        data={mesas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.numero}>Mesa {item.numero}</Text>
            <Text>Estado: {item.estado}</Text>
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
  numero: {
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