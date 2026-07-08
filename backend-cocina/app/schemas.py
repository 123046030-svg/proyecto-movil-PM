from datetime import datetime
from pydantic import BaseModel


# --------------------
# Productos / Mesas
# --------------------

class MesaOut(BaseModel):
    id: int
    numero: int
    estado: str


class ProductoCatalogoOut(BaseModel):
    id: int
    nombre: str
    precio: float
    categoria: str
    disponible: bool


# --------------------
# Pedidos
# --------------------

class ProductoOut(BaseModel):
    nombre: str
    cantidad: int
    observaciones: str | None = None


class ProductoPedidoOut(BaseModel):
    nombre: str
    cantidad: int
    observaciones: str | None = None
    precio_unitario: float


class PedidoResumenOut(BaseModel):
    id_pedido: int
    mesa: int
    mesero: str
    estado: str
    fecha: datetime
    total_productos: int


class PedidoDetalleOut(BaseModel):
    id_pedido: int
    mesa: int
    mesero: str
    estado: str
    fecha: datetime
    productos: list[ProductoOut]


class CambioEstadoOut(BaseModel):
    mensaje: str
    id_pedido: int
    estado: str


# --------------------
# Mesero
# --------------------

class PedidoItemIn(BaseModel):
    producto_id: int
    cantidad: int
    observaciones: str | None = None


class PedidoCreateIn(BaseModel):
    mesa: int
    mesero: str
    productos: list[PedidoItemIn]


class PedidoCreatedOut(BaseModel):
    mensaje: str
    id_pedido: int
    mesa: int
    estado: str
    total: float


class PedidoEstadoOut(BaseModel):
    id_pedido: int
    mesa: int
    estado: str


# --------------------
# Caja
# --------------------

class CuentaPedidoOut(BaseModel):
    id_pedido: int
    estado: str
    total: float
    productos: list[ProductoPedidoOut]


class CuentaOut(BaseModel):
    mesa: int
    pedidos: list[CuentaPedidoOut]
    total: float


class PagoIn(BaseModel):
    mesa: int
    metodo_pago: str


class PagoOut(BaseModel):
    mensaje: str
    id_venta: int
    mesa: int
    total: float
    metodo_pago: str
    pedidos_pagados: list[int]


class VentaOut(BaseModel):
    id_venta: int
    mesa: int
    total: float
    metodo_pago: str
    fecha: datetime
    pedido_ids: str


# --------------------
# Web Admin
# --------------------

class RolCreateIn(BaseModel):
    nombre: str
    descripcion: str | None = None


class RolOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None


class UsuarioCreateIn(BaseModel):
    nombre: str
    username: str
    password: str
    role_ids: list[int] = []


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    username: str
    activo: bool
    roles: list[str]


class UsuarioRolesIn(BaseModel):
    role_ids: list[int]


class EstadisticasOut(BaseModel):
    total_pedidos: int
    pedidos_pendientes: int
    pedidos_en_preparacion: int
    pedidos_listos: int
    pedidos_pagados: int
    total_ventas: int
    ingresos_totales: float
    total_productos: int
    mesas_ocupadas: int
    total_usuarios: int