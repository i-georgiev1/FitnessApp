from database import db
from models.user import User, UserProfile
import os
from dotenv import load_dotenv

load_dotenv()

def create_admin_user(app):
    with app.app_context():
        try:
            # Check if admin user already exists
            admin = User.query.filter_by(email=os.getenv('ADMIN_EMAIL')).first()
            if admin:
                print("Admin user already exists")
                return

            # Create admin user
            admin = User(
                email=os.getenv('ADMIN_EMAIL'),
                first_name='Admin',
                last_name='User',
                user_type='admin'
            )
            admin.set_password(os.getenv('ADMIN_PASSWORD'))
            db.session.add(admin)
            db.session.commit()

            # Create admin profile
            admin_profile = UserProfile(user_id=admin.user_id)
            db.session.add(admin_profile)
            db.session.commit()

            print(f"Admin user created with email: {admin.email}")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {str(e)}")
            raise 