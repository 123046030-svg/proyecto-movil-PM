from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models import Usuario, Rol, Pedido, Producto, Mesa, Venta
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


@router.get("/roles", response_model=list[RolOut])
def listar_roles(db: Session = Depends(get_db)):

    roles = db.query(Rol).order_by(Rol.id.asc()).all()

    return [
        {
            "id": rol.id,
            "nombre": rol.nombre,
            "descripcion": rol.descripcion
        }
        for rol in roles
    ]


@router.post("/roles", response_model=RolOut)
def crear_rol(data: RolCreateIn, db: Session = Depends(get_db)):

    rol_existente = db.query(Rol).filter(Rol.nombre == data.nombre).first()

    if rol_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un rol con ese nombre"
        )

    rol = Rol(
        nombre=data.nombre,
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


@router.get("/usuarios", response_model=list[UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db)):

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
            "activo": usuario.activo,
            "roles": [rol.nombre for rol in usuario.roles]
        }
        for usuario in usuarios
    ]


@router.post("/usuarios", response_model=UsuarioOut)
def crear_usuario(data: UsuarioCreateIn, db: Session = Depends(get_db)):

    usuario_existente = db.query(Usuario).filter(Usuario.username == data.username).first()

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con ese username"
        )

    roles = db.query(Rol).filter(Rol.id.in_(data.role_ids)).all()

    usuario = Usuario(
        nombre=data.nombre,
        username=data.username,
        password=data.password,
        activo=True,
        roles=roles
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "username": usuario.username,
        "activo": usuario.activo,
        "roles": [rol.nombre for rol in usuario.roles]
    }


@router.patch("/usuarios/{usuario_id}/roles", response_model=UsuarioOut)
def actualizar_roles_usuario(
    usuario_id: int,
    data: UsuarioRolesIn,
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles))
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe"
        )

    roles = db.query(Rol).filter(Rol.id.in_(data.role_ids)).all()

    usuario.roles = roles

    db.commit()
    db.refresh(usuario)

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "username": usuario.username,
        "activo": usuario.activo,
        "roles": [rol.nombre for rol in usuario.roles]
    }


@router.get("/estadisticas", response_model=EstadisticasOut)
def obtener_estadisticas(db: Session = Depends(get_db)):

    ingresos = db.query(func.sum(Venta.total)).scalar()

    return {
        "total_pedidos": db.query(Pedido).count(),
        "pedidos_pendientes": db.query(Pedido).filter(Pedido.estado == "Pendiente").count(),
        "pedidos_en_preparacion": db.query(Pedido).filter(Pedido.estado == "En preparación").count(),
        "pedidos_listos": db.query(Pedido).filter(Pedido.estado == "Listo").count(),
        "pedidos_pagados": db.query(Pedido).filter(Pedido.estado == "Pagado").count(),
        "total_ventas": db.query(Venta).count(),
        "ingresos_totales": float(ingresos or 0),
        "total_productos": db.query(Producto).count(),
        "mesas_ocupadas": db.query(Mesa).filter(Mesa.estado == "Ocupada").count(),
        "total_usuarios": db.query(Usuario).count()
    }