from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from typing import List, Dict
from models.training_plan import TrainingPlan, PlanExercise, UserTrainingPlan
from models.progress_tracking import ProgressTracking

class TrainingPlanService:
    def __init__(self, db: Session):
        self.db = db

    def create_training_plan(self, coach_id: int, plan_data: dict) -> TrainingPlan:
        plan = TrainingPlan(
            coach_id=coach_id,
            title=plan_data['title'],
            description=plan_data['description'],
            difficulty_level=plan_data['difficulty_level'],
            duration_weeks=plan_data['duration_weeks']
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        
        # Add exercises to the plan
        for exercise_data in plan_data.get('exercises', []):
            exercise = PlanExercise(
                plan_id=plan.plan_id,
                name=exercise_data['name'],
                description=exercise_data.get('description'),
                sets=exercise_data.get('sets'),
                reps=exercise_data.get('reps'),
                duration_minutes=exercise_data.get('duration_minutes'),
                day_number=exercise_data['day_number'],
                week_number=exercise_data['week_number'],
                order_in_day=exercise_data['order_in_day'],
                video_url=exercise_data.get('video_url'),
                image_url=exercise_data.get('image_url')
            )
            self.db.add(exercise)
        
        self.db.commit()
        return plan

    def get_coach_plans(self, coach_id: int, filters: dict = None) -> List[TrainingPlan]:
        query = self.db.query(TrainingPlan).filter(TrainingPlan.coach_id == coach_id)
        
        if filters:
            if filters.get('difficulty_level'):
                query = query.filter(TrainingPlan.difficulty_level == filters['difficulty_level'])
            if filters.get('duration_weeks'):
                query = query.filter(TrainingPlan.duration_weeks == filters['duration_weeks'])
            if filters.get('search'):
                search = f"%{filters['search']}%"
                query = query.filter(TrainingPlan.title.ilike(search))

        return query.order_by(desc(TrainingPlan.created_at)).all()

    def clone_training_plan(self, plan_id: int, new_title: str) -> TrainingPlan:
        original_plan = self.db.query(TrainingPlan).filter(TrainingPlan.plan_id == plan_id).first()
        if not original_plan:
            raise ValueError("Original plan not found")

        # Clone the plan
        new_plan = TrainingPlan(
            coach_id=original_plan.coach_id,
            title=new_title,
            description=original_plan.description,
            difficulty_level=original_plan.difficulty_level,
            duration_weeks=original_plan.duration_weeks
        )
        self.db.add(new_plan)
        self.db.flush()  # Get the new plan_id

        # Clone exercises
        for exercise in original_plan.exercises:
            new_exercise = PlanExercise(
                plan_id=new_plan.plan_id,
                name=exercise.name,
                description=exercise.description,
                sets=exercise.sets,
                reps=exercise.reps,
                duration_minutes=exercise.duration_minutes,
                day_number=exercise.day_number,
                week_number=exercise.week_number,
                order_in_day=exercise.order_in_day,
                video_url=exercise.video_url,
                image_url=exercise.image_url
            )
            self.db.add(new_exercise)

        self.db.commit()
        return new_plan

    def get_plan_analytics(self, plan_id: int) -> Dict:
        plan = self.db.query(TrainingPlan).filter(TrainingPlan.plan_id == plan_id).first()
        if not plan:
            raise ValueError("Plan not found")

        # Get total assignments and active users
        assignments = self.db.query(UserTrainingPlan).filter(
            UserTrainingPlan.plan_id == plan_id
        ).all()
        
        total_users = len(assignments)
        active_users = len([a for a in assignments if a.status == 'in_progress'])
        completed_users = len([a for a in assignments if a.status == 'completed'])

        # Calculate average completion rate
        avg_progress = self.db.query(func.avg(UserTrainingPlan.progress))\
            .filter(UserTrainingPlan.plan_id == plan_id)\
            .scalar() or 0

        # Get exercise completion statistics
        exercise_stats = self.db.query(
            ProgressTracking.exercise_id,
            func.avg(ProgressTracking.rating).label('avg_rating'),
            func.count(ProgressTracking.tracking_id).label('completion_count')
        ).join(PlanExercise)\
         .filter(PlanExercise.plan_id == plan_id)\
         .group_by(ProgressTracking.exercise_id)\
         .all()

        return {
            'total_users': total_users,
            'active_users': active_users,
            'completed_users': completed_users,
            'average_progress': float(avg_progress),
            'completion_rate': (completed_users / total_users * 100) if total_users > 0 else 0,
            'exercise_stats': [
                {
                    'exercise_id': stat.exercise_id,
                    'avg_rating': float(stat.avg_rating or 0),
                    'completion_count': stat.completion_count
                }
                for stat in exercise_stats
            ]
        }

    def update_training_plan(self, plan_id: int, plan_data: dict) -> TrainingPlan:
        plan = self.db.query(TrainingPlan).filter(TrainingPlan.plan_id == plan_id).first()
        if not plan:
            raise ValueError("Plan not found")

        # Update plan details
        for key, value in plan_data.items():
            if key != 'exercises' and hasattr(plan, key):
                setattr(plan, key, value)

        # Update exercises if provided
        if 'exercises' in plan_data:
            # Remove existing exercises
            self.db.query(PlanExercise).filter(PlanExercise.plan_id == plan_id).delete()
            
            # Add new exercises
            for exercise_data in plan_data['exercises']:
                exercise = PlanExercise(
                    plan_id=plan_id,
                    name=exercise_data['name'],
                    description=exercise_data.get('description'),
                    sets=exercise_data.get('sets'),
                    reps=exercise_data.get('reps'),
                    duration_minutes=exercise_data.get('duration_minutes'),
                    day_number=exercise_data['day_number'],
                    week_number=exercise_data['week_number'],
                    order_in_day=exercise_data['order_in_day'],
                    video_url=exercise_data.get('video_url'),
                    image_url=exercise_data.get('image_url')
                )
                self.db.add(exercise)

        self.db.commit()
        self.db.refresh(plan)
        return plan

    def delete_training_plan(self, plan_id: int) -> bool:
        plan = self.db.query(TrainingPlan).filter(TrainingPlan.plan_id == plan_id).first()
        if not plan:
            raise ValueError("Plan not found")

        self.db.delete(plan)
        self.db.commit()
        return True 