from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud, schemas, database

router = APIRouter(prefix="/folders", tags=["folders"])

@router.post("/", response_model=schemas.FolderOut)
def create_folder(folder: schemas.FolderCreate, db: Session = Depends(database.get_db)):
    return crud.create_folder(db, folder)

@router.get("/", response_model=list[schemas.FolderOut])
def list_folders(db: Session = Depends(database.get_db)):
    return crud.get_folders(db)