from pydantic import BaseModel
from typing import Optional

class NoteBase(BaseModel):
    title: str
    content: str
    label_id: Optional[int] = None
    folder_id: Optional[int] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class NoteOut(NoteBase):
    id: int
    owner_id: int
    class Config:
        orm_mode = True

class LabelBase(BaseModel):
    name: str

class LabelOut(LabelBase):
    id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True 