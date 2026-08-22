from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router
from app.core.exceptions import validation_exception_handler, global_exception_handler
from app.core.logging import setup_logging
from fastapi.exceptions import RequestValidationError
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.seed import seed_places
import app.models  # noqa: F401 - registers all models on Base.metadata

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

@app.on_event("startup")
async def create_tables_and_seed():
    # Real migrations belong in alembic; this just guarantees the schema
    # exists for local dev so the app works out of the box.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_places(db)
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the Travel Planner API"}

