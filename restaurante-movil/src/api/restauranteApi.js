import axios from 'axios';
import { Platform } from 'react-native';

// Coloca aquí la IPv4 actual de tu computadora.
const IP_COMPUTADORA = '192.168.0.14';

const API_WEB = 'http://192.168.0.14:8000';
const API_MOVIL = `http://${IP_COMPUTADORA}:8000`;

const BASE_URL =
  Platform.OS === 'web'
    ? API_WEB
    : API_MOVIL;

const restauranteApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function obtenerBaseUrlApi() {
  return BASE_URL;
}

export default restauranteApi;