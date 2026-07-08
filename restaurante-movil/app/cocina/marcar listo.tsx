const marcarComoListo = async () => {
  Alert.alert(
    'Confirmar pedido listo',
    '¿Deseas marcar este pedido como Listo?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sí, marcar listo',
        onPress: async () => {
          try {
            setActualizando(true);

            const respuesta = await restauranteApi.patch(
              `/api/cocina/pedidos/${idPedido}/listo`
            );

            Alert.alert('Pedido listo', respuesta.data.mensaje);

            await cargarDetalle();
          } catch (error: any) {
            console.log(error?.response?.data || error.message);

            const mensaje = obtenerMensajeError(
              error,
              'No se pudo marcar el pedido como listo.'
            );

            Alert.alert('Error', mensaje);
          } finally {
            setActualizando(false);
          }
        },
      },
    ]
  );
};