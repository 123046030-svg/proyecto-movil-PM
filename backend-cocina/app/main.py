from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.reportes import router as reportes_router

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
from app.routes.auth import router as auth_router


Base.metadata.create_all(bind=engine)


def obtener_o_crear_rol(
    db,
    nombre: str,
    descripcion: str
):
    rol = db.query(Rol).filter(Rol.nombre == nombre).first()

    if not rol:
        rol = Rol(
            nombre=nombre,
            descripcion=descripcion
        )
        db.add(rol)
        db.flush()
    else:
        rol.descripcion = descripcion

    return rol


def insertar_datos_iniciales():
    db = SessionLocal()

    try:
        roles = {
            "Administrador": obtener_o_crear_rol(
                db,
                "Administrador",
                "Acceso completo a la administración"
            ),
            "Mesero": obtener_o_crear_rol(
                db,
                "Mesero",
                "Puede consultar mesas y levantar pedidos"
            ),
            "Cocina": obtener_o_crear_rol(
                db,
                "Cocina",
                "Puede preparar y actualizar pedidos"
            ),
            "Caja": obtener_o_crear_rol(
                db,
                "Caja",
                "Puede consultar cuentas y registrar pagos"
            )
        }

        db.commit()

        # Eliminar únicamente las cuentas de demostración anteriores.
        usuarios_prueba = [
            ("carlos", "Carlos Pérez"),
            ("cocina", "Empleado Cocina"),
            ("caja", "Empleado Caja")
        ]

        for username, nombre in usuarios_prueba:
            usuario_prueba = (
                db.query(Usuario)
                .filter(
                    Usuario.username == username,
                    Usuario.nombre == nombre
                )
                .first()
            )

            if usuario_prueba:
                usuario_prueba.roles = []
                db.flush()
                db.delete(usuario_prueba)

        db.commit()

        # Crear o corregir la cuenta reservada del administrador.
        admin = (
            db.query(Usuario)
            .filter(Usuario.username == "admin")
            .first()
        )

        if not admin:
            admin = Usuario(
                nombre="Regina",
                username="admin",
                password="123456",
                edad=21,
                activo=True,
                roles=[roles["Administrador"]]
            )
            db.add(admin)
        else:
            admin.nombre = "Regina"
            admin.password = "123456"
            admin.activo = True
            admin.roles = [roles["Administrador"]]
            
            if admin.edad is None:
                admin.edad = 21

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
                Producto(
                    nombre="Hamburguesa",
                    precio=85,
                    categoria="Comida",
                    disponible=True
                ),
                Producto(
                    nombre="Papas fritas",
                    precio=45,
                    categoria="Comida",
                    disponible=True
                ),
                Producto(
                    nombre="Tacos",
                    precio=20,
                    categoria="Comida",
                    disponible=True
                ),
                Producto(
                    nombre="Ensalada",
                    precio=70,
                    categoria="Comida",
                    disponible=True
                ),
                Producto(
                    nombre="Refresco",
                    precio=28,
                    categoria="Bebida",
                    disponible=True
                ),
                Producto(
                    nombre="Agua de limón",
                    precio=25,
                    categoria="Bebida",
                    disponible=True
                ),
                Producto(
                    nombre="Café",
                    precio=35,
                    categoria="Bebida",
                    disponible=True
                ),
                Producto(
                    nombre="Pastel de chocolate",
                    precio=55,
                    categoria="Postre",
                    disponible=True
                )
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

            mesa4 = (
                db.query(Mesa)
                .filter(Mesa.numero == 4)
                .first()
            )

            mesa7 = (
                db.query(Mesa)
                .filter(Mesa.numero == 7)
                .first()
            )

            if mesa4:
                mesa4.estado = "Ocupada"

            if mesa7:
                mesa7.estado = "Ocupada"

            db.add_all([pedido1, pedido2])
            db.commit()

    finally:
        db.close()


insertar_datos_iniciales()


app = FastAPI(
    title="API CoffeReg",
    description=(
        "API para los módulos de Mesero, Cocina, "
        "Caja y Administración"
    ),
    version="1.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def inicio():
    return {
        "mensaje": "API de CoffeReg funcionando correctamente",
        "modulos": [
            "Mesero",
            "Cocina",
            "Caja",
            "Administración"
        ]
    }


app.include_router(auth_router)
app.include_router(mesero_router)
app.include_router(cocina_router)
app.include_router(caja_router)
app.include_router(admin_web_router)
app.include_router(reportes_router)