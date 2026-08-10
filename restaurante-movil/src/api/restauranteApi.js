import axios from 'axios';

const BASE_URL = 'https://smartly-sanction-bakery.ngrok-free.dev';

const restauranteApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',

    // Omite la pantalla "Visit Site" de ngrok.
    'ngrok-skip-browser-warning': '1',
  },
});

export function obtenerBaseUrlApi() {
  return BASE_URL;
}

export default restauranteApi;