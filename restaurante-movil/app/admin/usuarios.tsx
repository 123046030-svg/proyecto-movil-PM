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

type Usuario = {
  id: number;
  nombre: string;
  username: string;
  activo: boolean;
  roles: string[];
};

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);

      const respuesta = await restauranteApi.get('/api/web/usuarios');

      setUsuarios(respuesta.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Usuarios</Text>

      {usuarios.length === 0 ? (
        <View style={styles.cardVacio}>
          <Text style={styles.textoVacio}>No hay usuarios registrados.</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          refreshing={cargando}
          onRefresh={cargarUsuarios}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text>Usuario: {item.username}</Text>
              <Text>Estado: {item.activo ? 'Activo' : 'Inactivo'}</Text>
              <Text>Roles: {item.roles.length > 0 ? item.roles.join(', ') : 'Sin rol'}</Text>
            </View>
          )}
        />
      )}

      <Pressable style={styles.botonActualizar} onPress={cargarUsuarios}>
        <Text style={styles.textoBoton}>Actualizar usuarios</Text>
      </Pressable>

      <Pressable style={styles.botonRegresar} onPress={() => router.back()}>
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
    marginBottom: 6,
  },
  botonActualizar: {
    backgroundColor: '#166534',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  botonRegresar: {
    backgroundColor: '#991b1b',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardVacio: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textoVacio: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});