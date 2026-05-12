"""
FineTuneStudio — Unified FastAPI Backend
=========================================
Single Python backend handling:
- Authentication (JWT)
- Dataset management (upload, import, clean)
- Model fine-tuning (with LoRA/PEFT)
- Before/After comparison
- Hugging Face Hub deployment

Run: python -m app.main
Docs: http://localhost:8000/docs
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import connect_db, close_db
from app.config import HOST, PORT, DEBUG, UPLOAD_DIR
from app.routers import auth, dataset, training, comparison, deployment, recipe, fusion, builder, playground, distillation, agents, marketplace


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await connect_db()
    print("\n[OK] FineTuneStudio API is ready!")
    print(f"[INFO] API Docs: http://{HOST}:{PORT}/docs")
    print(f"[INFO] Uploads: {UPLOAD_DIR}\n")
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="FineTuneStudio API",
    description="No-code AI model fine-tuning, comparison, and deployment platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Register all routers
app.include_router(auth.router)
app.include_router(dataset.router)
app.include_router(training.router)
app.include_router(comparison.router)
app.include_router(deployment.router)
app.include_router(recipe.router)
app.include_router(fusion.router)
app.include_router(builder.router)
app.include_router(playground.router)
app.include_router(distillation.router)
app.include_router(agents.router)
app.include_router(marketplace.router)


@app.get("/")
async def root():
    """API root — health check."""
    return {
        "service": "FineTuneStudio API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    from app.database import get_db
    db = get_db()
    return {
        "status": "healthy",
        "database": "connected" if db is not None else "demo_mode",
        "service": "FineTuneStudio API",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
