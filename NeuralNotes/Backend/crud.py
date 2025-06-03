from sqlalchemy.orm import Session
import models, schemas
import security
from fastapi import HTTPException, status

def create_note(db: Session, note: schemas.NoteCreate, user_id: int):
    db_note = models.Note(**note.model_dump(), owner_id=user_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def create_folder(db: Session, folder: schemas.FolderCreate):
    db_folder = models.Folder(**folder.model_dump())
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

def get_folders(db: Session):
    return db.query(models.Folder).all()

def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def get_notes(db: Session, user_id: int):
    return db.query(models.Note).filter(models.Note.owner_id == user_id).all()

def update_note(db: Session, note_id: int, note: schemas.NoteUpdate):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        for key, value in note.model_dump(exclude_unset=True).items():
            setattr(db_note, key, value)
        db.commit()
        db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
    return db_note

def get_labels(db: Session):
    return db.query(models.Label).all()

def get_label(db: Session, label_id: int):
    return db.query(models.Label).filter(models.Label.id == label_id).first()

def create_label(db: Session, label: schemas.LabelBase):
    db_label = models.Label(**label.model_dump())
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    # Check if email already exists
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not security.verify_password(password, user.hashed_password):
        return False
    return user 