import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

_engine = None
_SessionLocal = None


def _engine_():
    global _engine, _SessionLocal
    if _engine is None:
        url = os.getenv("DATABASE_URL", "")
        if not url:
            raise RuntimeError("DATABASE_URL is not set.")
        _engine = create_engine(url)
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


def init_db():
    from . import models  # noqa: F401 — registers models with Base
    Base.metadata.create_all(bind=_engine_())


def get_db():
    _engine_()
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()
