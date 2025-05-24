from fastapi import FastAPI
from .routers import notes, labels, users

app = FastAPI()

app.include_router(notes.router)
app.include_router(labels.router)
app.include_router(users.router)
