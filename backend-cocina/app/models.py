from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Table
from sqlalchemy.orm import relationship
from app.database import Base


usuario_roles = Table(
    "usuario_roles",
    Base.metadata,
    Column("usuario_id", Integer, ForeignKey("usuarios.id")),
    Column("rol_id", Integer, ForeignKey("roles.id"))
)


class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    descripcion = Column(String, nullable=True)

    usuarios = relationship(
        "Usuario",
        secondary=usuario_roles,
        back_populates="roles"
    )


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    activo = Column(Boolean, default=True)

    roles = relationship(
        "Rol",
        secondary=usuario_roles,
        back_populates="usuarios"
    )


class Mesa(Base):
    __tablename__ = "mesas"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, unique=True, nullable=False)
    estado = Column(String, default="Libre")


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    precio = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)
    disponible = Column(Boolean, default=True)


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    mesa = Column(Integer, nullable=False)
    mesero = Column(String, nullable=False)
    estado = Column(String, default="Pendiente")
    fecha = Column(DateTime, default=datetime.now)
    total = Column(Float, default=0)
    pagado = Column(Boolean, default=False)

    productos = relationship(
        "PedidoProducto",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )


class PedidoProducto(Base):
    __tablename__ = "pedido_productos"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True)

    nombre = Column(String, nullable=False)
    cantidad = Column(Integer, nullable=False)
    observaciones = Column(String, nullable=True)
    precio_unitario = Column(Float, default=0)

    pedido = relationship("Pedido", back_populates="productos")


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    mesa = Column(Integer, nullable=False)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String, nullable=False)
    pedido_ids = Column(String, nullable=False)
    fecha = Column(DateTime, default=datetime.now)