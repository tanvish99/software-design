from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, BearerTransport
from app.config import settings

def get_jwt_strategy():
    return JWTStrategy(secret=settings.SECRET, lifetime_seconds=3600 * 24)

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)