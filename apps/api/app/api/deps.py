from collections.abc import Generator

from app.db.models import Base
from app.db.repository import SqlRepository
from app.db.session import SessionLocal, engine


def ensure_database_ready() -> None:
    if engine.url.get_backend_name() == "sqlite":
        Base.metadata.create_all(bind=engine)


def get_repo() -> Generator[SqlRepository, None, None]:
    ensure_database_ready()
    db = SessionLocal()
    try:
        from app.db.repository import seed_demo_data

        seed_demo_data(db)
        yield SqlRepository(db)
    finally:
        db.close()
