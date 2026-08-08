function normalizarRoles(roles = []) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((rol) => {
      if (typeof rol === 'string') {
        return rol;
      }

      if (rol && typeof rol === 'object') {
        return rol.nombre || rol.name || rol.rol || '';
      }

      return '';
    })
    .map((rol) =>
      String(rol)
        .trim()
        .toLowerCase()
        .replace('role_', '')
    );
}

export function obtenerRolPrincipal(roles = []) {
  const rolesNormalizados = normalizarRoles(roles);

  // Los roles operativos tienen prioridad para impedir
  // que Caja o Cocina entren accidentalmente a Admin.
  if (rolesNormalizados.includes('mesero')) {
    return 'Mesero';
  }

  if (rolesNormalizados.includes('cocina')) {
    return 'Cocina';
  }

  if (rolesNormalizados.includes('caja')) {
    return 'Caja';
  }

  if (
    rolesNormalizados.includes('administrador') ||
    rolesNormalizados.includes('admin')
  ) {
    return 'Administrador';
  }

  return null;
}

export function obtenerRutaPorRol(roles = []) {
  const rol = obtenerRolPrincipal(roles);

  if (rol === 'Mesero') {
    return '/mesero';
  }

  if (rol === 'Cocina') {
    return '/cocina';
  }

  if (rol === 'Caja') {
    return '/caja';
  }

  if (rol === 'Administrador') {
    return '/admin';
  }

  return '/login';
}

export function obtenerModuloPermitido(roles = []) {
  const rol = obtenerRolPrincipal(roles);

  if (rol === 'Mesero') {
    return 'mesero';
  }

  if (rol === 'Cocina') {
    return 'cocina';
  }

  if (rol === 'Caja') {
    return 'caja';
  }

  if (rol === 'Administrador') {
    return 'admin';
  }

  return 'login';
}