from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .routers import auth, exam

app = FastAPI(title="Exam Taking API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to database on startup
@app.on_event("startup")
async def startup_event():
    db.connect()

# Disconnect from database on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    db.disconnect()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(exam.router, prefix="/exam", tags=["exam"])

@app.get("/")
async def root():
    return {"message": "Exam Taking API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}