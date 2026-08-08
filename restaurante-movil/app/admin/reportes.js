import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';

import { obtenerBaseUrlApi } from '../../src/api/restauranteApi';

const REPORTES = [
  {
    id: 1,
    titulo: 'Reporte general',
    descripcion:
      'Resumen de pedidos, ventas, ingresos, usuarios y mesas.',
    ruta: '/api/reportes/general/pdf',
    letra: 'G',
  },
  {
    id: 2,
    titulo: 'Reporte de ventas',
    descripcion:
      'Historial completo de pagos y ventas registradas.',
    ruta: '/api/reportes/ventas/pdf',
    letra: 'V',
  },
  {
    id: 3,
    titulo: 'Reporte de pedidos',
    descripcion:
      'Pedidos, estados, meseros, productos y totales.',
    ruta: '/api/reportes/pedidos/pdf',
    letra: 'P',
  },
  {
    id: 4,
    titulo: 'Reporte de productos',
    descripcion:
      'Catálogo de productos, precios y disponibilidad.',
    ruta: '/api/reportes/productos/pdf',
    letra: 'C',
  },
];

export default function ReportesScreen() {
  const abrirReporte = async (ruta) => {
    try {
      const baseUrl = obtenerBaseUrlApi();
      const url = `${baseUrl}${ruta}`;

      const compatible = await Linking.canOpenURL(url);

      if (!compatible) {
        Alert.alert(
          'No disponible',
          'El dispositivo no puede abrir este reporte.'
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log(
        'Error al abrir reporte:',
        error?.message || error
      );

      Alert.alert(
        'Error',
        'No se pudo abrir el reporte. Revisa que FastAPI esté encendido y que la IP sea correcta.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.encabezado}>
          <View style={styles.iconoPrincipal}>
            <Text style={styles.iconoPrincipalTexto}>
              PDF
            </Text>
          </View>

          <Text style={styles.titulo}>
            Reportes
          </Text>

          <Text style={styles.descripcion}>
            Generación de documentos administrativos
          </Text>
        </View>

        <View style={styles.aviso}>
          <Text style={styles.avisoTitulo}>
            Reportes de CoffeReg
          </Text>

          <Text style={styles.avisoTexto}>
            Selecciona un reporte para abrirlo en formato
            PDF. En el navegador podrás guardarlo,
            imprimirlo o compartirlo.
          </Text>
        </View>

        {REPORTES.map((reporte) => (
          <Pressable
            key={reporte.id}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPresionada,
            ]}
            onPress={() =>
              abrirReporte(reporte.ruta)
            }
          >
            <View style={styles.iconoReporte}>
              <Text style={styles.iconoReporteTexto}>
                {reporte.letra}
              </Text>
            </View>

            <View style={styles.informacion}>
              <Text style={styles.tituloReporte}>
                {reporte.titulo}
              </Text>

              <Text style={styles.descripcionReporte}>
                {reporte.descripcion}
              </Text>
            </View>

            <Text style={styles.flecha}>
              ›
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.botonRegresar,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBoton}>
            Regresar
          </Text>
        </Pressable>

        <Text style={styles.pie}>
          CoffeReg · Reportes PDF
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

  encabezado: {
    alignItems: 'center',
    marginBottom: 20,
  },

  iconoPrincipal: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d75f8a',
    borderWidth: 5,
    borderColor: '#f9d5e2',
  },

  iconoPrincipalTexto: {
    color: '#ffffff',
    fontSize: 19,
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
    textAlign: 'center',
    marginTop: 4,
  },

  aviso: {
    backgroundColor: '#fde8f0',
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 17,
  },

  avisoTitulo: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
  },

  avisoTexto: {
    color: '#8c6574',
    lineHeight: 20,
    marginTop: 5,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffafb',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efc3d3',
    marginBottom: 13,
  },

  cardPresionada: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  iconoReporte: {
    width: 49,
    height: 49,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7c8d8',
  },

  iconoReporteTexto: {
    color: '#8f3658',
    fontSize: 18,
    fontWeight: 'bold',
  },

  informacion: {
    flex: 1,
    marginLeft: 14,
  },

  tituloReporte: {
    color: '#8f3658',
    fontSize: 17,
    fontWeight: 'bold',
  },

  descripcionReporte: {
    color: '#9d6b7e',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  flecha: {
    color: '#cf6f91',
    fontSize: 30,
    marginLeft: 8,
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

  textoBoton: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  pie: {
    color: '#b37a8f',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
});