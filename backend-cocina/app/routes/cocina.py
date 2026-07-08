from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Pedido
from app.schemas import PedidoResumenOut, PedidoDetalleOut, CambioEstadoOut

router = APIRouter(
    prefix="/api/cocina",
    tags=["Cocina"]
)

# Endpoint para consultar pedidos pendientes
@router.get("/pedidos/pendientes", response_model=list[PedidoResumenOut])
def listar_pedidos_pendientes(db: Session = Depends(get_db)):

    pedidos = (
        db.query(Pedido)
        .options(joinedload(Pedido.productos))
        .filter(Pedido.estado.in_(["Pendiente", "En preparación"]))
        .order_by(Pedido.fecha.asc())
        .all()
    )

    resultado = []

    for pedido in pedidos:
        total_productos = sum(producto.cantidad for producto in pedido.productos)

        resultado.append({
            "id_pedido": pedido.id,
            "mesa": pedido.mesa,
            "mesero": pedido.mesero,
            "estado": pedido.estado,
            "fecha": pedido.fecha,
            "total_productos": total_productos
        })

    return resultado


# Endpoint para consultar el detalle de un pedido
@router.get("/pedidos/{pedido_id}", response_model=PedidoDetalleOut)
def obtener_detalle_pedido(pedido_id: int, db: Session = Depends(get_db)):

    pedido = (
        db.query(Pedido)
        .options(joinedload(Pedido.productos))
        .filter(Pedido.id == pedido_id)
        .first()
    )

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="El pedido no existe"
        )

    return {
        "id_pedido": pedido.id,
        "mesa": pedido.mesa,
        "mesero": pedido.mesero,
        "estado": pedido.estado,
        "fecha": pedido.fecha,
        "productos": [
            {
                "nombre": producto.nombre,
                "cantidad": producto.cantidad,
                "observaciones": producto.observaciones
            }
            for producto in pedido.productos
        ]
    }


# Endpoint para cambiar el pedido a En preparación
@router.patch("/pedidos/{pedido_id}/en-preparacion", response_model=CambioEstadoOut)
def cambiar_a_en_preparacion(pedido_id: int, db: Session = Depends(get_db)):

    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="El pedido no existe"
        )

    if pedido.estado == "Listo":
        raise HTTPException(
            status_code=400,
            detail="No se puede modificar un pedido que ya está listo"
        )

    pedido.estado = "En preparación"
    db.commit()
    db.refresh(pedido)

    return {
        "mensaje": "El pedido fue cambiado a En preparación",
        "id_pedido": pedido.id,
        "estado": pedido.estado
    }


# Endpoint para marcar el pedido como Listo
@router.patch("/pedidos/{pedido_id}/listo", response_model=CambioEstadoOut)
def marcar_como_listo(pedido_id: int, db: Session = Depends(get_db)):

    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="El pedido no existe"
        )

    if pedido.estado == "Listo":
        raise HTTPException(
            status_code=400,
            detail="El pedido ya se encuentra marcado como Listo"
        )

    pedido.estado = "Listo"
    db.commit()
    db.refresh(pedido)

    return {
        "mensaje": "El pedido fue marcado como Listo",
        "id_pedido": pedido.id,
        "estado": pedido.estado
    }