from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    # Account
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="member")
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Personal
    first_name = Column(String, nullable=False)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    state_of_origin = Column(String, nullable=True)
    nin = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)

    # Contact
    phone_primary = Column(String, nullable=True)
    phone_alternate = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state_of_residence = Column(String, nullable=True)

    # Education
    entry_year = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    house = Column(String, nullable=True)
    set_year = Column(String, nullable=True)
    highest_qualification = Column(String, nullable=True)
    institution_after = Column(String, nullable=True)
    field_of_study = Column(String, nullable=True)
    certifications = Column(Text, nullable=True)

    # Professional
    occupation = Column(String, nullable=True)
    employer = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    years_experience = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    skills = Column(Text, nullable=True)

    # Family
    marital_status = Column(String, nullable=True)
    num_children = Column(Integer, nullable=True)
    spouse_name = Column(String, nullable=True)

    # Association
    membership_category = Column(String, default="Regular")
    chapter = Column(String, nullable=True)
    previous_roles = Column(Text, nullable=True)
    areas_of_interest = Column(Text, nullable=True)
    referral_source = Column(String, nullable=True)

    payments = relationship("Payment", back_populates="member")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    amount = Column(String, nullable=True)
    payment_year = Column(String, nullable=True)
    proof_url = Column(String, nullable=True)
    status = Column(String, default="Pending")
    admin_note = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    member = relationship("Member", back_populates="payments")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="General")
    is_pinned = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey("members.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    author = relationship("Member")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey("members.id"), nullable=True)
    recipient_filter = Column(String, default="all")
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("Member")


class AccountInfo(Base):
    __tablename__ = "account_info"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String, nullable=False)
    account_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    updated_by = Column(Integer, ForeignKey("members.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ExpenseRequest(Base):
    __tablename__ = "expense_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(String, nullable=False)
    category = Column(String, default="General")
    status = Column(String, default="Pending")  # Pending, Approved, Rejected
    admin_note = Column(Text, nullable=True)
    requested_by = Column(Integer, ForeignKey("members.id"), nullable=False)
    reviewed_by = Column(Integer, ForeignKey("members.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    requester = relationship("Member", foreign_keys=[requested_by])
    reviewer = relationship("Member", foreign_keys=[reviewed_by])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("Member")
