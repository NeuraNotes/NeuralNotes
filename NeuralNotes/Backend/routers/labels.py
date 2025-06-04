from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, database

router = APIRouter(prefix="/labels", tags=["labels"])

@router.get("/", response_model=list[schemas.LabelOut])
def list_labels(db: Session = Depends(database.get_db)):
    return crud.get_labels(db)

@router.post("/", response_model=schemas.LabelOut)
def create_label(label: schemas.LabelBase, db: Session = Depends(database.get_db)):
    return crud.create_label(db, label)

@router.delete("/{label_id}", response_model=schemas.LabelOut)
def delete_label(label_id: int, db: Session = Depends(database.get_db)):
    deleted = crud.delete_label(db, label_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Label not found")
    return deleted
