export function obtenerMensajeError(error: any, mensajeDefault: string) {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.response?.data?.mensaje) {
    return error.response.data.mensaje;
  }

  if (error?.message === 'Network Error') {
    return 'No se pudo conectar con el API. Revisa que el backend esté encendido, que la IP sea correcta y que el teléfono esté en la misma red WiFi.';
  }

  return mensajeDefault;
}