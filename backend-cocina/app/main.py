from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.models import (
    Rol,
    Usuario,
    Mesa,
    Producto,
    Pedido,
    PedidoProducto
)

from app.routes.cocina import router as cocina_router
from app.routes.mesero import router as mesero_router
from app.routes.caja import router as caja_router
from app.routes.admin_web import router as admin_web_router


Base.metadata.create_all(bind=engine)


def insertar_datos_prueba():
    db = SessionLocal()

    try:
        if db.query(Rol).count() == 0:
            rol_admin = Rol(nombre="Administrador", descripcion="Acceso a gestión web")
            rol_mesero = Rol(nombre="Mesero", descripcion="Puede levantar pedidos")
            rol_cocina = Rol(nombre="Cocina", descripcion="Puede preparar pedidos")
            rol_caja = Rol(nombre="Caja", descripcion="Puede cobrar cuentas")

            db.add_all([rol_admin, rol_mesero, rol_cocina, rol_caja])
            db.commit()

        if db.query(Usuario).count() == 0:
            admin = db.query(Rol).filter(Rol.nombre == "Administrador").first()
            mesero = db.query(Rol).filter(Rol.nombre == "Mesero").first()
            cocina = db.query(Rol).filter(Rol.nombre == "Cocina").first()
            caja = db.query(Rol).filter(Rol.nombre == "Caja").first()

            usuarios = [
                Usuario(
                    nombre="Administrador Principal",
                    username="admin",
                    password="123456",
                    roles=[admin]
                ),
                Usuario(
                    nombre="Carlos Pérez",
                    username="carlos",
                    password="123456",
                    roles=[mesero]
                ),
                Usuario(
                    nombre="Empleado Cocina",
                    username="cocina",
                    password="123456",
                    roles=[cocina]
                ),
                Usuario(
                    nombre="Empleado Caja",
                    username="caja",
                    password="123456",
                    roles=[caja]
                )
            ]

            db.add_all(usuarios)
            db.commit()

        if db.query(Mesa).count() == 0:
            mesas = [
                Mesa(numero=1, estado="Libre"),
                Mesa(numero=2, estado="Libre"),
                Mesa(numero=3, estado="Libre"),
                Mesa(numero=4, estado="Libre"),
                Mesa(numero=5, estado="Libre"),
                Mesa(numero=6, estado="Libre"),
                Mesa(numero=7, estado="Libre"),
                Mesa(numero=8, estado="Libre")
            ]

            db.add_all(mesas)
            db.commit()

        if db.query(Producto).count() == 0:
            productos = [
                Producto(nombre="Hamburguesa", precio=85, categoria="Comida", disponible=True),
                Producto(nombre="Papas fritas", precio=45, categoria="Comida", disponible=True),
                Producto(nombre="Tacos", precio=20, categoria="Comida", disponible=True),
                Producto(nombre="Ensalada", precio=70, categoria="Comida", disponible=True),
                Producto(nombre="Refresco", precio=28, categoria="Bebida", disponible=True),
                Producto(nombre="Agua de limón", precio=25, categoria="Bebida", disponible=True),
                Producto(nombre="Café", precio=35, categoria="Bebida", disponible=True),
                Producto(nombre="Pastel de chocolate", precio=55, categoria="Postre", disponible=True)
            ]

            db.add_all(productos)
            db.commit()

        if db.query(Pedido).count() == 0:
            pedido1 = Pedido(
                mesa=4,
                mesero="Carlos Pérez",
                estado="Pendiente",
                total=215,
                pagado=False
            )

            pedido1.productos = [
                PedidoProducto(
                    producto_id=1,
                    nombre="Hamburguesa",
                    cantidad=2,
                    observaciones="Sin cebolla",
                    precio_unitario=85
                ),
                PedidoProducto(
                    producto_id=2,
                    nombre="Papas fritas",
                    cantidad=1,
                    observaciones="Extra queso",
                    precio_unitario=45
                )
            ]

            pedido2 = Pedido(
                mesa=7,
                mesero="Ana López",
                estado="Pendiente",
                total=110,
                pagado=False
            )

            pedido2.productos = [
                PedidoProducto(
                    producto_id=3,
                    nombre="Tacos",
                    cantidad=3,
                    observaciones="Con poca salsa",
                    precio_unitario=20
                ),
                PedidoProducto(
                    producto_id=6,
                    nombre="Agua de limón",
                    cantidad=2,
                    observaciones="Sin hielo",
                    precio_unitario=25
                )
            ]

            mesa4 = db.query(Mesa).filter(Mesa.numero == 4).first()
            mesa7 = db.query(Mesa).filter(Mesa.numero == 7).first()

            if mesa4:
                mesa4.estado = "Ocupada"

            if mesa7:
                mesa7.estado = "Ocupada"

            db.add_all([pedido1, pedido2])
            db.commit()

    finally:
        db.close()


insertar_datos_prueba()


app = FastAPI(
    title="API Restaurante - Proyecto Móvil",
    description="API para módulos de Mesero, Cocina, Caja y Web Administrativa",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def inicio():
    return {
        "mensaje": "API del restaurante funcionando correctamente",
        "modulos": [
            "Mesero",
            "Cocina",
            "Caja",
            "Web Administrativa"
        ]
    }


app.include_router(mesero_router)
app.include_router(cocina_router)
app.include_router(caja_router)
app.include_router(admin_web_router)