import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, JSON, String, Text

from .database import Base


class AnalysisStatus(str, enum.Enum):
    pending = "pending"
    complete = "complete"
    error = "error"


class QueueStatus(str, enum.Enum):
    pending = "pending"
    reviewing = "reviewing"
    certified = "certified"
    rejected = "rejected"


def _now():
    return datetime.now(timezone.utc)


def _uuid():
    return str(uuid.uuid4())


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=_uuid)
    url = Column(String, nullable=False, index=True)
    video_id = Column(String)
    reality_score = Column(Float)
    label = Column(String)
    raw_result = Column(JSON)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.pending)
    created_at = Column(DateTime, default=_now)


class NotaryQueue(Base):
    __tablename__ = "notary_queue"

    id = Column(String, primary_key=True, default=_uuid)
    url = Column(String, nullable=False)
    video_id = Column(String)
    analysis_id = Column(String)
    status = Column(Enum(QueueStatus), default=QueueStatus.pending)
    notes = Column(Text)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now)
