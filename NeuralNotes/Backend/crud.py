from sqlalchemy.orm import Session, joinedload
import models, schemas
import security
from fastapi import HTTPException, status

def create_note(db: Session, note: schemas.NoteCreate, user_id: int):
    # Extract folder_ids before creating the note object
    folder_ids = note.folder_ids
    # Create the note object without folder_ids
    db_note = models.Note(
        title=note.title,
        content=note.content,
        label_id=note.label_id,
        owner_id=user_id
    )
    db.add(db_note)
    db.flush() # Flush to get the note id

    # Associate note with folders
    for folder_id in folder_ids:
        folder = db.query(models.Folder).filter(models.Folder.id == folder_id).first()
        if folder:
            db_note.folders.append(folder)
        else:
             # Optionally raise HTTPException if a folder ID is invalid
             # raise HTTPException(status_code=404, detail=f"Folder with id {folder_id} not found")
             print(f"Warning: Folder with id {folder_id} not found during note creation.") # Log a warning for now

    db.commit()
    db.refresh(db_note)
    # Refresh with folders loaded for the response
    db.refresh(db_note, attribute_names=['folders'])
    return db_note

def create_folder(db: Session, folder: schemas.FolderCreate):
    db_folder = models.Folder(**folder.model_dump())
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

def get_folders(db: Session):
    return db.query(models.Folder).all()

def get_folder(db: Session, folder_id: int):
    return db.query(models.Folder).filter(models.Folder.id == folder_id).first()

def get_note(db: Session, note_id: int):
    # Use joinedload to eagerly load associated folders and label
    return db.query(models.Note).options(joinedload(models.Note.folders), joinedload(models.Note.label)).filter(models.Note.id == note_id).first()

def get_notes(db: Session, user_id: int):
    # Use joinedload to eagerly load associated folders and label
    return db.query(models.Note).options(joinedload(models.Note.folders), joinedload(models.Note.label)).filter(models.Note.owner_id == user_id).all()

def get_notes_by_folder(db: Session, folder_id: int):
    # Query notes through the association table or by filtering on the relationship
    return db.query(models.Note).options(joinedload(models.Note.folders), joinedload(models.Note.label)).join(models.Note.folders).filter(models.Folder.id == folder_id).all()

def update_note(db: Session, note_id: int, note: schemas.NoteUpdate):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        update_data = note.model_dump(exclude_unset=True)

        # Handle folder_ids update separately
        if "folder_ids" in update_data:
            new_folder_ids = update_data.pop("folder_ids")
            db_note.folders.clear() # Clear existing associations
            db.flush()
            for folder_id in new_folder_ids:
                 folder = db.query(models.Folder).filter(models.Folder.id == folder_id).first()
                 if folder:
                     db_note.folders.append(folder)
                 else:
                     # Optionally raise HTTPException if a folder ID is invalid
                     # raise HTTPException(status_code=404, detail=f"Folder with id {folder_id} not found during note update.")
                      print(f"Warning: Folder with id {folder_id} not found during note update.") # Log a warning for now

        # Update other attributes
        for key, value in update_data.items():
            setattr(db_note, key, value)

        db.commit()
        db.refresh(db_note)
        # Refresh with folders loaded for the response
        db.refresh(db_note, attribute_names=['folders'])
    return db_note

def delete_note(db: Session, note_id: int):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
    return db_note

def update_folder(db: Session, folder_id: int, folder: schemas.FolderUpdate):
    db_folder = db.query(models.Folder).filter(models.Folder.id == folder_id).first()
    if db_folder:
        update_data = folder.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_folder, key, value)
        db.commit()
        db.refresh(db_folder)
    return db_folder

def delete_folder(db: Session, folder_id: int):
    db_folder = db.query(models.Folder).filter(models.Folder.id == folder_id).first()
    if db_folder:
        db.delete(db_folder)
        db.commit()
    return db_folder

def get_labels(db: Session):
    return db.query(models.Label).all()

def get_label(db: Session, label_id: int):
    return db.query(models.Label).filter(models.Label.id == label_id).first()

def create_label(db: Session, label: schemas.LabelBase):
    # Check if label with the same name already exists
    existing_label = db.query(models.Label).filter(models.Label.name == label.name).first()
    if existing_label:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Label with this name already exists"
        )

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

def authenticate_user(db: Session, identifier: str, password: str):
    user = get_user_by_email(db, identifier)
    if not user:
        user = get_user_by_username(db, identifier)

    if not user:
        return False
    if not security.verify_password(password, user.hashed_password):
        return False
    return user

def delete_label(db: Session, label_id: int):
    db_label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if db_label:
        db.delete(db_label)
        db.commit()
    return db_label 