export function obtenerRutaPorRol(roles: string[]) {
  if (roles.includes('Administrador')) {
    return '/admin';
  }

  if (roles.includes('Mesero')) {
    return '/mesero';
  }

  if (roles.includes('Cocina')) {
    return '/cocina';
  }

  if (roles.includes('Caja')) {
    return '/caja';
  }

  return '/login';
}

export function obtenerModuloPermitido(roles: string[]) {
  if (roles.includes('Administrador')) {
    return 'admin';
  }

  if (roles.includes('Mesero')) {
    return 'mesero';
  }

  if (roles.includes('Cocina')) {
    return 'cocina';
  }

  if (roles.includes('Caja')) {
    return 'caja';
  }

  return 'login';
}