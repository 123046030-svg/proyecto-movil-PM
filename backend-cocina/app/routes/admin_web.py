from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy import func
from sqlalchemy.orm import (
    Session,
    joinedload
)

from app.database import get_db
from app.models import (
    Usuario,
    Rol,
    Pedido,
    Producto,
    Mesa,
    Venta
)
from app.schemas import (
    RolCreateIn,
    RolOut,
    UsuarioCreateIn,
    UsuarioOut,
    UsuarioRolesIn,
    EstadisticasOut
)


router = APIRouter(
    prefix="/api/web",
    tags=["Web Administrativa"]
)


ROLES_OPERATIVOS = {
    "Mesero",
    "Cocina",
    "Caja"
}


ROLES_PROTEGIDOS = {
    "administrador",
    "mesero",
    "cocina",
    "caja"
}


# =========================================================
# FUNCIÓN AUXILIAR PARA ROL
# =========================================================

def obtener_rol_operativo(
    role_ids: list[int],
    db: Session
) -> Rol:

    if len(role_ids) != 1:
        raise HTTPException(
            status_code=400,
            detail=(
                "Cada usuario debe tener "
                "exactamente un rol"
            )
        )

    rol = (
        db.query(Rol)
        .filter(
            Rol.id == role_ids[0]
        )
        .first()
    )

    if not rol:
        raise HTTPException(
            status_code=404,
            detail=(
                "El rol seleccionado no existe"
            )
        )

    if rol.nombre not in ROLES_OPERATIVOS:
        raise HTTPException(
            status_code=403,
            detail=(
                "Solo se pueden asignar los roles "
                "Mesero, Cocina o Caja"
            )
        )

    return rol


# =========================================================
# ROLES
# =========================================================

@router.get(
    "/roles",
    response_model=list[RolOut]
)
def listar_roles(
    db: Session = Depends(get_db)
):
    roles = (
        db.query(Rol)
        .order_by(Rol.id.asc())
        .all()
    )

    return [
        {
            "id": rol.id,
            "nombre": rol.nombre,
            "descripcion": rol.descripcion
        }
        for rol in roles
    ]


@router.post(
    "/roles",
    response_model=RolOut
)
def crear_rol(
    data: RolCreateIn,
    db: Session = Depends(get_db)
):
    nombre = data.nombre.strip()

    if not nombre:
        raise HTTPException(
            status_code=400,
            detail=(
                "El nombre del rol "
                "es obligatorio"
            )
        )

    rol_existente = (
        db.query(Rol)
        .filter(
            func.lower(Rol.nombre)
            == nombre.lower()
        )
        .first()
    )

    if rol_existente:
        raise HTTPException(
            status_code=400,
            detail=(
                "Ya existe un rol con "
                "ese nombre"
            )
        )

    rol = Rol(
        nombre=nombre,
        descripcion=data.descripcion
    )

    db.add(rol)
    db.commit()
    db.refresh(rol)

    return {
        "id": rol.id,
        "nombre": rol.nombre,
        "descripcion": rol.descripcion
    }


@router.delete("/roles/{rol_id}")
def eliminar_rol(
    rol_id: int,
    db: Session = Depends(get_db)
):
    rol = (
        db.query(Rol)
        .options(joinedload(Rol.usuarios))
        .filter(Rol.id == rol_id)
        .first()
    )

    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol no existe"
        )

    nombre_normalizado = (
        rol.nombre
        .strip()
        .lower()
    )

    if (
        nombre_normalizado
        in ROLES_PROTEGIDOS
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Este es un rol principal "
                "del sistema y no puede eliminarse"
            )
        )

    if rol.usuarios:
        raise HTTPException(
            status_code=400,
            detail=(
                "No se puede eliminar el rol "
                f"porque está asignado a "
                f"{len(rol.usuarios)} usuario(s)"
            )
        )

    nombre_rol = rol.nombre

    try:
        db.delete(rol)
        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "ERROR AL ELIMINAR ROL:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="No se pudo eliminar el rol"
        )

    return {
        "mensaje": (
            f"El rol {nombre_rol} "
            "fue eliminado correctamente"
        ),
        "id": rol_id
    }


# =========================================================
# USUARIOS
# =========================================================

@router.get(
    "/usuarios",
    response_model=list[UsuarioOut]
)
def listar_usuarios(
    db: Session = Depends(get_db)
):
    usuarios = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles))
        .order_by(Usuario.id.asc())
        .all()
    )

    return [
        {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "username": usuario.username,
            "edad": usuario.edad,
            "activo": usuario.activo,
            "roles": [
                rol.nombre
                for rol in usuario.roles
            ]
        }
        for usuario in usuarios
    ]


@router.post(
    "/usuarios",
    response_model=UsuarioOut
)
def crear_usuario(
    data: UsuarioCreateIn,
    db: Session = Depends(get_db)
):
    nombre = data.nombre.strip()

    username = (
        data.username
        .strip()
        .lower()
    )

    password = data.password.strip()

    if (
        not nombre
        or not username
        or not password
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Nombre, usuario y contraseña "
                "son obligatorios"
            )
        )

    # Validar edad.
    if (
        data.edad <= 0
        or data.edad > 100
    ):
        raise HTTPException(
            status_code=400,
            detail="Ingresa una edad válida"
        )

    if data.edad < 18:
        raise HTTPException(
            status_code=400,
            detail=(
                "El trabajador debe tener "
                "al menos 18 años"
            )
        )

    if username == "admin":
        raise HTTPException(
            status_code=403,
            detail=(
                "El usuario admin está reservado"
            )
        )

    usuario_existente = (
        db.query(Usuario)
        .filter(
            func.lower(Usuario.username)
            == username
        )
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail=(
                "Ya existe un usuario con "
                "ese nombre de usuario"
            )
        )

    rol = obtener_rol_operativo(
        data.role_ids,
        db
    )

    usuario = Usuario(
        nombre=nombre,
        username=username,
        password=password,
        edad=data.edad,
        activo=True,
        roles=[rol]
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "username": usuario.username,
        "edad": usuario.edad,
        "activo": usuario.activo,
        "roles": [
            rol.nombre
            for rol in usuario.roles
        ]
    }


@router.patch(
    "/usuarios/{usuario_id}/roles",
    response_model=UsuarioOut
)
def actualizar_roles_usuario(
    usuario_id: int,
    data: UsuarioRolesIn,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles))
        .filter(
            Usuario.id == usuario_id
        )
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe"
        )

    if (
        usuario.username
        .strip()
        .lower()
        == "admin"
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "No se puede modificar "
                "el rol del administrador"
            )
        )

    rol = obtener_rol_operativo(
        data.role_ids,
        db
    )

    usuario.roles = [rol]

    db.commit()
    db.refresh(usuario)

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "username": usuario.username,
        "edad": usuario.edad,
        "activo": usuario.activo,
        "roles": [
            rol.nombre
            for rol in usuario.roles
        ]
    }


@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles))
        .filter(
            Usuario.id == usuario_id
        )
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe"
        )

    username = str(
        usuario.username or ""
    ).strip().lower()

    roles_usuario = [
        str(
            rol.nombre or ""
        ).strip().lower()
        for rol in usuario.roles
    ]

    es_administrador = (
        username == "admin"
        or "administrador"
        in roles_usuario
    )

    if es_administrador:
        raise HTTPException(
            status_code=403,
            detail=(
                "La cuenta del administrador "
                "está protegida y no puede eliminarse"
            )
        )

    datos_usuario = {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "username": usuario.username,
        "edad": usuario.edad
    }

    try:
        # Primero elimina sus relaciones
        # con los roles.
        usuario.roles.clear()

        db.flush()

        # Después elimina al usuario.
        db.delete(usuario)

        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "ERROR AL ELIMINAR USUARIO:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo eliminar el usuario: "
                f"{str(error)}"
            )
        )

    return {
        "mensaje": (
            f"El usuario "
            f"{datos_usuario['nombre']} "
            "fue eliminado correctamente"
        ),
        "usuario": datos_usuario
    }


# =========================================================
# ESTADÍSTICAS
# =========================================================

@router.get(
    "/estadisticas",
    response_model=EstadisticasOut
)
def obtener_estadisticas(
    db: Session = Depends(get_db)
):
    ingresos = (
        db.query(
            func.sum(Venta.total)
        )
        .scalar()
    )

    return {
        "total_pedidos":
            db.query(Pedido).count(),

        "pedidos_pendientes":
            db.query(Pedido)
            .filter(
                Pedido.estado == "Pendiente"
            )
            .count(),

        "pedidos_en_preparacion":
            db.query(Pedido)
            .filter(
                Pedido.estado
                == "En preparación"
            )
            .count(),

        "pedidos_listos":
            db.query(Pedido)
            .filter(
                Pedido.estado == "Listo"
            )
            .count(),

        "pedidos_pagados":
            db.query(Pedido)
            .filter(
                Pedido.estado == "Pagado"
            )
            .count(),

        "total_ventas":
            db.query(Venta).count(),

        "ingresos_totales":
            float(ingresos or 0),

        "total_productos":
            db.query(Producto).count(),

        "mesas_ocupadas":
            db.query(Mesa)
            .filter(
                Mesa.estado == "Ocupada"
            )
            .count(),

        "total_usuarios":
            db.query(Usuario).count()
    }