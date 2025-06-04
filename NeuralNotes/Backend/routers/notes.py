from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, database

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("/", response_model=schemas.NoteOut)
def create_note(note: schemas.NoteCreate, db: Session = Depends(database.get_db)):
    # Use the updated create_note function that handles folder_ids
    # For demo, use user_id=1
    return crud.create_note(db, note, user_id=1)

@router.get("/", response_model=list[schemas.NoteOut])
def list_notes(db: Session = Depends(database.get_db)):
    # Use the updated get_notes function that loads folders and labels
    # For demo, use user_id=1
    return crud.get_notes(db, user_id=1)

@router.get("/by_folder/{folder_id}", response_model=list[schemas.NoteOut])
def list_notes_by_folder(folder_id: int, db: Session = Depends(database.get_db)):
    # Use the updated get_notes_by_folder function that loads folders and labels
    notes = crud.get_notes_by_folder(db, folder_id)
    return notes

@router.get("/{note_id}", response_model=schemas.NoteOut)
def get_note(note_id: int, db: Session = Depends(database.get_db)):
    # Use the updated get_note function that loads folders and labels
    note = crud.get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(note_id: int, note: schemas.NoteUpdate, db: Session = Depends(database.get_db)):
    # Use the updated update_note function that handles folder_ids
    updated = crud.update_note(db, note_id, note)
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found")
    return updated

@router.delete("/{note_id}", response_model=schemas.NoteOut)
def delete_note(note_id: int, db: Session = Depends(database.get_db)):
    deleted = crud.delete_note(db, note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
    return deleted 