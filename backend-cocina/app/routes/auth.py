from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Usuario
from app.schemas import LoginIn, LoginOut

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


@router.post("/login", response_model=LoginOut)
def login(data: LoginIn, db: Session = Depends(get_db)):

    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles))
        .filter(Usuario.username == data.username)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    if usuario.password != data.password:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail="El usuario está inactivo"
        )

    return {
        "mensaje": "Login correcto",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "username": usuario.username,
            "roles": [rol.nombre for rol in usuario.roles]
        }
    }