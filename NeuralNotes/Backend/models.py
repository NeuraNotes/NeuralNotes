from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime, UTC

Base = declarative_base()

#User tablosu için veritabanı modeli
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True) #TODO: Uzunluk kontrolü eklenebilir
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    notes = relationship('Note', back_populates='owner')

#Label tablosu için veritabanı modeli
class Label(Base):
    __tablename__ = 'labels'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) #TODO: Uzunluk kontrolü eklenebilir
    notes = relationship('Note', back_populates='label')

#Note tablosu için veritabanı modeli
class Note(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True) #TODO: Uzunluk kontrolü eklenebilir
    content = Column(Text)
    owner_id = Column(Integer, ForeignKey('users.id'))
    label_id = Column(Integer, ForeignKey('labels.id'))
    owner = relationship('User', back_populates='notes')
    label = relationship('Label', back_populates='notes') 