from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Mesa, Producto, Pedido, PedidoProducto
from app.schemas import (
    MesaOut,
    ProductoCatalogoOut,
    PedidoCreateIn,
    PedidoCreatedOut,
    PedidoEstadoOut,
    PedidoResumenOut
)

router = APIRouter(
    prefix="/api/mesero",
    tags=["Mesero"]
)


@router.get("/mesas", response_model=list[MesaOut])
def listar_mesas(db: Session = Depends(get_db)):
    mesas = db.query(Mesa).order_by(Mesa.numero.asc()).all()

    return [
        {
            "id": mesa.id,
            "numero": mesa.numero,
            "estado": mesa.estado
        }
        for mesa in mesas
    ]


@router.get("/productos", response_model=list[ProductoCatalogoOut])
def listar_productos(db: Session = Depends(get_db)):
    productos = (
        db.query(Producto)
        .filter(Producto.disponible == True)
        .order_by(Producto.categoria.asc(), Producto.nombre.asc())
        .all()
    )

    return [
        {
            "id": producto.id,
            "nombre": producto.nombre,
            "precio": producto.precio,
            "categoria": producto.categoria,
            "disponible": producto.disponible
        }
        for producto in productos
    ]


@router.post("/pedidos", response_model=PedidoCreatedOut)
def levantar_pedido(data: PedidoCreateIn, db: Session = Depends(get_db)):

    if not data.productos:
        raise HTTPException(
            status_code=400,
            detail="El pedido debe tener al menos un producto"
        )

    mesa = db.query(Mesa).filter(Mesa.numero == data.mesa).first()

    if not mesa:
        raise HTTPException(
            status_code=404,
            detail="La mesa no existe"
        )

    pedido = Pedido(
        mesa=data.mesa,
        mesero=data.mesero,
        estado="Pendiente",
        total=0,
        pagado=False
    )

    db.add(pedido)
    db.flush()

    total = 0

    for item in data.productos:
        if item.cantidad <= 0:
            raise HTTPException(
                status_code=400,
                detail="La cantidad debe ser mayor a cero"
            )

        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()

        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"El producto con id {item.producto_id} no existe"
            )

        if not producto.disponible:
            raise HTTPException(
                status_code=400,
                detail=f"El producto {producto.nombre} no está disponible"
            )

        subtotal = producto.precio * item.cantidad
        total += subtotal

        detalle = PedidoProducto(
            pedido_id=pedido.id,
            producto_id=producto.id,
            nombre=producto.nombre,
            cantidad=item.cantidad,
            observaciones=item.observaciones,
            precio_unitario=producto.precio
        )

        db.add(detalle)

    pedido.total = round(total, 2)
    mesa.estado = "Ocupada"

    db.commit()
    db.refresh(pedido)

    return {
        "mensaje": "Pedido enviado correctamente a cocina",
        "id_pedido": pedido.id,
        "mesa": pedido.mesa,
        "estado": pedido.estado,
        "total": pedido.total
    }


@router.get("/pedidos/{pedido_id}/estado", response_model=PedidoEstadoOut)
def consultar_estado_pedido(pedido_id: int, db: Session = Depends(get_db)):

    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="El pedido no existe"
        )

    return {
        "id_pedido": pedido.id,
        "mesa": pedido.mesa,
        "estado": pedido.estado
    }


@router.get("/pedidos/mesa/{mesa}", response_model=list[PedidoResumenOut])
def consultar_pedidos_por_mesa(mesa: int, db: Session = Depends(get_db)):

    pedidos = (
        db.query(Pedido)
        .options(joinedload(Pedido.productos))
        .filter(Pedido.mesa == mesa)
        .order_by(Pedido.fecha.desc())
        .all()
    )

    return [
        {
            "id_pedido": pedido.id,
            "mesa": pedido.mesa,
            "mesero": pedido.mesero,
            "estado": pedido.estado,
            "fecha": pedido.fecha,
            "total_productos": sum(producto.cantidad for producto in pedido.productos)
        }
        for pedido in pedidos
    ]