from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(32), unique=True, index=True) #TODO: Add warning for length
    password = Column(String(255)) #TODO: Add warning for length
    notes = relationship('Note', back_populates='owner')

class Label(Base):
    __tablename__ = 'labels'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(32), unique=True, index=True) #TODO: Add warning for length
    notes = relationship('Note', back_populates='label')

class Note(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True) #TODO: Add warning for length
    content = Column(Text)
    owner_id = Column(Integer, ForeignKey('users.id'))
    label_id = Column(Integer, ForeignKey('labels.id'))
    owner = relationship('User', back_populates='notes')
    label = relationship('Label', back_populates='notes') 