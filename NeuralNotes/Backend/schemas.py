from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    content: str
    label_id: Optional[int] = None
    folder_ids: List[int] = []

# Yeni not oluşturmak için kullanılan Pydantic modeli (NoteBase'den miras)  
class NoteCreate(NoteBase):
    pass

# Not güncellemek için kullanılan Pydantic modeli (NoteBase'den miras)
class NoteUpdate(NoteBase):
    folder_ids: Optional[List[int]] = None

# API yanıtı olarak gönderilecek not modeli (NoteBase'den miras)
class NoteOut(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    label_id: Optional[int] = None
    folders: List["FolderOut"] = []
    label: Optional["LabelOut"] = None

    class Config:
        from_attributes = True

class FolderBase(BaseModel):
    name: str

class FolderCreate(FolderBase):
    pass

class FolderOut(FolderBase):
    id: int
    class Config:
        from_attributes = True

# Add schema for updating a folder
class FolderUpdate(FolderBase):
    name: Optional[str] = None

# Etiketler için temel Pydantic modeli
class LabelBase(BaseModel):
    name: str

# API yanıtı olarak gönderilecek etiket modeli
class LabelOut(LabelBase):
    id: int
    class Config:
        from_attributes = True

# Kullanıcılar için temel Pydantic modeli
class UserBase(BaseModel):
    email: EmailStr
    username: str

# Kullanıcı oluşturmak için kullanılan Pydantic modeli
class UserCreate(UserBase):
    password: str

# Kullanıcı girişi için kullanılan Pydantic modeli
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Kullanıcı yanıtı için kullanılan Pydantic modeli
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Kullanıcı çıktısı için kullanılan Pydantic modeli
class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

FolderOut.model_rebuild()
LabelOut.model_rebuild()