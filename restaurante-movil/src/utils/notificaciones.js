import { Alert, Platform } from 'react-native';

export function notificar(titulo, mensaje) {
  const tituloFinal = String(titulo || 'Aviso');
  const mensajeFinal = String(mensaje || '');

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined'
  ) {
    window.alert(`${tituloFinal}\n\n${mensajeFinal}`);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    Alert.alert(
      tituloFinal,
      mensajeFinal,
      [
        {
          text: 'Aceptar',
          onPress: () => resolve(true),
        },
      ],
      {
        cancelable: false,
      }
    );
  });
}

export function confirmarAccion(
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar'
) {
  const tituloFinal = String(titulo || 'Confirmar');
  const mensajeFinal = String(mensaje || '');

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined'
  ) {
    const confirmado = window.confirm(
      `${tituloFinal}\n\n${mensajeFinal}`
    );

    return Promise.resolve(confirmado);
  }

  return new Promise((resolve) => {
    Alert.alert(
      tituloFinal,
      mensajeFinal,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: textoConfirmar,
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      {
        cancelable: false,
        onDismiss: () => resolve(false),
      }
    );
  });
}

export default {
  notificar,
  confirmarAccion,
};