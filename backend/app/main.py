from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CommuCore API",
    description="Plataforma de Governança e Inteligência Comunitária",
    version="1.0.0",
)

# CORS config
origins = [
    "http://localhost:6177",  # React Vite dev server
    "http://127.0.0.1:6177",
    "http://localhost",       # Nginx local Docker
    "*"                       # Allow everything for generic testing
]

from app.api import auth, organizations, users, communication, workflows, analytics, notifications, management

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(communication.router, prefix="/api/v1/communication", tags=["communication"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(management.router, prefix="/api/v1/management", tags=["management"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CommuCore API"}
