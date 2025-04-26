from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, Text, ForeignKey, Column, Integer, DECIMAL, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
import bcrypt
from database import db
from models.meal_plan import MealPlan
from models.audit_log import AuditLog
import secrets
from datetime import timedelta

class User(db.Model):
    __tablename__ = 'users'
    
    user_id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    user_type: Mapped[str] = mapped_column(String(20), default="user")
    profile_image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    balance: Mapped[float] = mapped_column(DECIMAL(10, 2), default=0.00)  # Add balance column with 2 decimal places
    
    # Relationship with UserProfile - add cascade delete
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    coach_profile = relationship("CoachProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Plan relationships
    created_plans = relationship("TrainingPlan", foreign_keys="[TrainingPlan.coach_id]", back_populates="coach")
    created_meal_plans = relationship("MealPlan", back_populates="coach")
    training_plans = relationship("UserTrainingPlan", foreign_keys="[UserTrainingPlan.user_id]", back_populates="user")
    assigned_meal_plans = relationship("UserMealPlan", foreign_keys="[UserMealPlan.user_id]", back_populates="user")
    
    # Other relationships
    progress_records = relationship("ProgressTracking", foreign_keys="[ProgressTracking.user_id]", back_populates="user")
    body_metrics = relationship("BodyMetrics", foreign_keys="[BodyMetrics.user_id]", back_populates="user")
    
    # Audit logs relationship
    audit_logs = relationship("AuditLog", back_populates="user")
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password: str):
        # Generate a salt and hash the password
        salt = bcrypt.gensalt()
        password_bytes = password.encode('utf-8')
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        # Check if the password matches
        password_bytes = password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'user_type': self.user_type,
            'profile_image_url': self.profile_image_url,
            'is_active': self.is_active,
            'balance': float(self.balance) if self.balance else 0.00,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    profile_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'))
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    fitness_level: Mapped[str] = mapped_column(String(50), nullable=True)
    goals: Mapped[str] = mapped_column(Text, nullable=True)
    preferences: Mapped[str] = mapped_column(Text, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), nullable=True)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=True)
    emergency_contact: Mapped[str] = mapped_column(String(100), nullable=True)
    health_conditions: Mapped[str] = mapped_column(Text, nullable=True)
    height: Mapped[float] = mapped_column(Numeric(5, 2), nullable=True)  # Height in cm with 2 decimal places
    weight: Mapped[float] = mapped_column(Numeric(5, 2), nullable=True)  # Weight in kg with 2 decimal places
    activity_level: Mapped[str] = mapped_column(String(50), nullable=True)  # sedentary, light, moderate, very active, extra active
    workout_preferences: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string of workout preferences
    dietary_preferences: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string of dietary preferences
    allergies: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string of allergies
    injury_history: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string of injury history
    
    # Relationship with User
    user = relationship("User", back_populates="profile")
    
    def __repr__(self):
        return f'<UserProfile for user_id {self.user_id}>'
    
    def to_dict(self):
        return {
            'profile_id': self.profile_id,
            'user_id': self.user_id,
            'bio': self.bio,
            'age': self.age,
            'gender': self.gender,
            'location': self.location,
            'fitness_level': self.fitness_level,
            'goals': self.goals,
            'preferences': self.preferences,
            'timezone': self.timezone,
            'contact_number': self.contact_number,
            'emergency_contact': self.emergency_contact,
            'health_conditions': self.health_conditions,
            'height': float(self.height) if self.height else None,
            'weight': float(self.weight) if self.weight else None,
            'activity_level': self.activity_level,
            'workout_preferences': self.workout_preferences,
            'dietary_preferences': self.dietary_preferences,
            'allergies': self.allergies,
            'injury_history': self.injury_history
        }

class CoachProfile(db.Model):
    __tablename__ = 'coach_profiles'
    
    profile_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'), nullable=False, unique=True)
    specializations: Mapped[str] = mapped_column(Text, nullable=True, default='General Fitness')
    experience_years: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    rating: Mapped[float] = mapped_column(DECIMAL(3, 2), nullable=True, default=0.00)  # Allows ratings from 0.00 to 5.00
    bio: Mapped[str] = mapped_column(Text, nullable=True, default='')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="coach_profile")
    clients = relationship("CoachClient", back_populates="coach")
    
    def to_dict(self):
        return {
            'profile_id': self.profile_id,
            'user_id': self.user_id,
            'specializations': self.specializations,
            'experience_years': self.experience_years,
            'rating': float(self.rating) if self.rating else None,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'clients_count': len(self.clients) if self.clients else 0
        }

class CoachClient(db.Model):
    __tablename__ = 'coach_clients'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    coach_id: Mapped[int] = mapped_column(ForeignKey('coach_profiles.profile_id'), nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, inactive, pending
    
    # Relationships
    coach = relationship("CoachProfile", back_populates="clients")
    client = relationship("User")
    
    def to_dict(self):
        return {
            'id': self.id,
            'coach_id': self.coach_id,
            'client_id': self.client_id,
            'client_name': f"{self.client.first_name} {self.client.last_name}",
            'client_email': self.client.email,
            'assigned_at': self.assigned_at.isoformat(),
            'status': self.status
        }

class UserTrainingPlan(db.Model):
    __tablename__ = 'user_training_plans'
    __table_args__ = {'extend_existing': True}
    
    assignment_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id', ondelete='CASCADE'))
    plan_id: Mapped[int] = mapped_column(ForeignKey('training_plans.plan_id', ondelete='CASCADE'))
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='in_progress')  # in_progress, completed, paused
    progress: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)  # Percentage of completion
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="training_plans")
    plan = relationship("TrainingPlan", back_populates="user_assignments")
    
    def to_dict(self):
        return {
            'assignment_id': self.assignment_id,
            'user_id': self.user_id,
            'plan_id': self.plan_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'progress': float(self.progress) if self.progress else 0,
            'notes': self.notes
        }

class UserMealPlan(db.Model):
    __tablename__ = 'user_meal_plans'
    __table_args__ = {'extend_existing': True}
    
    assignment_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id', ondelete='CASCADE'))
    plan_id: Mapped[str] = mapped_column(ForeignKey('meal_plans.id', ondelete='CASCADE'))  # Changed to String(36) to match MealPlan's UUID
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='active')  # active, inactive, completed
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="assigned_meal_plans")
    plan = relationship("MealPlan", back_populates="user_assignments")
    
    def to_dict(self):
        return {
            'assignment_id': self.assignment_id,
            'user_id': self.user_id,
            'plan_id': self.plan_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'notes': self.notes
        }

class InviteLink(db.Model):
    """
    Model for storing user invitation links.
    Used for tracking and managing email invitations sent by administrators.
    """
    __tablename__ = 'invite_links'
    
    invite_id: Mapped[int] = mapped_column(primary_key=True)
    token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    user_type: Mapped[str] = mapped_column(String(20), default="user")  # user, coach, admin
    created_by: Mapped[int] = mapped_column(ForeignKey('users.user_id'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    creator = relationship("User")

    def __repr__(self):
        return f'<InviteLink {self.token}>'

    def to_dict(self):
        return {
            'invite_id': self.invite_id,
            'token': self.token,
            'email': self.email,
            'user_type': self.user_type,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat(),
            'is_used': self.is_used
        }

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

class PasswordResetToken(db.Model):
    """
    Model for storing password reset tokens.
    Used for secure password reset functionality.
    """
    __tablename__ = 'password_reset_tokens'
    
    token_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'), nullable=False)
    token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)  # IPv6 addresses can be up to 45 chars
    user_agent: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    user = relationship("User")

    def __repr__(self):
        return f'<PasswordResetToken {self.token}>'

    def to_dict(self):
        return {
            'token_id': self.token_id,
            'user_id': self.user_id,
            'token': self.token,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat(),
            'is_used': self.is_used,
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

    @classmethod
    def create_token(cls, user_id, expires_in_hours=1, ip_address=None, user_agent=None):
        """Create a new password reset token"""
        token = secrets.token_urlsafe(32)  # Generate a secure random token
        expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        reset_token = cls(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        db.session.add(reset_token)
        db.session.commit()
        
        return reset_token

    def mark_as_used(self):
        """Mark the token as used"""
        self.is_used = True
        self.used_at = datetime.utcnow()
        db.session.commit()

    @classmethod
    def get_valid_token(cls, token):
        """Get a valid, unused token"""
        return cls.query.filter_by(
            token=token,
            is_used=False
        ).filter(
            cls.expires_at > datetime.utcnow()
        ).first()

    @classmethod
    def invalidate_user_tokens(cls, user_id):
        """Invalidate all active tokens for a user"""
        cls.query.filter_by(
            user_id=user_id,
            is_used=False
        ).filter(
            cls.expires_at > datetime.utcnow()
        ).update({
            'is_used': True,
            'used_at': datetime.utcnow()
        })
        db.session.commit()