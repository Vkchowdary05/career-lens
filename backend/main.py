from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.config import settings
from app.routers import (
    auth,
    users,
    feed,
    experiences,
    companies,
    resume,
    tracker,
    leaderboard,
    notifications,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="CareerLens API",
    version="1.0.0",
    description="Backend for CareerLens — Career Intelligence Platform",
    lifespan=lifespan,
    # FIX: Disable automatic trailing-slash redirects.
    # Without this, GET /api/notifications (no slash) produces a 307 →
    # /api/notifications/ which Next.js may not follow with Authorization header,
    # causing 403 errors on the redirected request.
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,          prefix="/api/auth",          tags=["Auth"])
app.include_router(users.router,         prefix="/api/users",         tags=["Users"])
app.include_router(feed.router,          prefix="/api/feed",          tags=["Feed"])
app.include_router(experiences.router,   prefix="/api/experiences",   tags=["Experiences"])
app.include_router(companies.router,     prefix="/api/companies",     tags=["Companies"])
app.include_router(resume.router,        prefix="/api/resume",        tags=["Resume"])
app.include_router(tracker.router,       prefix="/api/tracker",       tags=["Tracker"])
app.include_router(leaderboard.router,   prefix="/api/leaderboard",   tags=["Leaderboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok", "service": "CareerLens API v1.0"}
