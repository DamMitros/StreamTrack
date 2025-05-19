from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Note(Base):
  __tablename__ = 'notes'
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(String, index=True)
  movie_id = Column(String)
  content = Column(Text)
  created_at = Column(DateTime)
  updated_at = Column(DateTime)