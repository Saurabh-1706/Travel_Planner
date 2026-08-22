from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger(__name__)

def _serializable_errors(exc: RequestValidationError) -> list:
    # pydantic v2 puts the original exception object in ctx['error'], which
    # json.dumps chokes on — keep only plain data.
    errors = []
    for e in exc.errors():
        e = dict(e)
        ctx = e.get("ctx")
        if isinstance(ctx, dict):
            e["ctx"] = {k: str(v) for k, v in ctx.items()}
        errors.append(e)
    return errors


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": _serializable_errors(exc), "body": exc.body},
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
