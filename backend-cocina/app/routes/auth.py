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
    Rol
)

from app.schemas import (
    LoginIn,
    LoginOut,
    RegistroIn,
    RegistroOut
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


# Roles que sí pueden crearse
# desde la pantalla de registro.
ROLES_PERMITIDOS = {
    "mesero": "Mesero",
    "cocina": "Cocina",
    "caja": "Caja"
}


# ==========================================================
# LOGIN
# ==========================================================

@router.post(
    "/login",
    response_model=LoginOut
)
def login(
    data: LoginIn,
    db: Session = Depends(get_db)
):

    username = (
        data.username
        .strip()
        .lower()
    )

    password = data.password.strip()


    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail=(
                "Usuario y contraseña "
                "son obligatorios"
            )
        )


    usuario = (
        db.query(Usuario)
        .options(
            joinedload(Usuario.roles)
        )
        .filter(
            func.lower(
                Usuario.username
            ) == username
        )
        .first()
    )


    if not usuario:
        raise HTTPException(
            status_code=401,
            detail=(
                "Usuario o contraseña "
                "incorrectos"
            )
        )


    if usuario.password != password:
        raise HTTPException(
            status_code=401,
            detail=(
                "Usuario o contraseña "
                "incorrectos"
            )
        )


    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail=(
                "El usuario está inactivo"
            )
        )


    return {
        "mensaje": "Login correcto",

        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "username": usuario.username,

            "roles": [
                rol.nombre
                for rol in usuario.roles
            ]
        }
    }


# ==========================================================
# REGISTRO DE USUARIO
# ==========================================================

@router.post(
    "/registro",
    response_model=RegistroOut
)
def registrar_usuario(
    data: RegistroIn,
    db: Session = Depends(get_db)
):

    nombre = data.nombre.strip()

    username = (
        data.username
        .strip()
        .lower()
    )

    password = data.password.strip()

    rol_solicitado = (
        data.rol
        .strip()
        .lower()
    )


    # ======================================================
    # VALIDACIONES BÁSICAS
    # ======================================================

    if not nombre:
        raise HTTPException(
            status_code=400,
            detail=(
                "El nombre completo "
                "es obligatorio"
            )
        )


    if not username:
        raise HTTPException(
            status_code=400,
            detail=(
                "El nombre de usuario "
                "es obligatorio"
            )
        )


    if not password:
        raise HTTPException(
            status_code=400,
            detail=(
                "La contraseña "
                "es obligatoria"
            )
        )


    # ======================================================
    # VALIDACIÓN DE EDAD
    # ======================================================

    if data.edad <= 0 or data.edad > 100:
        raise HTTPException(
            status_code=400,
            detail="Ingresa una edad válida"
        )


    if data.edad < 18:
        raise HTTPException(
            status_code=400,
            detail=(
                "Debes tener al menos "
                "18 años para registrarte "
                "en CoffeReg"
            )
        )


    # ======================================================
    # VALIDACIÓN DE CONTRASEÑA
    # ======================================================

    if len(password) < 4:
        raise HTTPException(
            status_code=400,
            detail=(
                "La contraseña debe tener "
                "al menos 4 caracteres"
            )
        )


    # ======================================================
    # ADMIN RESERVADO
    # ======================================================

    if username == "admin":
        raise HTTPException(
            status_code=403,
            detail=(
                "El usuario admin "
                "está reservado"
            )
        )


    # ======================================================
    # VALIDAR USUARIO DUPLICADO
    # ======================================================

    usuario_existente = (
        db.query(Usuario)
        .filter(
            func.lower(
                Usuario.username
            ) == username
        )
        .first()
    )


    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail=(
                "Ya existe un usuario "
                "con ese nombre de usuario"
            )
        )


    # ======================================================
    # VALIDAR ROL
    # ======================================================

    if rol_solicitado not in ROLES_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo puedes registrarte "
                "como Mesero, Cocina o Caja"
            )
        )


    nombre_rol = (
        ROLES_PERMITIDOS[
            rol_solicitado
        ]
    )


    rol = (
        db.query(Rol)
        .filter(
            func.lower(
                Rol.nombre
            ) == nombre_rol.lower()
        )
        .first()
    )


    if not rol:
        raise HTTPException(
            status_code=404,
            detail=(
                f"El rol {nombre_rol} "
                "no existe en la base de datos"
            )
        )


    # ======================================================
    # CREAR USUARIO
    # ======================================================

    nuevo_usuario = Usuario(
        nombre=nombre,
        username=username,
        password=password,
        edad=data.edad,
        activo=True,
        roles=[rol]
    )


    try:

        db.add(nuevo_usuario)

        db.commit()

        db.refresh(nuevo_usuario)


    except Exception as error:

        db.rollback()

        print(
            "ERROR AL REGISTRAR USUARIO:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo registrar "
                "el usuario"
            )
        )


    # ======================================================
    # RESPUESTA
    # ======================================================

    return {
        "mensaje": (
            "Usuario registrado "
            "correctamente"
        ),

        "usuario": {
            "id": nuevo_usuario.id,

            "nombre": (
                nuevo_usuario.nombre
            ),

            "username": (
                nuevo_usuario.username
            ),

            "roles": [
                rol.nombre
            ]
        }
    }