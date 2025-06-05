from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from routers import notes, labels, users, auth, folders

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow requests from your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# API rotalarını uygulamaya dahil eder
app.include_router(notes.router)
app.include_router(labels.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(folders.router)

@app.get("/")
def read_root():
    return {"hi": "there"}
