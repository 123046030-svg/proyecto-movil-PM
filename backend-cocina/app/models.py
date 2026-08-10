from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float,
    Boolean,
    Table,
)

from sqlalchemy.orm import relationship

from app.database import Base


# ==========================================================
# TABLA INTERMEDIA: USUARIOS - ROLES
# ==========================================================

usuario_roles = Table(
    "usuario_roles",
    Base.metadata,

    Column(
        "usuario_id",
        Integer,
        ForeignKey(
            "usuarios.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    ),

    Column(
        "rol_id",
        Integer,
        ForeignKey(
            "roles.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )
)


# ==========================================================
# ROLES
# ==========================================================

class Rol(Base):
    __tablename__ = "roles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String,
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String,
        nullable=True
    )

    usuarios = relationship(
        "Usuario",
        secondary=usuario_roles,
        back_populates="roles"
    )


# ==========================================================
# USUARIOS
# ==========================================================

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String,
        nullable=False
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    edad = Column(
        Integer,
        nullable=False,
        default=18
    )

    activo = Column(
        Boolean,
        default=True,
        nullable=False
    )

    roles = relationship(
        "Rol",
        secondary=usuario_roles,
        back_populates="usuarios"
    )


# ==========================================================
# MESAS
# ==========================================================

class Mesa(Base):
    __tablename__ = "mesas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    numero = Column(
        Integer,
        unique=True,
        nullable=False
    )

    estado = Column(
        String,
        default="Libre",
        nullable=False
    )


# ==========================================================
# PRODUCTOS
# ==========================================================

class Producto(Base):
    __tablename__ = "productos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String,
        nullable=False
    )

    precio = Column(
        Float,
        nullable=False
    )

    categoria = Column(
        String,
        nullable=False
    )

    disponible = Column(
        Boolean,
        default=True,
        nullable=False
    )


# ==========================================================
# PEDIDOS
# ==========================================================

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    mesa = Column(
        Integer,
        nullable=False
    )

    mesero = Column(
        String,
        nullable=False
    )

    estado = Column(
        String,
        default="Pendiente",
        nullable=False
    )

    fecha = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    total = Column(
        Float,
        default=0,
        nullable=False
    )

    pagado = Column(
        Boolean,
        default=False,
        nullable=False
    )

    productos = relationship(
        "PedidoProducto",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )


# ==========================================================
# PRODUCTOS DE CADA PEDIDO
# ==========================================================

class PedidoProducto(Base):
    __tablename__ = "pedido_productos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    pedido_id = Column(
        Integer,
        ForeignKey(
            "pedidos.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    producto_id = Column(
        Integer,
        ForeignKey(
            "productos.id"
        ),
        nullable=True
    )

    nombre = Column(
        String,
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    observaciones = Column(
        String,
        nullable=True
    )

    precio_unitario = Column(
        Float,
        default=0,
        nullable=False
    )

    pedido = relationship(
        "Pedido",
        back_populates="productos"
    )


# ==========================================================
# VENTAS
# ==========================================================

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    mesa = Column(
        Integer,
        nullable=False
    )

    total = Column(
        Float,
        nullable=False
    )

    metodo_pago = Column(
        String,
        nullable=False
    )

    pedido_ids = Column(
        String,
        nullable=False
    )

    fecha = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )