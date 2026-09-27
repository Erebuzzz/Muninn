import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Table, Column
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )
    entities: Mapped[List["Entity"]] = relationship(
        "Entity", back_populates="user", cascade="all, delete-orphan"
    )
    resurfacing_events: Mapped[List["ResurfacingEvent"]] = relationship(
        "ResurfacingEvent", back_populates="user", cascade="all, delete-orphan"
    )

class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_transcript: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="conversations")
    speakers: Mapped[List["Speaker"]] = relationship(
        "Speaker", back_populates="conversation", cascade="all, delete-orphan"
    )
    claims: Mapped[List["Claim"]] = relationship(
        "Claim", back_populates="conversation", cascade="all, delete-orphan"
    )

class Speaker(Base):
    __tablename__ = "speakers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    diarization_tag: Mapped[str] = mapped_column(String(50), nullable=False)
    resolved_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="speakers")
    claims: Mapped[List["Claim"]] = relationship("Claim", back_populates="speaker")

claim_entities = Table(
    "claim_entities",
    Base.metadata,
    Column("claim_id", UUID(as_uuid=True), ForeignKey("claims.id", ondelete="CASCADE"), primary_key=True),
    Column("entity_id", UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
)

class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="entities")
    claims: Mapped[List["Claim"]] = relationship(
        "Claim", secondary=claim_entities, back_populates="entities"
    )

class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    speaker_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("speakers.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sensitivity: Mapped[str] = mapped_column(String(50), default="none", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    embedding = mapped_column(Vector(1536), nullable=True)

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="claims")
    speaker: Mapped[Optional["Speaker"]] = relationship("Speaker", back_populates="claims")
    entities: Mapped[List["Entity"]] = relationship(
        "Entity", secondary=claim_entities, back_populates="claims"
    )
    task_state: Mapped[Optional["TaskState"]] = relationship(
        "TaskState",
        foreign_keys="TaskState.claim_id",
        back_populates="claim",
        uselist=False,
        cascade="all, delete-orphan"
    )

class Relationship(Base):
    __tablename__ = "relationships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), nullable=False
    )
    to_claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), nullable=False
    )
    relation_type: Mapped[str] = mapped_column(String(50), nullable=False)

    from_claim: Mapped["Claim"] = relationship("Claim", foreign_keys=[from_claim_id])
    to_claim: Mapped["Claim"] = relationship("Claim", foreign_keys=[to_claim_id])

class TaskState(Base):
    __tablename__ = "task_state"

    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), primary_key=True
    )
    status: Mapped[str] = mapped_column(String(50), default="open", nullable=False)
    blocked_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("claims.id", ondelete="SET NULL"), nullable=True
    )
    resurfaced_at: Mapped[Optional[List[datetime]]] = mapped_column(
        ARRAY(DateTime(timezone=True)), nullable=True
    )

    claim: Mapped["Claim"] = relationship("Claim", foreign_keys=[claim_id], back_populates="task_state")
    blocked_by_claim: Mapped[Optional["Claim"]] = relationship("Claim", foreign_keys=[blocked_by])

class ResurfacingEvent(Base):
    __tablename__ = "resurfacing_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    triggered_by_conv: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True
    )
    subject_claim_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("claims.id", ondelete="SET NULL"), nullable=True
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(String(50), default="stale_and_relevant", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    dismissed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="resurfacing_events")
    subject_claim: Mapped[Optional["Claim"]] = relationship("Claim")
