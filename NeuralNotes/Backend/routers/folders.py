from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, database

router = APIRouter(prefix="/folders", tags=["folders"])

@router.post("/", response_model=schemas.FolderOut)
def create_folder(folder: schemas.FolderCreate, db: Session = Depends(database.get_db)):
    return crud.create_folder(db, folder)

@router.get("/", response_model=list[schemas.FolderOut])
def list_folders(db: Session = Depends(database.get_db)):
    return crud.get_folders(db)

@router.put("/{folder_id}", response_model=schemas.FolderOut)
def update_folder(folder_id: int, folder: schemas.FolderUpdate, db: Session = Depends(database.get_db)):
    db_folder = crud.update_folder(db, folder_id, folder)
    if db_folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return db_folder

@router.delete("/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(database.get_db)):
    db_folder = crud.delete_folder(db, folder_id)
    if db_folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return {"detail": "Folder deleted successfully"}