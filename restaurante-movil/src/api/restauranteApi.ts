import axios from 'axios';

const restauranteApi = axios.create({
  baseURL: 'http://192.168.0.19:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default restauranteApi;