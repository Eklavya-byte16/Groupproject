
from uuid import uuid4
import enum
from sqlalchemy import String, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.base import Base

class Strictness(str, enum.Enum):
    LENIENT="lenient"; BALANCED="balanced"; STRICT="strict"; EXAMINER="examiner"
class ExamStatus(str, enum.Enum):
    DRAFT="draft"; COMPLETED="completed"
class Exam(Base):
    __tablename__="exams"
    id: Mapped[UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    teacher_id: Mapped[UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    subject: Mapped[str]=mapped_column(String(120))
    semester: Mapped[str]=mapped_column(String(20))
    strictness: Mapped[Strictness]=mapped_column(Enum(Strictness), default=Strictness.BALANCED)
    status: Mapped[ExamStatus]=mapped_column(Enum(ExamStatus), default=ExamStatus.DRAFT)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
