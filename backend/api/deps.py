"""
Shared FastAPI dependencies
Dùng với Depends() trong routes
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import lru_cache
from config import Settings, get_settings

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    settings: Settings = Depends(get_settings),
):
    """
    JWT auth dependency — sử dụng trong routes cần auth:
    
    @router.get("/protected")
    async def protected(user = Depends(get_current_user)):
        return {"user": user}
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    # TODO: Validate JWT token
    # from jose import jwt
    # payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return {"token": credentials.credentials}


def optional_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Auth optional — không throw lỗi nếu không có token"""
    return credentials.credentials if credentials else None
