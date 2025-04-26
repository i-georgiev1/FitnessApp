from sqlalchemy import String, DateTime, ForeignKey, JSON, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from database import db
import uuid
from datetime import datetime

class MealPlan(db.Model):
    __tablename__ = "meal_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    total_calories: Mapped[int] = mapped_column(Integer, nullable=True)
    total_protein: Mapped[int] = mapped_column(Integer, nullable=True)
    total_carbs: Mapped[int] = mapped_column(Integer, nullable=True)
    total_fats: Mapped[int] = mapped_column(Integer, nullable=True)
    dietary_preferences: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    coach = relationship("User", back_populates="created_meal_plans")
    meals = relationship("Meal", back_populates="meal_plan", cascade="all, delete-orphan")
    user_assignments = relationship("UserMealPlan", back_populates="plan", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'coach_id': self.coach_id,
            'coach': {
                'first_name': self.coach.first_name,
                'last_name': self.coach.last_name,
                'full_name': f"{self.coach.first_name} {self.coach.last_name}"
            } if self.coach else None,
            'name': self.name,
            'description': self.description,
            'total_calories': self.total_calories,
            'total_protein': self.total_protein,
            'total_carbs': self.total_carbs,
            'total_fats': self.total_fats,
            'dietary_preferences': self.dietary_preferences,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'meals': [meal.to_dict() for meal in self.meals]
        }

class Meal(db.Model):
    __tablename__ = "meals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meal_plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("meal_plans.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    ingredients: Mapped[str] = mapped_column(Text, nullable=True)
    cooking_instructions: Mapped[str] = mapped_column(Text, nullable=True)
    calories: Mapped[int] = mapped_column(Integer, nullable=True)
    protein: Mapped[int] = mapped_column(Integer, nullable=True)
    carbs: Mapped[int] = mapped_column(Integer, nullable=True)
    fats: Mapped[int] = mapped_column(Integer, nullable=True)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False)
    day_of_week: Mapped[str] = mapped_column(String(20), nullable=False)
    meal_time: Mapped[str] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    meal_plan = relationship("MealPlan", back_populates="meals")

    def to_dict(self):
        return {
            'id': self.id,
            'meal_plan_id': self.meal_plan_id,
            'name': self.name,
            'description': self.description,
            'ingredients': self.ingredients,
            'cooking_instructions': self.cooking_instructions,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'meal_type': self.meal_type,
            'day_of_week': self.day_of_week,
            'meal_time': self.meal_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 