from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_REQUESTS: dict[str, deque[float]] = defaultdict(deque)


def rate_limit(max_requests: int = 30, window_seconds: int = 60):
    """
    Lightweight in-memory rate limit for expensive AI endpoints.
    Suitable for local/demo deployments; use Redis or gateway limits in production.
    """

    async def dependency(request: Request) -> None:
        now = time.monotonic()
        client = request.client.host if request.client else "unknown"
        key = f"{client}:{request.url.path}"
        bucket = _REQUESTS[key]

        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()

        if len(bucket) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
            )

        bucket.append(now)

    return dependency
