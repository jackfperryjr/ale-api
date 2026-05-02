import os

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(key: str | None = Security(_header)):
    expected = os.getenv("ALE_API_KEY")
    if not expected:
        raise HTTPException(status_code=500, detail="ALE_API_KEY is not configured")
    if not key or key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")
