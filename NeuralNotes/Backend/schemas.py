from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    content: str
    label_id: Optional[int] = None
    folder_id: Optional[int] = None

# Yeni not oluşturmak için kullanılan Pydantic modeli (NoteBase'den miras)  
class NoteCreate(NoteBase):
    pass

# Not güncellemek için kullanılan Pydantic modeli (NoteBase'den miras)
class NoteUpdate(NoteBase):
    pass

# API yanıtı olarak gönderilecek not modeli (NoteBase'den miras)
class NoteOut(NoteBase):
    id: int
    owner_id: int
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