"""
Imports every SQLAlchemy model so Alembic can discover them.
This file is NEVER imported by the models themselves.
"""

from app.db.base import Base

from app.db.models.user import User
from app.db.models.exam import Exam

__all__ = ["Base", "User", "Exam"]