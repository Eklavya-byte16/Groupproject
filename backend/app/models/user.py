
from sqlalchemy.orm import DeclarativeBase,Mapped,mapped_column,relationship
from sqlalchemy import String,ForeignKey
import uuid
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__="users"
    id:Mapped[str]=mapped_column(String,primary_key=True,default=lambda:str(uuid.uuid4()))
    name:Mapped[str]=mapped_column(String(120))
    email:Mapped[str]=mapped_column(String(120),unique=True)
    password_hash:Mapped[str]=mapped_column(String)
    department:Mapped[str]=mapped_column(String(40))
    assignments=relationship("TeachingAssignment",back_populates="user")
class TeachingAssignment(Base):
    __tablename__="teaching_assignments"
    id:Mapped[str]=mapped_column(String,primary_key=True,default=lambda:str(uuid.uuid4()))
    user_id:Mapped[str]=mapped_column(ForeignKey("users.id"))
    academic_year:Mapped[str]=mapped_column(String(10))
    subject:Mapped[str]=mapped_column(String(120))
    user=relationship("User",back_populates="assignments")
