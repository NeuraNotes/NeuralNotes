from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import notes, labels, users, auth

app = FastAPI()

# CORS ayarları: Frontend'in backend'e istek göndermesine izin verir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da frontend URL'ini belirtin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API rotalarını uygulamaya dahil eder
app.include_router(notes.router)
app.include_router(labels.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"hi": "there"}
