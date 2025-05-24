from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/labels", tags=["labels"])

@router.get("/", response_model=list[schemas.LabelOut])
def list_labels(db: Session = Depends(database.get_db)):
    return crud.get_labels(db)

@router.post("/", response_model=schemas.LabelOut)
def create_label(label: schemas.LabelBase, db: Session = Depends(database.get_db)):
    return crud.create_label(db, label) 