from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import db

class TrainingPlan(db.Model):
    __tablename__ = "training_plans"

    plan_id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty_level = Column(String(50))
    duration_weeks = Column(Integer)
    training_frequency = Column(Integer)
    training_objective = Column(Text)
    focus_areas = Column(Text)
    exercise_types = Column(Text)
    specific_instructions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    coach = relationship("User", back_populates="created_plans")
    exercises = relationship("PlanExercise", back_populates="plan", cascade="all, delete-orphan")
    user_assignments = relationship("UserTrainingPlan", back_populates="plan", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'plan_id': self.plan_id,
            'coach_id': self.coach_id,
            'title': self.title,
            'description': self.description,
            'difficulty_level': self.difficulty_level,
            'duration_weeks': self.duration_weeks,
            'training_frequency': self.training_frequency,
            'training_objective': self.training_objective,
            'focus_areas': self.focus_areas,
            'exercise_types': self.exercise_types,
            'specific_instructions': self.specific_instructions,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'exercises': [exercise.to_dict() for exercise in self.exercises],
            'coach': {
                'first_name': self.coach.first_name,
                'last_name': self.coach.last_name
            } if self.coach else None
        }

class PlanExercise(db.Model):
    __tablename__ = "plan_exercises"

    exercise_id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("training_plans.plan_id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    sets = Column(Text)
    reps = Column(Text)
    intensity = Column(Text)
    rest_period = Column(Text)
    special_instructions = Column(Text)
    week_number = Column(Integer)
    day_number = Column(Integer)
    order_in_day = Column(Integer)
    video_url = Column(String(512), nullable=True)
    image_url = Column(String(512), nullable=True)

    # Relationships
    plan = relationship("TrainingPlan", back_populates="exercises")
    # The progress_records relationship is defined in the ProgressTracking model

    def to_dict(self):
        return {
            'exercise_id': self.exercise_id,
            'plan_id': self.plan_id,
            'name': self.name,
            'description': self.description,
            'sets': self.sets,
            'reps': self.reps,
            'intensity': self.intensity,
            'rest_period': self.rest_period,
            'special_instructions': self.special_instructions,
            'week_number': self.week_number,
            'day_number': self.day_number,
            'order_in_day': self.order_in_day,
            'video_url': self.video_url,
            'image_url': self.image_url
        } 