from database import db
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class ProgressTracking(db.Model):
    __tablename__ = "progress_tracking"

    tracking_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    exercise_id = Column(Integer, ForeignKey("plan_exercises.exercise_id", ondelete="CASCADE"))
    date = Column(DateTime, server_default=func.now())
    sets_completed = Column(Integer)
    reps_completed = Column(Integer)
    weight_used = Column(Numeric(5, 2))
    duration_minutes = Column(Integer)
    notes = Column(Text)
    rating = Column(Integer)  # 1-5 rating system

    # Relationships
    user = relationship("User", back_populates="progress_records")
    exercise = relationship("PlanExercise", backref="progress_records")

    def __init__(self, user_id, exercise_id, sets_completed, reps_completed, 
                 weight_used=None, duration_minutes=None, notes=None, rating=None):
        self.user_id = user_id
        self.exercise_id = exercise_id
        self.sets_completed = sets_completed
        self.reps_completed = reps_completed
        self.weight_used = weight_used
        self.duration_minutes = duration_minutes
        self.notes = notes
        self.rating = rating

    def to_dict(self):
        return {
            'tracking_id': self.tracking_id,
            'user_id': self.user_id,
            'exercise_id': self.exercise_id,
            'date': self.date.isoformat() if self.date else None,
            'sets_completed': self.sets_completed,
            'reps_completed': self.reps_completed,
            'weight_used': float(self.weight_used) if self.weight_used else None,
            'duration_minutes': self.duration_minutes,
            'notes': self.notes,
            'rating': self.rating
        } 