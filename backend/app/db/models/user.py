import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    """
    The admin is the central body: it is the only role that can create
    the other three. Extend this enum (and nothing else) to add new
    handler types later.
    """
    ADMIN = "admin"
    PAPER_CHECKER = "paper_checker"
    CORRECTION = "correction"
    GRIEVANCE_BODY = "grievance_body"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # True right after the admin creates the account; forced to flip to
    # False the first time the user successfully changes their password.
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_by_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r} role={self.role.value}>"
