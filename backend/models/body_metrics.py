from database import db
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

class BodyMetrics(db.Model):
    __tablename__ = "body_metrics"

    metric_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    date = Column(DateTime, server_default=func.now())
    weight = Column(Numeric(5, 2))  # Weight in kg with 2 decimal places
    height = Column(Numeric(5, 2))  # Height in cm with 2 decimal places
    bmi = Column(Numeric(4, 2))     # BMI with 2 decimal places
    body_fat = Column(Numeric(4, 2)) # Body fat percentage with 2 decimal places
    muscle_mass = Column(Numeric(4, 2)) # Muscle mass in kg with 2 decimal places
    photo_url = Column(String(255))  # URL to the progress photo
    notes = Column(Text)

    # Relationships
    user = relationship("User", back_populates="body_metrics")

    def __init__(self, user_id, weight=None, height=None, body_fat=None, 
                 muscle_mass=None, photo_url=None, notes=None, bmi=None, date=None):
        """
        Initialize a new BodyMetrics record.
        
        Args:
            user_id: The ID of the user this metric belongs to
            weight: Weight in kg (optional)
            height: Height in cm (optional)
            body_fat: Body fat percentage (optional)
            muscle_mass: Muscle mass in kg (optional)
            photo_url: URL to progress photo (optional)
            notes: Additional notes (optional)
            bmi: Body Mass Index (optional)
            date: Date of measurement (optional)
        """
        self.user_id = user_id
        self.weight = weight
        self.height = height
        self.body_fat = body_fat
        self.muscle_mass = muscle_mass
        self.photo_url = photo_url
        self.notes = notes
        self.date = date if date else datetime.now()
        
        # Set BMI if provided, otherwise calculate it if possible
        if bmi is not None:
            self.bmi = bmi
        elif weight and height:
            # BMI = weight(kg) / (height(m))²
            height_in_meters = float(height) / 100  # Convert cm to m
            self.bmi = float(weight) / (height_in_meters * height_in_meters)

    def to_dict(self):
        return {
            'metric_id': self.metric_id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'weight': float(self.weight) if self.weight else None,
            'height': float(self.height) if self.height else None,
            'bmi': float(self.bmi) if self.bmi else None,
            'body_fat': float(self.body_fat) if self.body_fat else None,
            'muscle_mass': float(self.muscle_mass) if self.muscle_mass else None,
            'photo_url': self.photo_url,
            'notes': self.notes
        } 