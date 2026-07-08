from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Pedido, Venta, Mesa
from app.schemas import CuentaOut, PagoIn, PagoOut, VentaOut

router = APIRouter(
    prefix="/api/caja",
    tags=["Caja"]
)


@router.get("/cuentas/{mesa}", response_model=CuentaOut)
def consultar_cuenta(mesa: int, db: Session = Depends(get_db)):

    pedidos = (
        db.query(Pedido)
        .options(joinedload(Pedido.productos))
        .filter(Pedido.mesa == mesa, Pedido.pagado == False)
        .order_by(Pedido.fecha.asc())
        .all()
    )

    total = sum(pedido.total for pedido in pedidos)

    return {
        "mesa": mesa,
        "pedidos": [
            {
                "id_pedido": pedido.id,
                "estado": pedido.estado,
                "total": pedido.total,
                "productos": [
                    {
                        "nombre": producto.nombre,
                        "cantidad": producto.cantidad,
                        "observaciones": producto.observaciones,
                        "precio_unitario": producto.precio_unitario
                    }
                    for producto in pedido.productos
                ]
            }
            for pedido in pedidos
        ],
        "total": round(total, 2)
    }


@router.post("/pagos", response_model=PagoOut)
def registrar_pago(data: PagoIn, db: Session = Depends(get_db)):

    pedidos = (
        db.query(Pedido)
        .filter(Pedido.mesa == data.mesa, Pedido.pagado == False)
        .all()
    )

    if not pedidos:
        raise HTTPException(
            status_code=404,
            detail="No hay pedidos pendientes de pago para esta mesa"
        )

    pedidos_no_listos = [
        pedido.id for pedido in pedidos
        if pedido.estado != "Listo"
    ]

    if pedidos_no_listos:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede cobrar. Hay pedidos que todavía no están listos: {pedidos_no_listos}"
        )

    total = round(sum(pedido.total for pedido in pedidos), 2)
    pedido_ids = [pedido.id for pedido in pedidos]

    venta = Venta(
        mesa=data.mesa,
        total=total,
        metodo_pago=data.metodo_pago,
        pedido_ids=",".join(str(id_pedido) for id_pedido in pedido_ids)
    )

    db.add(venta)

    for pedido in pedidos:
        pedido.pagado = True
        pedido.estado = "Pagado"

    mesa = db.query(Mesa).filter(Mesa.numero == data.mesa).first()
    if mesa:
        mesa.estado = "Libre"

    db.commit()
    db.refresh(venta)

    return {
        "mensaje": "Pago registrado correctamente",
        "id_venta": venta.id,
        "mesa": venta.mesa,
        "total": venta.total,
        "metodo_pago": venta.metodo_pago,
        "pedidos_pagados": pedido_ids
    }


@router.get("/ventas", response_model=list[VentaOut])
def listar_ventas(db: Session = Depends(get_db)):

    ventas = db.query(Venta).order_by(Venta.fecha.desc()).all()

    return [
        {
            "id_venta": venta.id,
            "mesa": venta.mesa,
            "total": venta.total,
            "metodo_pago": venta.metodo_pago,
            "fecha": venta.fecha,
            "pedido_ids": venta.pedido_ids
        }
        for venta in ventas
    ]