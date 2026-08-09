from datetime import datetime
from io import BytesIO
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.database import get_db
from app.models import (
    Usuario,
    Mesa,
    Producto,
    Pedido,
    Venta,
)


router = APIRouter(
    prefix="/api/reportes",
    tags=["Reportes PDF"],
)


ROSA_OSCURO = colors.HexColor("#8F3658")
ROSA_PRINCIPAL = colors.HexColor("#D75F8A")
ROSA_CLARO = colors.HexColor("#FDE8F0")
ROSA_BORDE = colors.HexColor("#EFC3D3")
BLANCO_ROSA = colors.HexColor("#FFFAFB")
GRIS_TEXTO = colors.HexColor("#75505F")


styles = getSampleStyleSheet()

ESTILO_TITULO = ParagraphStyle(
    name="TituloCoffeReg",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=26,
    alignment=TA_CENTER,
    textColor=ROSA_OSCURO,
    spaceAfter=8,
)

ESTILO_SUBTITULO = ParagraphStyle(
    name="SubtituloCoffeReg",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=14,
    leading=18,
    textColor=ROSA_OSCURO,
    spaceBefore=8,
    spaceAfter=8,
)

ESTILO_TEXTO = ParagraphStyle(
    name="TextoCoffeReg",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9,
    leading=12,
    textColor=GRIS_TEXTO,
)

ESTILO_CELDA = ParagraphStyle(
    name="CeldaCoffeReg",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8,
    leading=10,
    textColor=GRIS_TEXTO,
)

ESTILO_CELDA_CENTRADA = ParagraphStyle(
    name="CeldaCentrada",
    parent=ESTILO_CELDA,
    alignment=TA_CENTER,
)

ESTILO_ENCABEZADO_TABLA = ParagraphStyle(
    name="EncabezadoTabla",
    parent=styles["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=8,
    leading=10,
    alignment=TA_CENTER,
    textColor=colors.white,
)


def texto_seguro(valor):
    if valor is None:
        return ""

    return escape(str(valor))


def fecha_texto(fecha):
    if not fecha:
        return "Sin fecha"

    return fecha.strftime("%d/%m/%Y %H:%M")


def dinero(valor):
    return f"${float(valor or 0):,.2f}"


def parrafo(valor, estilo=ESTILO_CELDA):
    return Paragraph(texto_seguro(valor), estilo)


def encabezado_tabla(valor):
    return Paragraph(texto_seguro(valor), ESTILO_ENCABEZADO_TABLA)


def estilo_tabla():
    return TableStyle(
        [
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                ROSA_PRINCIPAL,
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white,
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold",
            ),
            (
                "BACKGROUND",
                (0, 1),
                (-1, -1),
                BLANCO_ROSA,
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                ROSA_BORDE,
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE",
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "ROWBACKGROUNDS",
                (0, 1),
                (-1, -1),
                [
                    BLANCO_ROSA,
                    ROSA_CLARO,
                ],
            ),
        ]
    )


def pie_pagina(canvas, documento):
    canvas.saveState()

    ancho, _ = documento.pagesize

    canvas.setStrokeColor(ROSA_BORDE)
    canvas.line(
        1.5 * cm,
        1.05 * cm,
        ancho - 1.5 * cm,
        1.05 * cm,
    )

    canvas.setFillColor(ROSA_OSCURO)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(
        1.5 * cm,
        0.65 * cm,
        "CoffeReg",
    )

    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(
        ancho - 1.5 * cm,
        0.65 * cm,
        f"Página {documento.page}",
    )

    canvas.restoreState()


def respuesta_pdf(buffer, nombre_archivo):
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'inline; filename="{nombre_archivo}"'
            )
        },
    )


def crear_documento(buffer, horizontal=False):
    tamanio = landscape(letter) if horizontal else letter

    return SimpleDocTemplate(
        buffer,
        pagesize=tamanio,
        rightMargin=1.4 * cm,
        leftMargin=1.4 * cm,
        topMargin=1.4 * cm,
        bottomMargin=1.5 * cm,
        title="Reporte CoffeReg",
        author="CoffeReg",
    )


def titulo_reporte(nombre):
    return [
        Paragraph("CoffeReg", ESTILO_TITULO),
        Paragraph(nombre, ESTILO_SUBTITULO),
        Paragraph(
            (
                "Fecha de generación: "
                f"{datetime.now().strftime('%d/%m/%Y %H:%M')}"
            ),
            ESTILO_TEXTO,
        ),
        Spacer(1, 12),
    ]


@router.get("/general/pdf")
def reporte_general(db: Session = Depends(get_db)):
    buffer = BytesIO()
    documento = crear_documento(buffer)

    total_pedidos = db.query(Pedido).count()

    pedidos_pendientes = (
        db.query(Pedido)
        .filter(Pedido.estado == "Pendiente")
        .count()
    )

    pedidos_preparacion = (
        db.query(Pedido)
        .filter(Pedido.estado == "En preparación")
        .count()
    )

    pedidos_listos = (
        db.query(Pedido)
        .filter(Pedido.estado == "Listo")
        .count()
    )

    pedidos_pagados = (
        db.query(Pedido)
        .filter(Pedido.estado == "Pagado")
        .count()
    )

    total_ventas = db.query(Venta).count()
    ingresos = db.query(func.sum(Venta.total)).scalar() or 0

    total_productos = db.query(Producto).count()

    mesas_ocupadas = (
        db.query(Mesa)
        .filter(Mesa.estado == "Ocupada")
        .count()
    )

    total_usuarios = db.query(Usuario).count()

    contenido = titulo_reporte(
        "Reporte general del restaurante"
    )

    datos_resumen = [
        [
            encabezado_tabla("Indicador"),
            encabezado_tabla("Resultado"),
        ],
        [
            parrafo("Total de pedidos"),
            parrafo(
                total_pedidos,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Pedidos pendientes"),
            parrafo(
                pedidos_pendientes,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Pedidos en preparación"),
            parrafo(
                pedidos_preparacion,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Pedidos listos"),
            parrafo(
                pedidos_listos,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Pedidos pagados"),
            parrafo(
                pedidos_pagados,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Ventas registradas"),
            parrafo(
                total_ventas,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Ingresos totales"),
            parrafo(
                dinero(ingresos),
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Productos registrados"),
            parrafo(
                total_productos,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Mesas ocupadas"),
            parrafo(
                mesas_ocupadas,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
        [
            parrafo("Usuarios registrados"),
            parrafo(
                total_usuarios,
                ESTILO_CELDA_CENTRADA,
            ),
        ],
    ]

    tabla_resumen = Table(
        datos_resumen,
        colWidths=[
            11 * cm,
            5 * cm,
        ],
        repeatRows=1,
    )

    tabla_resumen.setStyle(estilo_tabla())

    contenido.append(tabla_resumen)
    contenido.append(Spacer(1, 18))

    ultimas_ventas = (
        db.query(Venta)
        .order_by(Venta.fecha.desc())
        .limit(10)
        .all()
    )

    contenido.append(
        Paragraph(
            "Últimas ventas registradas",
            ESTILO_SUBTITULO,
        )
    )

    datos_ventas = [
        [
            encabezado_tabla("Venta"),
            encabezado_tabla("Mesa"),
            encabezado_tabla("Total"),
            encabezado_tabla("Método"),
            encabezado_tabla("Fecha"),
        ]
    ]

    if not ultimas_ventas:
        datos_ventas.append(
            [
                parrafo("Sin ventas registradas"),
                "",
                "",
                "",
                "",
            ]
        )
    else:
        for venta in ultimas_ventas:
            datos_ventas.append(
                [
                    parrafo(venta.id),
                    parrafo(venta.mesa),
                    parrafo(dinero(venta.total)),
                    parrafo(venta.metodo_pago),
                    parrafo(fecha_texto(venta.fecha)),
                ]
            )

    tabla_ventas = Table(
        datos_ventas,
        colWidths=[
            2.2 * cm,
            2.2 * cm,
            3.2 * cm,
            3.5 * cm,
            5.2 * cm,
        ],
        repeatRows=1,
    )

    tabla_ventas.setStyle(estilo_tabla())

    contenido.append(tabla_ventas)

    documento.build(
        contenido,
        onFirstPage=pie_pagina,
        onLaterPages=pie_pagina,
    )

    return respuesta_pdf(
        buffer,
        "reporte_general_coffereg.pdf",
    )


@router.get("/ventas/pdf")
def reporte_ventas(db: Session = Depends(get_db)):
    buffer = BytesIO()
    documento = crear_documento(
        buffer,
        horizontal=True,
    )

    ventas = (
        db.query(Venta)
        .order_by(Venta.fecha.desc())
        .all()
    )

    ingresos = db.query(func.sum(Venta.total)).scalar() or 0

    contenido = titulo_reporte(
        "Reporte de ventas"
    )

    contenido.append(
        Paragraph(
            (
                f"Ventas registradas: {len(ventas)}"
                f" | Ingresos totales: {dinero(ingresos)}"
            ),
            ESTILO_TEXTO,
        )
    )

    contenido.append(Spacer(1, 12))

    datos = [
        [
            encabezado_tabla("Venta"),
            encabezado_tabla("Mesa"),
            encabezado_tabla("Total"),
            encabezado_tabla("Método de pago"),
            encabezado_tabla("Pedidos"),
            encabezado_tabla("Fecha"),
        ]
    ]

    if not ventas:
        datos.append(
            [
                parrafo("Sin ventas registradas"),
                "",
                "",
                "",
                "",
                "",
            ]
        )
    else:
        for venta in ventas:
            datos.append(
                [
                    parrafo(venta.id),
                    parrafo(venta.mesa),
                    parrafo(dinero(venta.total)),
                    parrafo(venta.metodo_pago),
                    parrafo(venta.pedido_ids),
                    parrafo(fecha_texto(venta.fecha)),
                ]
            )

    tabla = Table(
        datos,
        colWidths=[
            2.2 * cm,
            2.2 * cm,
            3.2 * cm,
            4.2 * cm,
            5.2 * cm,
            5.2 * cm,
        ],
        repeatRows=1,
    )

    tabla.setStyle(estilo_tabla())
    contenido.append(tabla)

    documento.build(
        contenido,
        onFirstPage=pie_pagina,
        onLaterPages=pie_pagina,
    )

    return respuesta_pdf(
        buffer,
        "reporte_ventas_coffereg.pdf",
    )


@router.get("/pedidos/pdf")
def reporte_pedidos(db: Session = Depends(get_db)):
    buffer = BytesIO()
    documento = crear_documento(
        buffer,
        horizontal=True,
    )

    pedidos = (
        db.query(Pedido)
        .options(joinedload(Pedido.productos))
        .order_by(Pedido.fecha.desc())
        .all()
    )

    contenido = titulo_reporte(
        "Reporte de pedidos"
    )

    datos = [
        [
            encabezado_tabla("Pedido"),
            encabezado_tabla("Mesa"),
            encabezado_tabla("Mesero"),
            encabezado_tabla("Estado"),
            encabezado_tabla("Total"),
            encabezado_tabla("Pagado"),
            encabezado_tabla("Productos"),
            encabezado_tabla("Fecha"),
        ]
    ]

    if not pedidos:
        datos.append(
            [
                parrafo("Sin pedidos registrados"),
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ]
        )
    else:
        for pedido in pedidos:
            productos = []

            for producto in pedido.productos:
                productos.append(
                    (
                        f"{producto.cantidad} x "
                        f"{producto.nombre}"
                    )
                )

            texto_productos = (
                "<br/>".join(
                    escape(producto)
                    for producto in productos
                )
                if productos
                else "Sin productos"
            )

            datos.append(
                [
                    parrafo(pedido.id),
                    parrafo(pedido.mesa),
                    parrafo(pedido.mesero),
                    parrafo(pedido.estado),
                    parrafo(dinero(pedido.total)),
                    parrafo(
                        "Sí" if pedido.pagado else "No"
                    ),
                    Paragraph(
                        texto_productos,
                        ESTILO_CELDA,
                    ),
                    parrafo(fecha_texto(pedido.fecha)),
                ]
            )

    tabla = Table(
        datos,
        colWidths=[
            1.8 * cm,
            1.6 * cm,
            3.2 * cm,
            3.1 * cm,
            2.5 * cm,
            1.8 * cm,
            6.4 * cm,
            4.2 * cm,
        ],
        repeatRows=1,
    )

    tabla.setStyle(estilo_tabla())
    contenido.append(tabla)

    documento.build(
        contenido,
        onFirstPage=pie_pagina,
        onLaterPages=pie_pagina,
    )

    return respuesta_pdf(
        buffer,
        "reporte_pedidos_coffereg.pdf",
    )


@router.get("/productos/pdf")
def reporte_productos(db: Session = Depends(get_db)):
    buffer = BytesIO()
    documento = crear_documento(buffer)

    productos = (
        db.query(Producto)
        .order_by(
            Producto.categoria.asc(),
            Producto.nombre.asc(),
        )
        .all()
    )

    contenido = titulo_reporte(
        "Reporte de productos"
    )

    datos = [
        [
            encabezado_tabla("ID"),
            encabezado_tabla("Producto"),
            encabezado_tabla("Categoría"),
            encabezado_tabla("Precio"),
            encabezado_tabla("Disponibilidad"),
        ]
    ]

    if not productos:
        datos.append(
            [
                parrafo("Sin productos registrados"),
                "",
                "",
                "",
                "",
            ]
        )
    else:
        for producto in productos:
            datos.append(
                [
                    parrafo(producto.id),
                    parrafo(producto.nombre),
                    parrafo(producto.categoria),
                    parrafo(dinero(producto.precio)),
                    parrafo(
                        (
                            "Disponible"
                            if producto.disponible
                            else "No disponible"
                        )
                    ),
                ]
            )

    tabla = Table(
        datos,
        colWidths=[
            1.5 * cm,
            6.2 * cm,
            3.8 * cm,
            2.8 * cm,
            3.7 * cm,
        ],
        repeatRows=1,
    )

    tabla.setStyle(estilo_tabla())
    contenido.append(tabla)

    documento.build(
        contenido,
        onFirstPage=pie_pagina,
        onLaterPages=pie_pagina,
    )

    return respuesta_pdf(
        buffer,
        "reporte_productos_coffereg.pdf",
    )