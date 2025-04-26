from flask import Flask, request, jsonify, send_file, redirect, send_from_directory
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from services.subscription_service import SubscriptionService
from services.contactus_form import handle_contact_form  # Add this import
from database import init_db, db
from models.user import User, UserProfile, CoachProfile, CoachClient, UserTrainingPlan, UserMealPlan, InviteLink
from models.settings import SystemSettings
from models.training_plan import TrainingPlan, PlanExercise
from models.audit_log import AuditLog
from functools import wraps
from init_db import create_admin_user
from services.send_mail import EmailService
from services.email_template import EmailTemplate
from services.openai_service import OpenAIService
from models.meal_plan import MealPlan, Meal
import openai
from models.progress_tracking import ProgressTracking
from models.body_metrics import BodyMetrics
import bcrypt
from werkzeug.utils import secure_filename
import uuid
from sqlalchemy import desc, asc
import stripe
import secrets
from services.invite_email import InviteEmail
from werkzeug.security import generate_password_hash
from models.user import PasswordResetToken  # Changed from models.password_reset_token

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Environment configuration
ENVIRONMENT = os.getenv('FLASK_ENV', 'development')
if ENVIRONMENT == 'production':
    CORS_ORIGINS = ['https://train-sync.com', 'https://www.train-sync.com']
    YOUR_DOMAIN = CORS_ORIGINS[0]
else:
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8000',
        'http://localhost'
    ]
    YOUR_DOMAIN = CORS_ORIGINS[0]
YOUR_DOMAIN = CORS_ORIGINS[0]
# Create Flask app
flask_app = Flask(__name__)
flask_app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change in production
flask_app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
flask_app.config['JWT_ERROR_MESSAGE_KEY'] = 'error'
flask_app.config['JWT_ALGORITHM'] = 'HS256'  # Explicitly set the algorithm
flask_app.config['JWT_TOKEN_LOCATION'] = ['headers']  # Only look for tokens in headers
flask_app.config['JWT_HEADER_NAME'] = 'Authorization'  # Header name
flask_app.config['JWT_HEADER_TYPE'] = 'Bearer'  # Header type

# Add timeout configuration
flask_app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)  # 10 minutes session timeout
flask_app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size

# Initialize JWT
jwt = JWTManager(flask_app)

# Init BREVO
email_service = EmailService()

# Configure CORS
CORS(flask_app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize database
init_db(flask_app)
# migration = Migrate(flask_app, db)
# logger.info(f"The migration result is {migration}")


def log_audit(user_id, action, entity_type, entity_id, details=None):
    """
    Utility function to create audit log entries.
    
    Args:
        user_id (int): The ID of the user performing the action
        action (str): The action performed (e.g., 'create', 'update', 'delete', 'login', 'logout')
        entity_type (str): The type of entity affected (e.g., 'user', 'training_plan', 'meal_plan')
        entity_id (int): The ID of the affected entity
        details (str, optional): Additional details about the action
    """
    try:
        # Get the IP address from the request
        ip_address = request.remote_addr
        
        # Create new audit log entry
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            ip_address=ip_address
        )
        
        db.session.add(audit_log)
        db.session.commit()
        logger.info(f"Created audit log entry: {action} on {entity_type} {entity_id} by user {user_id}")
        
    except Exception as e:
        logger.error(f"Error creating audit log: {str(e)}")
        db.session.rollback()
        # Don't raise the exception - we don't want audit logging to break the main functionality

def create_missing_coach_profiles():
    try:
        # Find all users with type 'coach'
        coach_users = User.query.filter_by(user_type='coach').all()
        created_count = 0
        
        for user in coach_users:
            # Check if they have a coach profile
            if not CoachProfile.query.filter_by(user_id=user.user_id).first():
                # Create coach profile
                coach_profile = CoachProfile(
                    user_id=user.user_id,
                    specializations='General Fitness',
                    experience_years=0,
                    rating=0.0,
                    bio=''
                )
                db.session.add(coach_profile)
                created_count += 1
                logger.info(f"Created missing coach profile for user {user.user_id}")
        
        if created_count > 0:
            db.session.commit()
            logger.info(f"Created {created_count} missing coach profiles")
    except Exception as e:
        logger.error(f"Error creating missing coach profiles: {str(e)}")
        db.session.rollback()

# Create missing coach profiles within application context
with flask_app.app_context():
    create_missing_coach_profiles()
    # Create admin user
    create_admin_user(flask_app)

# Support for reverse proxy headers
flask_app.wsgi_app = ProxyFix(flask_app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Initialize subscription service
subscription_service = SubscriptionService(ENVIRONMENT)

# Contact form endpoint
@flask_app.route('/api/contact/send', methods=['POST'])
def contact_form():
    """
    Handle contact form submissions
    """
    return handle_contact_form()

@flask_app.route('/api/subscribe', methods=['POST'])
def subscribe():
    try:
        logger.info(f"Received request headers: {dict(request.headers)}")
        logger.info(f"Received request origin: {request.origin}")
        
        data = request.get_json()
        logger.info(f"Received data: {data}")
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400
            
        name = data.get('name')
        email = data.get('email')
        
        success, message = subscription_service.process_subscription(name, email)
        if success:
            return jsonify({'message': 'Subscription successful'}), 200
        else:
            return jsonify({'error': message}), 500
            
    except Exception as e:
        error_msg = f"Subscription error: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 500

@flask_app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409

        # Handle invite token if provided
        user_type = 'user'  # default user type
        if 'invite_token' in data:
            invite = InviteLink.query.filter_by(
                token=data['invite_token'],
                is_used=False
            ).first()
            
            if not invite:
                return jsonify({'error': 'Invalid or expired invitation'}), 400
                
            if invite.email != data['email']:
                return jsonify({'error': 'Email does not match invitation'}), 400

            if invite.expires_at < datetime.utcnow():
                return jsonify({'error': 'Invitation has expired'}), 400

            user_type = invite.user_type
            invite.is_used = True

        # Create new user
        new_user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            user_type=user_type
        )
        new_user.set_password(data['password'])

        db.session.add(new_user)
        db.session.commit()

        # Create coach profile if user is a coach
        if user_type == 'coach':
            coach_profile = CoachProfile(
                user_id=new_user.user_id,
                specializations='General Fitness',
                experience_years=0,
                rating=0.0,
                bio=''
            )
            db.session.add(coach_profile)
            db.session.commit()

        # Log the registration
        log_audit(
            new_user.user_id,
            'create',
            'user',
            new_user.user_id,
            {'method': 'invite' if 'invite_token' in data else 'signup'}
        )

        return jsonify({
            'message': 'Registration successful',
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500




@flask_app.route('/canceled', methods=['POST'])
def canceled():
    data = request.get_json()
    logger.info(f"Canceled request received: {data}")

    try:
        # Validate required fields
        required_fields = ['email', 'price_id', 'user_id']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        email = data.get('email')
        price_id = data.get('price_id')
        user_id = data.get('user_id')

        # Update user subscription status
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Update user subscription status
        user.subscription_status = 'canceled-on-transaction'
        db.session.commit()

        # Log the subscription update
        log_audit(
            user_id=user.user_id,
            action='update',
            entity_type='user',
            entity_id=user.user_id,
            details=f"Subscription canceled: {email} - {price_id}"
        )      
            
        return jsonify({
            'message': 'Subscription canceled successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Subscription update error: {str(e)}")
        return jsonify({'error': 'Subscription update failed'}), 500        



@flask_app.route('/success', methods=['POST'])
def success():
    data = request.get_json()
    logger.info(f"Success request received: {data}")

    try:
        # Validate required fields
        required_fields = ['email', 'price_id', 'user_id']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        email = data.get('email')
        price_id = data.get('price_id')
        user_id = data.get('user_id')

        # Update user subscription status
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Update user subscription status
        user.subscription_status = 'paid'
        user.subscription_end = datetime.now() + timedelta(days=30)
        db.session.commit()

        # Log the subscription update
        log_audit(
            user_id=user.user_id,
            action='update',
            entity_type='user',
            entity_id=user.user_id,
            details=f"Subscription updated: {email} - {price_id}"
        )   

        return jsonify({
            'message': 'Subscription updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Subscription update error: {str(e)}")
        return jsonify({'error': 'Subscription update failed'}), 500        


@flask_app.route('/checkout', methods=['POST'])
def init_checkout_session():
    try:
        placeholder1 = ""
        placeholder2 = ""
        data = request.get_json()
        checkout_session = stripe.checkout.Session.create(
            customer_email='customer@example.com',
            submit_type='auto',
            billing_address_collection='auto',
            shipping_address_collection={
              'allowed_countries': ['US', 'CA','BG'],
            },
            line_items=[
                {
                    # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    'price': f"{data['price_id']}",
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{YOUR_DOMAIN}?success=true&param1={placeholder1}&param2={placeholder2}",
            cancel_url=f"{YOUR_DOMAIN}?canceled=true&param1={placeholder1}&param2={placeholder2}",
            automatic_tax={'enabled': True},
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)


@flask_app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403

    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Create access token
    access_token = create_access_token(identity=user.user_id)
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    })

@flask_app.route('/api/auth/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # For security reasons, we don't reveal if the email exists
        return jsonify({'message': 'If an account exists with this email, a password reset link has been sent'}), 200

    # Invalidate any existing tokens for this user
    PasswordResetToken.invalidate_user_tokens(user.user_id)

    # Create new reset token
    reset_token = PasswordResetToken.create_token(
        user_id=user.user_id,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )

    # TODO: Send email with reset link
    # For now, we'll just return the token (in production, this should be sent via email)
    reset_url = f"{request.host_url}reset-password?token={reset_token.token}"
    return jsonify({
        'message': 'If an account exists with this email, a password reset link has been sent',
        'reset_url': reset_url  # Remove this in production
    })

@flask_app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    # Get and validate the token
    reset_token = PasswordResetToken.get_valid_token(token)
    if not reset_token:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    try:
        # Get the user
        user = User.query.get(reset_token.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 400

        # Update the password
        user.set_password(new_password)
        
        # Mark token as used
        reset_token.mark_as_used()
        
        # Log the password reset
        log_audit(
            user_id=user.user_id,
            action='password_reset',
            entity_type='user',
            entity_id=user.user_id,
            details=f"Password reset via token {token[:8]}..."
        )

        db.session.commit()
        return jsonify({'message': 'Password has been reset successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reset password'}), 500

@flask_app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Log the logout
        log_audit(
            user_id=user.user_id,
            action='logout',
            entity_type='user',
            entity_id=user.user_id,
            details=f"User logout: {user.email}"
        )
        
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed'}), 500

@flask_app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Get the JWT claims
        claims = get_jwt()
        user_data = user.to_dict()
        
        # Add claims to the response
        user_data.update({
            'user_type': claims.get('user_type', user.user_type),
            'email': claims.get('email', user.email)
        })
            
        return jsonify(user_data), 200
            
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        return jsonify({'error': 'Failed to get user info'}), 500

@flask_app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        current_user_id = get_jwt_identity()
        profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        
        if not profile:
            # Create profile if it doesn't exist
            profile = UserProfile(user_id=current_user_id)
            db.session.add(profile)
            db.session.commit()
            
        return jsonify(profile.to_dict()), 200
            
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({'error': 'Failed to get profile info'}), 500

@flask_app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    try:
        current_user_id = get_jwt_identity()
        profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        user = User.query.get(current_user_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
            
        data = request.get_json()
        
        # Update all profile fields
        updateable_fields = [
            'bio', 'age', 'gender', 'location', 'fitness_level', 'goals',
            'preferences', 'timezone', 'contact_number', 'emergency_contact',
            'health_conditions', 'height', 'weight', 'activity_level',
            'workout_preferences', 'dietary_preferences', 'allergies', 'injury_history'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(profile, field, data[field])
                
        profile.updated_at = datetime.now()
        db.session.commit()
        logger.info(f"Successfully updated profile for user {current_user_id}")
        
        # Log the profile update
        log_audit(
            user_id=current_user_id,
            action='update',
            entity_type='user_profile',
            entity_id=profile.profile_id,
            details=f"Updated profile fields: {', '.join(field for field in data.keys())}"
        )
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

@flask_app.route('/api/user', methods=['PUT'])
@jwt_required()
def update_user():
    try:
        current_user_id = get_jwt_identity()
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate data
        if 'first_name' in data and (len(data['first_name']) < 1 or len(data['first_name']) > 50):
            return jsonify({'error': 'First name must be between 1 and 50 characters'}), 400
            
        if 'last_name' in data and (len(data['last_name']) < 1 or len(data['last_name']) > 50):
            return jsonify({'error': 'Last name must be between 1 and 50 characters'}), 400
            
        if 'profile_image_url' in data and data['profile_image_url'] and not data['profile_image_url'].startswith(('http://', 'https://')):
            return jsonify({'error': 'Invalid profile image URL'}), 400
            
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Store old values for audit log
        old_values = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile_image_url': user.profile_image_url
        }
        
        # Update user fields
        for field in ['first_name', 'last_name', 'profile_image_url']:
            if field in data:
                setattr(user, field, data[field])
        
        # Update password if provided
        if 'password' in data and data['password']:
            if len(data['password']) < 8:
                return jsonify({'error': 'Password must be at least 8 characters'}), 400
            user.set_password(data['password'])
        
        user.updated_at = datetime.now()
        db.session.commit()

        # Create audit log with changed fields
        changed_fields = []
        for field in ['first_name', 'last_name', 'profile_image_url']:
            if field in data and data[field] != old_values[field]:
                changed_fields.append(field)
        if 'password' in data and data['password']:
            changed_fields.append('password')

        if changed_fields:
            log_audit(
                user_id=current_user_id,
                action='update',
                entity_type='user',
                entity_id=user.user_id,
                details=f"Updated user fields: {', '.join(changed_fields)}"
            )
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
            
    except Exception as e:
        logger.error(f"Update user error for user {current_user_id if 'current_user_id' in locals() else 'unknown'}: {str(e)}")
        return jsonify({'error': 'Failed to update user'}), 500

@flask_app.route('/')
def home():
    return f"Hello from {ENVIRONMENT} environment!"

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            logger.info(f"Admin check for user ID: {current_user_id}")
            
            user = User.query.get(current_user_id)
            
            if not user:
                logger.error(f"Admin check failed: User {current_user_id} not found")
                return jsonify({'error': 'User not found'}), 404
                
            logger.info(f"User type: {user.user_type}")
            
            if user.user_type != 'admin':
                logger.error(f"Admin check failed: User {current_user_id} is not an admin")
                return jsonify({'error': 'Admin access required'}), 403
                
            return fn(*args, **kwargs)
        except Exception as e:
            logger.error(f"Admin check error: {str(e)}")
            return jsonify({'error': 'Authorization failed'}), 401
    return wrapper

# Admin Dashboard Statistics
@flask_app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    try:
        # Get total users count
        total_users = User.query.count()
        
        # Get active users count
        active_users = User.query.filter_by(is_active=True).count()
        
        # Get new users this month
        today = datetime.now()
        first_day = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = User.query.filter(User.created_at >= first_day).count()
        
        # Get total workouts (placeholder - implement based on your workout model)
        total_workouts = 0  # Replace with actual workout count when implemented
        
        stats = {
            'totalUsers': total_users,
            'activeUsers': active_users,
            'newUsersThisMonth': new_users_this_month,
            'totalWorkouts': total_workouts
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error fetching admin stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch admin statistics'}), 500

# User Management Endpoints
@flask_app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': 'Failed to fetch users'}), 500

@flask_app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def admin_update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()

        # Store old values for audit log
        old_values = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'user_type': user.user_type
        }
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'user_type' in data:
            old_type = user.user_type
            new_type = data['user_type']
            user.user_type = new_type
            
            # Handle coach profile creation/deletion when changing user type
            if old_type != 'coach' and new_type == 'coach':
                # Check if coach profile already exists
                if not CoachProfile.query.filter_by(user_id=user_id).first():
                    coach_profile = CoachProfile(
                        user_id=user_id,
                        specializations='General Fitness',
                        experience_years=0,
                        rating=0.0,
                        bio=''
                    )
                    db.session.add(coach_profile)
                    logger.info(f"Created new coach profile for user {user_id}")
            elif old_type == 'coach' and new_type != 'coach':
                coach_profile = CoachProfile.query.filter_by(user_id=user_id).first()
                if coach_profile:
                    db.session.delete(coach_profile)
                    logger.info(f"Deleted coach profile for user {user_id}")
        
        db.session.commit()

        # Create audit log with changed fields
        changed_fields = []
        for field in ['first_name', 'last_name', 'email', 'user_type']:
            if field in data and data[field] != old_values[field]:
                changed_fields.append(f"{field}: {old_values[field]} → {data[field]}")

        if changed_fields:
            admin_user_id = get_jwt_identity()
            log_audit(
                user_id=admin_user_id,
                action='update',
                entity_type='user',
                entity_id=user.user_id,
                details=f"Admin updated user fields: {', '.join(changed_fields)}"
            )

        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update user'}), 500

@flask_app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"Attempt to delete non-existent user with ID: {user_id}")
            return jsonify({'error': 'User not found'}), 404
            
        if user.user_type == 'admin':
            logger.warning(f"Attempt to delete admin user with ID: {user_id}")
            return jsonify({'error': 'Cannot delete admin users'}), 403
            
        # Store user details for audit log
        user_details = f"{user.first_name} {user.last_name} ({user.email})"
        user_type = user.user_type

        try:
            # 1. Delete coach-client relationships first
            logger.info(f"Deleting coach-client relationships for user {user_id}")
            CoachClient.query.filter_by(client_id=user_id).delete()
            if user.coach_profile:
                CoachClient.query.filter_by(coach_id=user.coach_profile.profile_id).delete()

            # 2. Delete training plan assignments
            logger.info(f"Deleting training plan assignments for user {user_id}")
            UserTrainingPlan.query.filter_by(user_id=user_id).delete()

            # 3. Delete meal plan assignments
            logger.info(f"Deleting meal plan assignments for user {user_id}")
            UserMealPlan.query.filter_by(user_id=user_id).delete()

            # 4. Delete progress records
            logger.info(f"Deleting progress records for user {user_id}")
            ProgressTracking.query.filter_by(user_id=user_id).delete()

            # 5. Delete body metrics
            logger.info(f"Deleting body metrics for user {user_id}")
            BodyMetrics.query.filter_by(user_id=user_id).delete()

            # 6. Delete coach profile if exists
            if user.coach_profile:
                logger.info(f"Deleting coach profile for user {user_id}")
                db.session.delete(user.coach_profile)

            # 7. Delete user profile
            if user.profile:
                logger.info(f"Deleting user profile for user {user_id}")
                db.session.delete(user.profile)

            # 8. Delete audit logs
            logger.info(f"Deleting audit logs for user {user_id}")
            AuditLog.query.filter_by(user_id=user_id).delete()

            # 9. Finally delete the user
            logger.info(f"Deleting user {user_id}")
            db.session.delete(user)
            
            # Commit all changes
            db.session.commit()

            # Create final audit log for the deletion
            admin_user_id = get_jwt_identity()
            log_audit(
                user_id=admin_user_id,
                action='delete',
                entity_type='user',
                entity_id=user_id,
                details=f"Admin deleted {user_type} user: {user_details}"
            )

            return jsonify({'message': 'User deleted successfully'}), 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error while deleting user {user_id}: {str(e)}")
            return jsonify({'error': f'Failed to delete user due to database constraints: {str(e)}'}), 409
            
    except Exception as e:
        logger.error(f"Error in delete_user endpoint for user {user_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete user'}), 500

@flask_app.route('/api/admin/users/<int:user_id>/status', methods=['PATCH'])
@admin_required
def toggle_user_status(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"[toggle_user_status] Attempt to toggle status of non-existent user with ID: {user_id}")
            return jsonify({'error': 'User not found'}), 404
            
        # Check if user is an admin
        if user.user_type == 'admin':
            logger.warning(f"[toggle_user_status] Attempt to toggle status of admin user with ID: {user_id}")
            return jsonify({'error': 'Cannot modify admin user status'}), 403
            
        data = request.get_json()
        logger.info(f"[toggle_user_status] Parsed data: {data}")
        
        if not data or 'status' not in data:
            logger.warning(f"[toggle_user_status] Status not provided in request for user ID: {user_id}")
            return jsonify({'error': 'Status not provided'}), 400
            
        new_status = data.get('status')
        if new_status not in ['active', 'inactive']:
            logger.warning(f"[toggle_user_status] Invalid status value provided: {new_status}")
            return jsonify({'error': 'Invalid status value'}), 400
            
        # Store old status for audit log
        old_status = 'active' if user.is_active else 'inactive'

        # Convert status string to boolean for is_active
        user.is_active = (new_status == 'active')
        logger.info(f"[toggle_user_status] Setting user {user_id} status to {new_status} (is_active: {user.is_active})")
        
        try:
            db.session.commit()

            # Create audit log
            admin_user_id = get_jwt_identity()
            log_audit(
                user_id=admin_user_id,
                action='update',
                entity_type='user_status',
                entity_id=user_id,
                details=f"Admin changed user status from {old_status} to {new_status} for user: {user.first_name} {user.last_name}"
            )

            logger.info(f"[toggle_user_status] Successfully updated status for user {user_id} to {new_status}")
            return jsonify(user.to_dict()), 200
        except Exception as e:
            logger.error(f"[toggle_user_status] Database error while updating user status: {str(e)}")
            db.session.rollback()
            return jsonify({'error': 'Database error while updating user status'}), 500
        
    except Exception as e:
        logger.error(f"[toggle_user_status] Error toggling user status for user {user_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update user status'}), 500

# System Settings Endpoints
@flask_app.route('/api/admin/settings', methods=['GET'])
@admin_required
def get_system_settings():
    try:
        settings = SystemSettings.query.first()
        if not settings:
            # Create default settings if none exist
            settings = SystemSettings()
            db.session.add(settings)
            db.session.commit()
            
        return jsonify(settings.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error fetching system settings: {str(e)}")
        return jsonify({'error': 'Failed to fetch system settings'}), 500

@flask_app.route('/api/admin/settings', methods=['PUT'])
@admin_required
def update_system_settings():
    try:
        settings = SystemSettings.query.first()
        if not settings:
            settings = SystemSettings()
            db.session.add(settings)
            
        data = request.get_json()
        
        # Update settings fields
        settings.site_name = data.get('siteName', settings.site_name)
        settings.site_description = data.get('siteDescription', settings.site_description)
        settings.maintenance_mode = data.get('maintenanceMode', settings.maintenance_mode)
        settings.allow_registrations = data.get('allowNewRegistrations', settings.allow_registrations)
        settings.max_users_per_trainer = data.get('maxUsersPerTrainer', settings.max_users_per_trainer)
        settings.default_user_quota = data.get('defaultUserQuota', settings.default_user_quota)
        settings.email_notifications = data.get('emailNotifications', settings.email_notifications)
        settings.auto_backup = data.get('autoBackup', settings.auto_backup)
        settings.backup_frequency = data.get('backupFrequency', settings.backup_frequency)
        settings.analytics_enabled = data.get('analyticsEnabled', settings.analytics_enabled)
        settings.updated_by = get_jwt_identity()
        
        db.session.commit()
        return jsonify(settings.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error updating system settings: {str(e)}")
        return jsonify({'error': 'Failed to update system settings'}), 500

# Coach Profile Endpoints
@flask_app.route('/api/coach/profile', methods=['GET'])
@jwt_required()
def get_coach_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        coach_profile = user.coach_profile
        if not coach_profile:
            # Create profile if it doesn't exist
            coach_profile = CoachProfile(user_id=current_user_id)
            db.session.add(coach_profile)
            db.session.commit()
            
        return jsonify(coach_profile.to_dict()), 200
            
    except Exception as e:
        logger.error(f"Get coach profile error: {str(e)}")
        return jsonify({'error': 'Failed to get coach profile'}), 500

@flask_app.route('/api/coach/profile', methods=['PUT'])
@jwt_required()
def update_coach_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Not authorized'}), 403
            
        coach_profile = CoachProfile.query.filter_by(user_id=current_user_id).first()
        if not coach_profile:
            return jsonify({'error': 'Coach profile not found'}), 404
            
        data = request.get_json()
        
        # Update coach profile fields
        for field in ['specializations', 'experience_years', 'bio', 'certifications']:
            if field in data:
                setattr(coach_profile, field, data[field])
                
        coach_profile.updated_at = datetime.now()
        db.session.commit()
        
        # Log the coach profile update
        log_audit(
            user_id=current_user_id,
            action='update',
            entity_type='coach_profile',
            entity_id=coach_profile.profile_id,
            details=f"Updated coach profile fields: {', '.join(field for field in data.keys())}"
        )
        
        return jsonify({
            'message': 'Coach profile updated successfully',
            'profile': coach_profile.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating coach profile: {str(e)}")
        return jsonify({'error': 'Failed to update coach profile'}), 500

@flask_app.route('/api/admin/users/<int:user_id>/coach-profile', methods=['GET'])
@admin_required
def get_user_coach_profile(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if user.user_type != 'coach':
            return jsonify({'error': 'User is not a coach'}), 400
            
        coach_profile = user.coach_profile
        if not coach_profile:
            return jsonify({'error': 'Coach profile not found'}), 404
            
        return jsonify(coach_profile.to_dict()), 200
            
    except Exception as e:
        logger.error(f"Get user coach profile error: {str(e)}")
        return jsonify({'error': 'Failed to get coach profile'}), 500

@flask_app.route('/api/admin/users/<int:user_id>/coach-profile', methods=['PUT'])
@admin_required
def admin_update_coach_profile(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if user.user_type != 'coach':
            return jsonify({'error': 'User is not a coach'}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        coach_profile = user.coach_profile
        if not coach_profile:
            coach_profile = CoachProfile(user_id=user_id)
            db.session.add(coach_profile)
            
        # Update coach profile fields
        if 'specializations' in data:
            coach_profile.specializations = data['specializations']
        if 'experience_years' in data:
            coach_profile.experience_years = data['experience_years']
        if 'rating' in data:
            coach_profile.rating = data['rating']
        if 'bio' in data:
            coach_profile.bio = data['bio']
            
        db.session.commit()
        return jsonify({
            'message': 'Coach profile updated successfully',
            'profile': coach_profile.to_dict()
        }), 200
            
    except Exception as e:
        logger.error(f"Admin update coach profile error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update coach profile'}), 500

# Coach Statistics Endpoint
@flask_app.route('/api/coach/stats', methods=['GET'])
@jwt_required()
def get_coach_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        # Get coach profile
        coach_profile = user.coach_profile
        if not coach_profile:
            return jsonify({'error': 'Coach profile not found'}), 404

        # Get total clients count
        total_clients = CoachClient.query.filter_by(
            coach_id=coach_profile.profile_id,
            status='active'
        ).count()
        
        # Get active programs (placeholder until program model is implemented)
        active_programs = 0
        
        # Get coach's rating
        average_rating = float(coach_profile.rating) if coach_profile and coach_profile.rating else 0.0
        
        # Get upcoming sessions (placeholder until session model is implemented)
        upcoming_sessions = 0
        
        # Convert specializations string to array if it's a string
        specializations = []
        if coach_profile.specializations:
            if isinstance(coach_profile.specializations, str):
                specializations = [s.strip() for s in coach_profile.specializations.split(',')]
            elif isinstance(coach_profile.specializations, list):
                specializations = coach_profile.specializations
        
        stats = {
            'totalClients': total_clients,
            'activePrograms': active_programs,
            'averageRating': average_rating,
            'upcomingSessions': upcoming_sessions,
            'experience_years': coach_profile.experience_years or 0,
            'specializations': specializations
        }
        
        return jsonify(stats), 200
            
    except Exception as e:
        logger.error(f"Error fetching coach stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch coach statistics'}), 500

# Admin endpoint to deactivate a coach-client assignment
@flask_app.route('/api/admin/coach-clients/<int:coach_id>/deactivate', methods=['PATCH'])
@admin_required
def deactivate_coach_assignment(coach_id):
    try:
        data = request.get_json()
        if not data or 'client_id' not in data:
            return jsonify({'error': 'Client ID not provided'}), 400

        client_id = data['client_id']
        
        # Find the active assignment
        assignment = CoachClient.query.filter_by(
            coach_id=coach_id,
            client_id=client_id,
            status='active'
        ).first()
        
        if not assignment:
            return jsonify({'error': 'Active assignment not found'}), 404
            
        # Get coach and client details for audit log
        coach_profile = CoachProfile.query.get(coach_id)
        coach = User.query.get(coach_profile.user_id) if coach_profile else None
        client = User.query.get(client_id)
        
        # Store old status for audit log
        old_status = assignment.status

        # Deactivate the assignment
        assignment.status = 'inactive'
        db.session.commit()

        # Create audit log
        admin_user_id = get_jwt_identity()
        log_audit(
            user_id=admin_user_id,
            action='update',
            entity_type='coach_client',
            entity_id=assignment.id,
            details=f"Admin deactivated coach-client relationship: Coach {coach.first_name} {coach.last_name} and Client {client.first_name} {client.last_name}"
        )
        
        return jsonify({
            'message': 'Coach assignment deactivated successfully',
            'assignment': assignment.to_dict()
        }), 200
            
    except Exception as e:
        logger.error(f"Error deactivating coach assignment: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to deactivate coach assignment'}), 500

# Admin endpoint to assign a client to a coach
@flask_app.route('/api/admin/assign-client', methods=['POST'])
@jwt_required()
def assign_client():
    try:
        # Check if user is admin
        current_user_id = get_jwt_identity()
        admin = User.query.get(current_user_id)
        if not admin or admin.user_type != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        if not data or 'coach_id' not in data or 'client_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        # Verify coach exists and is actually a coach
        coach = User.query.get(data['coach_id'])
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            return jsonify({'error': 'Invalid coach ID'}), 400

        # Verify client exists and is a regular user
        client = User.query.get(data['client_id'])
        if not client or client.user_type != 'user':
            return jsonify({'error': 'Invalid client ID'}), 400

        # Check if client is already assigned to a coach
        existing_assignment = CoachClient.query.filter_by(
            client_id=data['client_id'],
            status='active'
        ).first()
        
        if existing_assignment and existing_assignment.coach_id == coach.coach_profile.profile_id:
            return jsonify({'error': 'Client is already assigned to this coach'}), 400

        # Create new coach-client relationship
        new_assignment = CoachClient(
            coach_id=coach.coach_profile.profile_id,
            client_id=data['client_id'],
            status='active'
        )
        
        db.session.add(new_assignment)
        db.session.commit()

        # Log the client assignment
        log_audit(
            user_id=current_user_id,
            action='create',
            entity_type='coach_client',
            entity_id=new_assignment.id,
            details=f"Assigned client {data['client_id']} to coach {data['coach_id']}"
        )

        return jsonify({
            'message': 'Client assigned successfully',
            'assignment': new_assignment.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Error assigning client to coach: {str(e)}")
        return jsonify({'error': 'Failed to assign client'}), 500

# Coach endpoint to get their clients
@flask_app.route('/api/coach/clients', methods=['GET'])
@jwt_required()
def get_coach_clients():
    try:
        # Check if user is a coach
        current_user_id = get_jwt_identity()
        logger.info(f"[get_coach_clients] Current user ID: {current_user_id}")
        
        coach = User.query.get(current_user_id)
        logger.info(f"[get_coach_clients] Coach user type: {coach.user_type if coach else 'None'}")
        
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            logger.error(f"[get_coach_clients] Access denied - User type: {coach.user_type if coach else 'None'}, Has coach profile: {bool(coach.coach_profile if coach else None)}")
            return jsonify({'error': 'Unauthorized access'}), 403

        # Log debug information
        logger.info(f"[get_coach_clients] Coach profile ID: {coach.coach_profile.profile_id}")

        # Get all active clients for this coach
        coach_clients = CoachClient.query.filter_by(
            coach_id=coach.coach_profile.profile_id,
            status='active'
        ).all()

        # Log the query results
        logger.info(f"[get_coach_clients] Found {len(coach_clients)} active clients")

        # Include more client information in response
        clients_data = []
        for client_rel in coach_clients:
            client = User.query.get(client_rel.client_id)
            if client:
                # Get the client's profile
                client_profile = UserProfile.query.filter_by(user_id=client.user_id).first()
                
                # Get the client's assigned training plan
                assigned_plan = UserTrainingPlan.query.filter_by(
                    user_id=client.user_id,
                    status='in_progress'
                ).first()

                # Get the latest body metrics
                latest_metrics = BodyMetrics.query.filter_by(
                    user_id=client.user_id
                ).order_by(BodyMetrics.date.desc()).first()
                
                client_data = {
                    'id': client_rel.id,
                    'client_id': client.user_id,
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'full_name': f"{client.first_name} {client.last_name}",
                    'email': client.email,
                    'profile_image_url': client.profile_image_url,
                    'assigned_at': client_rel.assigned_at.isoformat() if client_rel.assigned_at else None,
                    'status': client_rel.status,
                    'profile': client_profile.to_dict() if client_profile else None,
                    'assigned_plan_id': assigned_plan.plan_id if assigned_plan else None,
                    'latest_metrics': latest_metrics.to_dict() if latest_metrics else None
                }
                clients_data.append(client_data)
                logger.info(f"[get_coach_clients] Added client data: {client_data['full_name']}")

        # Sort clients by name
        clients_data.sort(key=lambda x: x['full_name'])

        response_data = {
            'clients': clients_data,
            'total_count': len(clients_data)
        }
        logger.info(f"[get_coach_clients] Sending response with {len(clients_data)} clients")
        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"[get_coach_clients] Error retrieving coach clients: {str(e)}")
        return jsonify({'error': 'Failed to retrieve clients'}), 500

@flask_app.route('/api/admin/coach-clients', methods=['GET'])
@jwt_required()
def get_all_coach_clients():
    try:
        # Check if user is admin
        current_user_id = get_jwt_identity()
        admin = User.query.get(current_user_id)
        if not admin or admin.user_type != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get all coach-client relationships
        all_assignments = CoachClient.query.all()

        return jsonify({
            'assignments': [assignment.to_dict() for assignment in all_assignments]
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving all coach-client assignments: {str(e)}")
        return jsonify({'error': 'Failed to retrieve assignments'}), 500

@flask_app.route('/api/debug/coach-clients', methods=['GET'])
@jwt_required()
def debug_coach_clients():
    try:
        # Get all coach-client relationships
        all_relationships = CoachClient.query.all()
        logger.info(f"[debug] Total coach-client relationships: {len(all_relationships)}")
        
        relationships_data = []
        for rel in all_relationships:
            coach_profile = CoachProfile.query.get(rel.coach_id)
            coach = User.query.get(coach_profile.user_id) if coach_profile else None
            client = User.query.get(rel.client_id)
            
            rel_data = {
                'id': rel.id,
                'coach_id': rel.coach_id,
                'coach_name': f"{coach.first_name} {coach.last_name}" if coach else "Unknown",
                'client_id': rel.client_id,
                'client_name': f"{client.first_name} {client.last_name}" if client else "Unknown",
                'status': rel.status,
                'assigned_at': rel.assigned_at.isoformat()
            }
            relationships_data.append(rel_data)
            logger.info(f"[debug] Relationship: {rel_data}")
        
        return jsonify({
            'relationships': relationships_data,
            'count': len(relationships_data)
        }), 200
        
    except Exception as e:
        logger.error(f"[debug] Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Coach Settings Endpoints
@flask_app.route('/api/coach/settings', methods=['GET'])
@jwt_required()
def get_coach_settings():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        coach_profile = user.coach_profile
        if not coach_profile:
            return jsonify({'error': 'Coach profile not found'}), 404

        settings = {
            'specializations': coach_profile.specializations,
            'experience_years': coach_profile.experience_years,
            'bio': coach_profile.bio,
            'rating': coach_profile.rating,
            'profile_id': coach_profile.profile_id,
            'user_id': coach_profile.user_id,
            'created_at': coach_profile.created_at.isoformat() if coach_profile.created_at else None,
            'updated_at': coach_profile.updated_at.isoformat() if coach_profile.updated_at else None
        }
        
        return jsonify(settings), 200
            
    except Exception as e:
        logger.error(f"Error fetching coach settings: {str(e)}")
        return jsonify({'error': 'Failed to fetch coach settings'}), 500

@flask_app.route('/api/coach/settings', methods=['PUT'])
@jwt_required()
def update_coach_settings():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        coach_profile = user.coach_profile
        if not coach_profile:
            return jsonify({'error': 'Coach profile not found'}), 404

        # Store old values for audit log
        old_values = {
            'specializations': coach_profile.specializations,
            'experience_years': coach_profile.experience_years,
            'bio': coach_profile.bio
        }
            
        # Update coach profile fields
        if 'specializations' in data:
            coach_profile.specializations = data['specializations']
        if 'experience_years' in data:
            coach_profile.experience_years = data['experience_years']
        if 'bio' in data:
            coach_profile.bio = data['bio']
            
        coach_profile.updated_at = datetime.now()
        db.session.commit()

        # Create audit log with changed fields
        changed_fields = []
        for field in ['specializations', 'experience_years', 'bio']:
            if field in data and str(data[field]) != str(old_values[field]):
                changed_fields.append(f"{field}: {old_values[field]} → {data[field]}")

        if changed_fields:
            log_audit(
                user_id=current_user_id,
                action='update',
                entity_type='coach_profile',
                entity_id=coach_profile.profile_id,
                details=f"Updated coach settings: {', '.join(changed_fields)}"
            )
        
        return jsonify({
            'message': 'Coach settings updated successfully',
            'settings': {
                'specializations': coach_profile.specializations,
                'experience_years': coach_profile.experience_years,
                'bio': coach_profile.bio,
                'rating': coach_profile.rating,
                'profile_id': coach_profile.profile_id,
                'user_id': coach_profile.user_id,
                'created_at': coach_profile.created_at.isoformat() if coach_profile.created_at else None,
                'updated_at': coach_profile.updated_at.isoformat() if coach_profile.updated_at else None
            }
        }), 200
            
    except Exception as e:
        logger.error(f"Error updating coach settings: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update coach settings'}), 500

# Add Flask routes for training plans
@flask_app.route('/api/training-plans', methods=['GET'])
@jwt_required()
def get_training_plans():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        training_plans = TrainingPlan.query.filter_by(coach_id=current_user_id).all()
        return jsonify([plan.to_dict() for plan in training_plans]), 200
            
    except Exception as e:
        logger.error(f"Error fetching training plans: {str(e)}")
        return jsonify({'error': 'Failed to fetch training plans'}), 500

@flask_app.route('/api/training-plans', methods=['POST'])
@jwt_required()
def create_training_plan():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type not in ['coach', 'admin']:
            return jsonify({'error': 'Not authorized'}), 403
            
        data = request.get_json()
        
        new_plan = TrainingPlan(
            coach_id=user.user_id,
            title=data.get('title'),
            description=data.get('description'),
            difficulty_level=data.get('difficulty_level'),
            duration_weeks=data.get('duration_weeks'),
            target_muscle_groups=data.get('target_muscle_groups'),
            equipment_needed=data.get('equipment_needed')
        )
        
        db.session.add(new_plan)
        db.session.commit()

        # Log the training plan creation
        log_audit(
            user_id=user.user_id,
            action='create',
            entity_type='training_plan',
            entity_id=new_plan.plan_id,
            details=f"Created training plan: {new_plan.title}"
        )

        return jsonify(new_plan.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating training plan: {str(e)}")
        return jsonify({'error': 'Failed to create training plan'}), 500

@flask_app.route('/api/training-plans/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_training_plan(plan_id):
    try:
        logger.info(f"Fetching training plan with ID: {plan_id}")
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            logger.error(f"User not found for ID: {current_user_id}")
            return jsonify({'error': 'User not found'}), 404
            
        plan = TrainingPlan.query.get(plan_id)
        if not plan:
            logger.error(f"Training plan not found for ID: {plan_id}")
            return jsonify({'error': 'Training plan not found'}), 404
            
        # Check if user is authorized to view this plan
        if user.user_type != 'coach' and plan.coach_id != current_user_id:
            logger.error(f"User {current_user_id} not authorized to view plan {plan_id}")
            return jsonify({'error': 'Not authorized to view this plan'}), 403
            
        plan_data = plan.to_dict()
        exercises = PlanExercise.query.filter_by(plan_id=plan_id).all()
        plan_data['exercises'] = [exercise.to_dict() for exercise in exercises]
        
        logger.info(f"Successfully fetched plan {plan_id} with {len(exercises)} exercises")
        return jsonify(plan_data), 200
            
    except Exception as e:
        logger.error(f"Error fetching training plan: {str(e)}")
        return jsonify({'error': 'Failed to fetch training plan'}), 500

@flask_app.route('/api/training-plans/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_training_plan(plan_id):
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        plan = TrainingPlan.query.get(plan_id)
        
        if not plan:
            return jsonify({'error': 'Training plan not found'}), 404
            
        if plan.coach_id != current_user_id and user.user_type != 'admin':
            return jsonify({'error': 'Not authorized'}), 403
            
        data = request.get_json()
        
        # Update fields
        for field in ['title', 'description', 'difficulty_level', 'duration_weeks', 
                     'target_muscle_groups', 'equipment_needed']:
            if field in data:
                setattr(plan, field, data[field])
                
        plan.updated_at = datetime.now()
        db.session.commit()

        # Log the training plan update
        log_audit(
            user_id=current_user_id,
            action='update',
            entity_type='training_plan',
            entity_id=plan.plan_id,
            details=f"Updated training plan: {plan.title}"
        )
        
        return jsonify(plan.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating training plan: {str(e)}")
        return jsonify({'error': 'Failed to update training plan'}), 500

@flask_app.route('/api/training-plans/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_training_plan(plan_id):
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        plan = TrainingPlan.query.get(plan_id)
        
        if not plan:
            return jsonify({'error': 'Training plan not found'}), 404
            
        if plan.coach_id != current_user_id and user.user_type != 'admin':
            return jsonify({'error': 'Not authorized'}), 403

        plan_title = plan.title  # Store title before deletion for audit log
        db.session.delete(plan)
        db.session.commit()

        # Log the training plan deletion
        log_audit(
            user_id=current_user_id,
            action='delete',
            entity_type='training_plan',
            entity_id=plan_id,
            details=f"Deleted training plan: {plan_title}"
        )
        
        return jsonify({'message': 'Training plan deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting training plan: {str(e)}")
        return jsonify({'error': 'Failed to delete training plan'}), 500

# OpenAI API Endpoints
@flask_app.route('/api/training-plans/<int:plan_id>/exercises', methods=['POST'])
@jwt_required()
def create_exercise(plan_id):
    try:
        logger.info(f"Creating new exercise for plan ID: {plan_id}")
        current_user_id = get_jwt_identity()
        current_user_id = int(current_user_id)  # Convert to integer
        user = db.session.get(User, current_user_id)
        
        if not user or user.user_type != 'coach':
            logger.error(f"Access denied: User {current_user_id} is not a coach")
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        plan = TrainingPlan.query.get(plan_id)
        if not plan:
            logger.error(f"Training plan not found for ID: {plan_id}")
            return jsonify({'error': 'Training plan not found'}), 404
            
        if int(plan.coach_id) != current_user_id:  # Convert plan.coach_id to integer as well
            logger.error(f"Access denied: User {current_user_id} not authorized to modify plan {plan_id}")
            return jsonify({'error': 'Access denied: Not authorized to modify this plan'}), 403
            
        data = request.get_json()
        if not data:
            logger.error("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
            
        logger.info(f"Creating exercise with data: {data}")
        new_exercise = PlanExercise(
            plan_id=plan_id,
            name=data['name'],
            description=data.get('description'),
            sets=data.get('sets'),
            reps=data.get('reps'),
            intensity=data.get('intensity'),
            rest_period=data.get('rest_period'),
            special_instructions=data.get('special_instructions'),
            week_number=data.get('week_number'),
            day_number=data.get('day_number'),
            order_in_day=data.get('order_in_day'),
            video_url=data.get('video_url'),
            image_url=data.get('image_url')
        )
        
        db.session.add(new_exercise)
        db.session.commit()

        # Create audit log
        log_audit(
            user_id=current_user_id,
            action='create',
            entity_type='exercise',
            entity_id=new_exercise.exercise_id,
            details=f"Added exercise '{new_exercise.name}' to training plan '{plan.title}'"
        )
        
        logger.info(f"Successfully created exercise for plan {plan_id}")
        return jsonify(new_exercise.to_dict()), 201
            
    except Exception as e:
        logger.error(f"Error creating exercise: {str(e)}")
        logger.error(f"Request data: {request.get_json()}")
        db.session.rollback()
        return jsonify({'error': f'Failed to create exercise: {str(e)}'}), 500

@flask_app.route('/api/training-plans/<int:plan_id>/exercises/<int:exercise_id>', methods=['PUT'])
@jwt_required()
def update_exercise(plan_id, exercise_id):
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        exercise = PlanExercise.query.get(exercise_id)
        if not exercise or exercise.plan_id != plan_id:
            return jsonify({'error': 'Exercise not found'}), 404
            
        plan = TrainingPlan.query.get(plan_id)
        if plan.coach_id != current_user_id:
            return jsonify({'error': 'Access denied: Not authorized to modify this plan'}), 403
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Store old values for audit log
        old_values = {
            'name': exercise.name,
            'description': exercise.description,
            'sets': exercise.sets,
            'reps': exercise.reps,
            'intensity': exercise.intensity,
            'rest_period': exercise.rest_period,
            'special_instructions': exercise.special_instructions,
            'week_number': exercise.week_number,
            'day_number': exercise.day_number,
            'order_in_day': exercise.order_in_day
        }
            
        # Update exercise fields
        exercise.name = data.get('name', exercise.name)
        exercise.description = data.get('description', exercise.description)
        exercise.sets = data.get('sets', exercise.sets)
        exercise.reps = data.get('reps', exercise.reps)
        exercise.intensity = data.get('intensity', exercise.intensity)
        exercise.rest_period = data.get('rest_period', exercise.rest_period)
        exercise.special_instructions = data.get('special_instructions', exercise.special_instructions)
        exercise.week_number = data.get('week_number', exercise.week_number)
        exercise.day_number = data.get('day_number', exercise.day_number)
        exercise.order_in_day = data.get('order_in_day', exercise.order_in_day)
        exercise.video_url = data.get('video_url', exercise.video_url)
        exercise.image_url = data.get('image_url', exercise.image_url)
        
        db.session.commit()

        # Create audit log with changed fields
        changed_fields = []
        for field in old_values.keys():
            if field in data and str(data[field]) != str(old_values[field]):
                changed_fields.append(f"{field}: {old_values[field]} → {data[field]}")

        if changed_fields:
            log_audit(
                user_id=current_user_id,
                action='update',
                entity_type='exercise',
                entity_id=exercise.exercise_id,
                details=f"Updated exercise '{exercise.name}' in training plan '{plan.title}': {', '.join(changed_fields)}"
            )

        return jsonify(exercise.to_dict()), 200
            
    except Exception as e:
        logger.error(f"Error updating exercise: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update exercise'}), 500

@flask_app.route('/api/training-plans/<int:plan_id>/exercises/<int:exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(plan_id, exercise_id):
    try:
        current_user_id = get_jwt_identity()
        current_user_id = int(current_user_id) 
        user = db.session.get(User, current_user_id)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        exercise = PlanExercise.query.get(exercise_id)
        if not exercise or exercise.plan_id != plan_id:
            return jsonify({'error': 'Exercise not found'}), 404
            
        plan = TrainingPlan.query.get(plan_id)
        if int(plan.coach_id) != current_user_id:  # Convert plan.coach_id to integer as well
            return jsonify({'error': 'Access denied: Not authorized to modify this plan'}), 403
            
        db.session.delete(exercise)
        db.session.commit()
        return jsonify({'message': 'Exercise deleted successfully'}), 200
            
    except Exception as e:
        logger.error(f"Error deleting exercise: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete exercise'}), 500

@flask_app.route('/api/meal-plans', methods=['GET'])
@jwt_required()
def get_meal_plans():
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal_plans = MealPlan.query.filter_by(coach_id=user.user_id).all()
        return jsonify([plan.to_dict() for plan in meal_plans])
    except Exception as e:
        print(f"Error fetching meal plans: {str(e)}")
        return jsonify({'error': 'Failed to fetch meal plans'}), 500

@flask_app.route('/api/meal-plans', methods=['POST'])
@jwt_required()
def create_meal_plan():
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        data = request.get_json()
        current_time = datetime.now()
        
        new_plan = MealPlan(
            coach_id=user.user_id,
            name=data.get('name'),
            description=data.get('description'),
            total_calories=data.get('total_calories'),
            total_protein=data.get('total_protein'),
            total_carbs=data.get('total_carbs'),
            total_fats=data.get('total_fats'),
            dietary_preferences=data.get('dietary_preferences'),
            updated_at=current_time
        )
        
        db.session.add(new_plan)
        db.session.commit()
        
        # Log the meal plan creation
        log_audit(
            user_id=user.user_id,
            action='create',
            entity_type='meal_plan',
            entity_id=new_plan.plan_id,
            details=f"Created meal plan: {new_plan.name}"
        )
        
        return jsonify(new_plan.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating meal plan: {str(e)}")
        return jsonify({'error': 'Failed to create meal plan'}), 500

@flask_app.route('/api/meal-plans/<plan_id>', methods=['PUT'])
@jwt_required()
def update_meal_plan(plan_id):
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal_plan = MealPlan.query.get(plan_id)
        
        if not meal_plan or meal_plan.coach_id != user.user_id:
            return jsonify({'error': 'Meal plan not found'}), 404
            
        data = request.get_json()

        # Store old values for audit log
        old_values = {
            'name': meal_plan.name,
            'description': meal_plan.description,
            'total_calories': meal_plan.total_calories,
            'total_protein': meal_plan.total_protein,
            'total_carbs': meal_plan.total_carbs,
            'total_fats': meal_plan.total_fats,
            'dietary_preferences': meal_plan.dietary_preferences
        }
        
        meal_plan.name = data.get('name', meal_plan.name)
        meal_plan.description = data.get('description', meal_plan.description)
        meal_plan.total_calories = data.get('total_calories', meal_plan.total_calories)
        meal_plan.total_protein = data.get('total_protein', meal_plan.total_protein)
        meal_plan.total_carbs = data.get('total_carbs', meal_plan.total_carbs)
        meal_plan.total_fats = data.get('total_fats', meal_plan.total_fats)
        meal_plan.dietary_preferences = data.get('dietary_preferences', meal_plan.dietary_preferences)
        
        db.session.commit()

        # Create audit log with changed fields
        changed_fields = []
        for field in old_values.keys():
            if field in data and str(data[field]) != str(old_values[field]):
                changed_fields.append(f"{field}: {old_values[field]} → {data[field]}")

        if changed_fields:
            log_audit(
                user_id=user.user_id,
                action='update',
                entity_type='meal_plan',
                entity_id=meal_plan.plan_id,
                details=f"Updated meal plan '{meal_plan.name}': {', '.join(changed_fields)}"
            )
        
        return jsonify(meal_plan.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating meal plan: {str(e)}")
        return jsonify({'error': 'Failed to update meal plan'}), 500

@flask_app.route('/api/meal-plans/<plan_id>', methods=['DELETE'])
@jwt_required()
def delete_meal_plan(plan_id):
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal_plan = MealPlan.query.get(plan_id)
        
        if not meal_plan or meal_plan.coach_id != user.user_id:
            return jsonify({'error': 'Meal plan not found'}), 404

        # Store meal plan details for audit log
        plan_name = meal_plan.name
            
        db.session.delete(meal_plan)
        db.session.commit()

        # Create audit log
        log_audit(
            user_id=user.user_id,
            action='delete',
            entity_type='meal_plan',
            entity_id=plan_id,
            details=f"Deleted meal plan: {plan_name}"
        )
        
        return jsonify({'message': 'Meal plan deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting meal plan: {str(e)}")
        return jsonify({'error': 'Failed to delete meal plan'}), 500

@flask_app.route('/api/meal-plans/<plan_id>/meals', methods=['GET'])
@jwt_required()
def get_meals(plan_id):
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal_plan = MealPlan.query.get(plan_id)
        if not meal_plan or meal_plan.coach_id != user.user_id:
            return jsonify({'error': 'Meal plan not found'}), 404
            
        meals = Meal.query.filter_by(meal_plan_id=plan_id).all()
        return jsonify([meal.to_dict() for meal in meals])
    except Exception as e:
        print(f"Error fetching meals: {str(e)}")
        return jsonify({'error': 'Failed to fetch meals'}), 500

@flask_app.route('/api/meal-plans/<plan_id>/meals', methods=['POST'])
@jwt_required()
def create_meal(plan_id):
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal_plan = MealPlan.query.get(plan_id)
        if not meal_plan or meal_plan.coach_id != user.user_id:
            return jsonify({'error': 'Meal plan not found'}), 404
            
        data = request.get_json()
        logger.info(f"Creating meal with data: {data}")
        
        # Validate required fields
        required_fields = ['name', 'meal_type', 'day_of_week']
        if not all(field in data and data[field] for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            current_time = datetime.now()
            new_meal = Meal(
                meal_plan_id=plan_id,
                name=data.get('name').strip(),
                description=data.get('description', '').strip(),
                calories=int(data.get('calories', 0)),
                protein=int(data.get('protein', 0)),
                carbs=int(data.get('carbs', 0)),
                fats=int(data.get('fats', 0)),
                meal_type=data.get('meal_type'),
                ingredients=data.get('ingredients', '').strip(),
                cooking_instructions=data.get('instructions', '').strip(),
                day_of_week=data.get('day_of_week'),
                meal_time=data.get('meal_time'),
                updated_at=current_time
            )
            
            db.session.add(new_meal)
            db.session.commit()

            # Create audit log
            log_audit(
                user_id=user.user_id,
                action='create',
                entity_type='meal',
                entity_id=new_meal.meal_id,
                details=f"Added meal '{new_meal.name}' to meal plan '{meal_plan.name}'"
            )

            logger.info(f"Successfully created meal: {new_meal.to_dict()}")
            
            return jsonify(new_meal.to_dict()), 201
            
        except Exception as e:
            logger.error(f"Database error while creating meal: {str(e)}")
            db.session.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500
            
    except Exception as e:
        logger.error(f"Error creating meal: {str(e)}")
        return jsonify({'error': str(e)}), 500

@flask_app.route('/api/meal-plans/<plan_id>/meals/<meal_id>', methods=['PUT'])
@jwt_required()
def update_meal(plan_id, meal_id):
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal = Meal.query.get(meal_id)
        if not meal or meal.meal_plan_id != plan_id:
            return jsonify({'error': 'Meal not found'}), 404
            
        meal_plan = MealPlan.query.get(plan_id)
        if not meal_plan or meal_plan.coach_id != user.user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        data = request.get_json()
        logger.info(f"Updating meal {meal_id} with data: {data}")

        # Store old values for audit log
        old_values = {
            'name': meal.name,
            'description': meal.description,
            'calories': meal.calories,
            'protein': meal.protein,
            'carbs': meal.carbs,
            'fats': meal.fats,
            'meal_type': meal.meal_type,
            'ingredients': meal.ingredients,
            'cooking_instructions': meal.cooking_instructions,
            'day_of_week': meal.day_of_week,
            'meal_time': meal.meal_time
        }
        
        # Update with proper type conversions
        if 'name' in data:
            meal.name = data['name'].strip()
        if 'description' in data:
            meal.description = data.get('description', '').strip()
        if 'calories' in data:
            meal.calories = int(data.get('calories', 0))
        if 'protein' in data:
            meal.protein = int(data.get('protein', 0))
        if 'carbs' in data:
            meal.carbs = int(data.get('carbs', 0))
        if 'fats' in data:
            meal.fats = int(data.get('fats', 0))
        if 'meal_type' in data:
            meal.meal_type = data['meal_type']
        if 'ingredients' in data:
            meal.ingredients = data.get('ingredients', '').strip()
        if 'instructions' in data:
            meal.cooking_instructions = data.get('instructions', '').strip()
        if 'day_of_week' in data:
            meal.day_of_week = data['day_of_week']
        if 'meal_time' in data:
            meal.meal_time = data.get('meal_time')
            
        meal.updated_at = datetime.now()
        
        db.session.commit()

        # Create audit log with changed fields
        changed_fields = []
        for field in old_values.keys():
            new_value = data.get(field, getattr(meal, field))
            if str(new_value) != str(old_values[field]):
                changed_fields.append(f"{field}: {old_values[field]} → {new_value}")

        if changed_fields:
            log_audit(
                user_id=user.user_id,
                action='update',
                entity_type='meal',
                entity_id=meal.meal_id,
                details=f"Updated meal '{meal.name}' in meal plan '{meal_plan.name}': {', '.join(changed_fields)}"
            )

        logger.info(f"Successfully updated meal {meal_id}")
        
        return jsonify(meal.to_dict())
    except Exception as e:
        logger.error(f"Error updating meal {meal_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Failed to update meal: {str(e)}'}), 500

@flask_app.route('/api/meal-plans/<plan_id>/meals/<meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(plan_id, meal_id):
    try:
        current_user = get_jwt_identity()
        user = db.session.get(User, current_user)
        
        if not user or user.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        meal = Meal.query.get(meal_id)
        if not meal or str(meal.meal_plan_id) != plan_id:
            return jsonify({'error': 'Meal not found'}), 404
            
        meal_plan = MealPlan.query.get(plan_id)
        if not meal_plan or meal_plan.coach_id != user.user_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Store meal details for audit log
        meal_name = meal.name
            
        db.session.delete(meal)
        db.session.commit()

        # Create audit log
        log_audit(
            user_id=user.user_id,
            action='delete',
            entity_type='meal',
            entity_id=meal_id,
            details=f"Deleted meal '{meal_name}' from meal plan '{meal_plan.name}'"
        )
        
        return jsonify({'message': 'Meal deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting meal: {str(e)}")
        return jsonify({'error': 'Failed to delete meal'}), 500

@flask_app.route('/api/coach/clients/<int:client_id>/assign-plan', methods=['POST'])
@jwt_required()
def assign_training_plan(client_id):
    try:
        # Get the current user (coach)
        current_user_id = get_jwt_identity()
        coach = db.session.get(User, current_user_id)
        
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            return jsonify({'error': 'Access denied: User is not a coach'}), 403
            
        coach_profile_id = coach.coach_profile.profile_id
        
        # Verify the client belongs to this coach
        client_relation = CoachClient.query.filter_by(
            coach_id=coach_profile_id,
            client_id=client_id
        ).first()
        
        if not client_relation:
            return jsonify({'error': 'Client not found or not assigned to you'}), 404
            
        data = request.get_json()
        plan_id = data.get('plan_id')

        # Get client details for audit log
        client = db.session.get(User, client_id)
        
        if not plan_id:
            # If no plan_id is provided, remove any existing assignment
            old_assignment = UserTrainingPlan.query.filter_by(user_id=client_id).first()
            if old_assignment:
                old_plan = TrainingPlan.query.get(old_assignment.plan_id)
                UserTrainingPlan.query.filter_by(user_id=client_id).delete()
                db.session.commit()

                # Log the plan removal
                log_audit(
                    user_id=current_user_id,
                    action='delete',
                    entity_type='training_plan_assignment',
                    entity_id=old_assignment.assignment_id,
                    details=f"Removed training plan '{old_plan.title}' from client {client.first_name} {client.last_name}"
                )

            return jsonify({'message': 'Training plan assignment removed'}), 200
            
        # Verify the training plan exists and belongs to this coach
        plan = TrainingPlan.query.filter_by(
            plan_id=plan_id,
            coach_id=current_user_id
        ).first()
        
        if not plan:
            return jsonify({'error': 'Training plan not found or not owned by you'}), 404
            
        # Remove any existing plan assignments for this user
        old_assignment = UserTrainingPlan.query.filter_by(user_id=client_id).first()
        if old_assignment:
            old_plan = TrainingPlan.query.get(old_assignment.plan_id)
            UserTrainingPlan.query.filter_by(user_id=client_id).delete()

            # Log the plan removal
            log_audit(
                user_id=current_user_id,
                action='delete',
                entity_type='training_plan_assignment',
                entity_id=old_assignment.assignment_id,
                details=f"Removed previous training plan '{old_plan.title}' from client {client.first_name} {client.last_name}"
            )
        
        # Create new plan assignment
        new_assignment = UserTrainingPlan(
            user_id=client_id,
            plan_id=plan_id,
            start_date=datetime.utcnow(),
            status='in_progress',
            progress=0.0
        )
        
        db.session.add(new_assignment)
        db.session.commit()

        # Log the new plan assignment
        log_audit(
            user_id=current_user_id,
            action='create',
            entity_type='training_plan_assignment',
            entity_id=new_assignment.assignment_id,
            details=f"Assigned training plan '{plan.title}' to client {client.first_name} {client.last_name}"
        )
        
        return jsonify({
            'message': 'Training plan assigned successfully',
            'assignment': new_assignment.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error assigning training plan: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to assign training plan'}), 500

@flask_app.route('/api/user/training-plan', methods=['GET'])
@jwt_required()
def get_user_training_plan():
    try:
        user_id = get_jwt_identity()
        logger.info(f"[get_user_training_plan] Fetching training plan for user: {user_id}")
        
        # Get the user's current training plan assignment
        assignment = UserTrainingPlan.query.filter_by(
            user_id=user_id,
            status='in_progress'
        ).first()
        
        if not assignment:
            logger.info(f"[get_user_training_plan] No active training plan found for user: {user_id}")
            return jsonify({
                'message': 'No active training plan found',
                'training_plan': None,
                'exercises': []
            }), 200
            
        logger.info(f"[get_user_training_plan] Found assignment: {assignment.to_dict()}")
            
        # Get the training plan details
        plan = TrainingPlan.query.get(assignment.plan_id)
        if not plan:
            logger.error(f"[get_user_training_plan] Training plan not found for ID: {assignment.plan_id}")
            return jsonify({'error': 'Training plan not found'}), 404
            
        logger.info(f"[get_user_training_plan] Found training plan: {plan.title}")
            
        # Get all exercises for this plan
        exercises = PlanExercise.query.filter_by(plan_id=plan.plan_id).all()
        logger.info(f"[get_user_training_plan] Found {len(exercises)} exercises for plan: {plan.plan_id}")
        
        return jsonify({
            'training_plan': plan.to_dict(),
            'exercises': [exercise.to_dict() for exercise in exercises]
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching user training plan: {str(e)}")
        return jsonify({'error': 'Failed to fetch training plan'}), 500

# Add these endpoints after the get_user_training_plan endpoint

@flask_app.route('/api/user/progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    try:
        user_id = get_jwt_identity()
        logger.info(f"[get_user_progress] Fetching progress for user: {user_id}")
        
        # Get the user's current training plan assignment
        assignment = UserTrainingPlan.query.filter_by(
            user_id=user_id,
            status='in_progress'
        ).first()
        
        if not assignment:
            logger.info(f"[get_user_progress] No active training plan found for user: {user_id}")
            return jsonify({
                'message': 'No active training plan found',
                'progress_records': []
            }), 200
            
        # Get the training plan details
        plan = TrainingPlan.query.get(assignment.plan_id)
        if not plan:
            logger.error(f"[get_user_progress] Training plan not found for ID: {assignment.plan_id}")
            return jsonify({'error': 'Training plan not found'}), 404
            
        # Get all exercises for this plan
        exercises = PlanExercise.query.filter_by(plan_id=plan.plan_id).all()
        exercise_ids = [exercise.exercise_id for exercise in exercises]
        
        # Get all progress records for these exercises
        progress_records = ProgressTracking.query.filter(
            ProgressTracking.user_id == user_id,
            ProgressTracking.exercise_id.in_(exercise_ids)
        ).order_by(ProgressTracking.date.desc()).all()
        
        logger.info(f"[get_user_progress] Found {len(progress_records)} progress records for user: {user_id}")
        
        # Prepare response with exercise details
        response_data = []
        for record in progress_records:
            exercise = next((ex for ex in exercises if ex.exercise_id == record.exercise_id), None)
            if exercise:
                record_data = record.to_dict()
                record_data['exercise'] = exercise.to_dict()
                response_data.append(record_data)
        
        return jsonify({
            'progress_records': response_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching user progress: {str(e)}")
        return jsonify({'error': 'Failed to fetch progress records'}), 500

@flask_app.route('/api/user/progress', methods=['POST'])
@jwt_required()
def add_progress_record():
    try:
        user_id = get_jwt_identity()
        logger.info(f"[add_progress_record] Adding progress record for user: {user_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate required fields
        required_fields = ['exercise_id', 'sets_completed', 'reps_completed']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Create new progress record
        new_record = ProgressTracking(
            user_id=user_id,
            exercise_id=data['exercise_id'],
            sets_completed=data['sets_completed'],
            reps_completed=data['reps_completed'],
            weight_used=data.get('weight_used'),
            duration_minutes=data.get('duration_minutes'),
            notes=data.get('notes'),
            rating=data.get('rating')
        )
        
        db.session.add(new_record)
        db.session.commit()
        
        
        # Get the exercise details
        exercise = PlanExercise.query.get(data['exercise_id'])
        
        # Prepare response
        response_data = new_record.to_dict()
        if exercise:
            response_data['exercise'] = exercise.to_dict()
        
        return jsonify({
            'message': 'Progress record added successfully',
            'progress_record': response_data
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding progress record: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to add progress record'}), 500

@flask_app.route('/api/user/progress/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_progress_record(record_id):
    try:
        user_id = get_jwt_identity()
        logger.info(f"[update_progress_record] Updating progress record {record_id} for user: {user_id}")
        
        # Find the progress record
        record = ProgressTracking.query.filter_by(
            tracking_id=record_id,
            user_id=user_id
        ).first()
        
        if not record:
            logger.error(f"[update_progress_record] Progress record {record_id} not found for user: {user_id}")
            return jsonify({'error': 'Progress record not found'}), 404
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Update record fields
        if 'sets_completed' in data:
            record.sets_completed = data['sets_completed']
        if 'reps_completed' in data:
            record.reps_completed = data['reps_completed']
        if 'weight_used' in data:
            record.weight_used = data['weight_used']
        if 'duration_minutes' in data:
            record.duration_minutes = data['duration_minutes']
        if 'notes' in data:
            record.notes = data['notes']
        if 'rating' in data:
            record.rating = data['rating']
            
        db.session.commit()
        
        logger.info(f"[update_progress_record] Successfully updated progress record {record_id} for user: {user_id}")
        
        # Get the exercise details
        exercise = PlanExercise.query.get(record.exercise_id)
        
        # Prepare response
        response_data = record.to_dict()
        if exercise:
            response_data['exercise'] = exercise.to_dict()
        
        return jsonify({
            'message': 'Progress record updated successfully',
            'progress_record': response_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating progress record: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update progress record'}), 500

@flask_app.route('/api/user/progress/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_progress_record(record_id):
    try:
        user_id = get_jwt_identity()
        logger.info(f"[delete_progress_record] Deleting progress record {record_id} for user: {user_id}")
        
        # Find the progress record
        record = ProgressTracking.query.filter_by(
            tracking_id=record_id,
            user_id=user_id
        ).first()
        
        if not record:
            logger.error(f"[delete_progress_record] Progress record {record_id} not found for user: {user_id}")
            return jsonify({'error': 'Progress record not found'}), 404
            
        db.session.delete(record)
        db.session.commit()
        
        logger.info(f"[delete_progress_record] Successfully deleted progress record {record_id} for user: {user_id}")
        
        return jsonify({
            'message': 'Progress record deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting progress record: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete progress record'}), 500

# Body Metrics Endpoints
@flask_app.route('/api/user/body-metrics', methods=['GET'])
@jwt_required()
def get_body_metrics():
    try:
        metrics = BodyMetrics.query.filter_by(user_id=get_jwt_identity()).order_by(BodyMetrics.date.desc()).all()
        return jsonify({
            'status': 'success',
            'body_metrics': [metric.to_dict() for metric in metrics]
        })
    except Exception as e:
        print(f"Error fetching body metrics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch body metrics'
        }), 500

@flask_app.route('/api/user/body-metrics', methods=['POST'])
@jwt_required()
def add_body_metrics():
    try:
        logger.info("[add_body_metrics] Starting to process new body metrics")
        user_id = get_jwt_identity()
        logger.info(f"[add_body_metrics] Processing for user: {user_id}")
        
        # Get user profile to access height
        user_profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not user_profile or not user_profile.height:
            return jsonify({
                'status': 'error',
                'message': 'Height must be set in user profile before adding body metrics'
            }), 400
        
        # Log the incoming data
        logger.info(f"[add_body_metrics] Form data: {request.form}")
        logger.info(f"[add_body_metrics] Files: {request.files}")

        # Handle file upload if present
        photo_url = None
        if 'photo' in request.files:
            photo = request.files['photo']
            if photo.filename:
                logger.info(f"[add_body_metrics] Processing photo: {photo.filename}")
                filename = secure_filename(f"{uuid.uuid4()}_{photo.filename}")
                photo_path = os.path.join(flask_app.config['UPLOAD_FOLDER'], 'progress_photos', filename)
                logger.info(f"[add_body_metrics] Saving photo to: {photo_path}")
                os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                photo.save(photo_path)
                photo_url = f"/uploads/progress_photos/{filename}"
                logger.info(f"[add_body_metrics] Photo saved, URL: {photo_url}")

        # Parse and validate numeric values
        try:
            weight = float(request.form.get('weight')) if request.form.get('weight') else None
            body_fat = float(request.form.get('body_fat')) if request.form.get('body_fat') else None
            muscle_mass = float(request.form.get('muscle_mass')) if request.form.get('muscle_mass') else None
            
            # Validate weight (in kg, reasonable range 30-300)
            if weight and (weight < 30 or weight > 300):
                return jsonify({
                    'status': 'error',
                    'message': 'Weight must be between 30 and 300 kg'
                }), 400

            # Validate body fat percentage (0-100)
            if body_fat and (body_fat < 0 or body_fat > 100):
                return jsonify({
                    'status': 'error',
                    'message': 'Body fat percentage must be between 0 and 100'
                }), 400

            # Calculate BMI using height from user profile
            bmi = None
            if weight:
                height_in_meters = float(user_profile.height) / 100  # Convert height to meters
                bmi = round(weight / (height_in_meters * height_in_meters), 2)
                logger.info(f"[add_body_metrics] Calculated BMI: {bmi}")
                
                # Validate BMI is within database constraints (0-99.99)
                if bmi > 99.99:
                    return jsonify({
                        'status': 'error',
                        'message': 'Calculated BMI exceeds maximum allowed value'
                    }), 400

        except ValueError as ve:
            logger.error(f"[add_body_metrics] Error parsing numeric values: {str(ve)}")
            return jsonify({
                'status': 'error',
                'message': 'Invalid numeric values provided'
            }), 400

        # Create new body metrics record
        try:
            new_metrics = BodyMetrics(
                user_id=user_id,
                weight=weight,
                height=user_profile.height,  # Use height from user profile
                body_fat=body_fat,
                muscle_mass=muscle_mass,
                photo_url=photo_url,
                notes=request.form.get('notes'),
                bmi=bmi,
                date=datetime.now()
            )

            logger.info("[add_body_metrics] Adding new metrics to database")
            db.session.add(new_metrics)
            db.session.commit()
            logger.info("[add_body_metrics] Successfully saved body metrics")

            return jsonify({
                'status': 'success',
                'message': 'Body metrics added successfully',
                'body_metrics': new_metrics.to_dict()
            })
        except Exception as e:
            logger.error(f"[add_body_metrics] Database error: {str(e)}")
            db.session.rollback()
            return jsonify({
                'status': 'error',
                'message': f'Database error: {str(e)}'
            }), 500
            
    except Exception as e:
        logger.error(f"[add_body_metrics] Error: {str(e)}")
        if 'db' in locals():
            db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to add body metrics: {str(e)}'
        }), 500

@flask_app.route('/api/user/body-metrics/<int:metric_id>', methods=['PUT'])
@jwt_required()
def update_body_metrics(metric_id):
    try:
        current_user_id = get_jwt_identity()
        metric = BodyMetrics.query.filter_by(
            metric_id=metric_id,
            user_id=current_user_id
        ).first()

        if not metric:
            return jsonify({
                'status': 'error',
                'message': 'Body metric record not found'
            }), 404

        # Get user profile for height
        user_profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        if not user_profile or not user_profile.height:
            return jsonify({
                'status': 'error',
                'message': 'Height must be set in user profile before updating body metrics'
            }), 400

        # Handle file upload if present
        if 'photo' in request.files:
            photo = request.files['photo']
            if photo.filename:
                # Delete old photo if exists
                if metric.photo_url:
                    old_photo_path = os.path.join(flask_app.config['UPLOAD_FOLDER'], metric.photo_url.lstrip('/uploads/'))
                    if os.path.exists(old_photo_path):
                        os.remove(old_photo_path)

                filename = secure_filename(f"{uuid.uuid4()}_{photo.filename}")
                photo_path = os.path.join(flask_app.config['UPLOAD_FOLDER'], 'progress_photos', filename)
                os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                photo.save(photo_path)
                metric.photo_url = f"/uploads/progress_photos/{filename}"

        # Update other fields
        if 'weight' in request.form:
            try:
                weight = float(request.form.get('weight'))
                if weight < 30 or weight > 300:
                    return jsonify({
                        'status': 'error',
                        'message': 'Weight must be between 30 and 300 kg'
                    }), 400
                metric.weight = weight
                
                # Recalculate BMI using height from user profile
                height_in_meters = float(user_profile.height) / 100
                metric.bmi = round(weight / (height_in_meters * height_in_meters), 2)
                
                if metric.bmi > 99.99:
                    return jsonify({
                        'status': 'error',
                        'message': 'Calculated BMI exceeds maximum allowed value'
                    }), 400
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid weight value'
                }), 400

        if 'body_fat' in request.form:
            try:
                body_fat = float(request.form.get('body_fat'))
                if body_fat < 0 or body_fat > 100:
                    return jsonify({
                        'status': 'error',
                        'message': 'Body fat percentage must be between 0 and 100'
                    }), 400
                metric.body_fat = body_fat
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid body fat value'
                }), 400

        if 'muscle_mass' in request.form:
            try:
                metric.muscle_mass = float(request.form.get('muscle_mass'))
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid muscle mass value'
                }), 400

        if 'notes' in request.form:
            metric.notes = request.form.get('notes')

        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Body metrics updated successfully',
            'body_metrics': metric.to_dict()
        })

    except Exception as e:
        logger.error(f"Error updating body metrics: {str(e)}")
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Failed to update body metrics'
        }), 500

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
flask_app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(os.path.join(UPLOAD_FOLDER, 'progress_photos'), exist_ok=True)

# Add route to serve uploaded files
@flask_app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_file(os.path.join(flask_app.config['UPLOAD_FOLDER'], filename))

# Coach endpoints for client progress
@flask_app.route('/api/coach/clients/<int:client_id>/info', methods=['GET'])
@jwt_required()
def get_client_info(client_id):
    try:
        # Get the current user (coach)
        current_user_id = get_jwt_identity()
        coach = User.query.get(current_user_id)
        
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            return jsonify({'error': 'Access denied: User is not a coach'}), 403

        # Verify client belongs to this coach
        client_relation = CoachClient.query.filter_by(
            coach_id=coach.coach_profile.profile_id,
            client_id=client_id,
            status='active'
        ).first()
        
        if not client_relation:
            return jsonify({'error': 'Client not found or not assigned to you'}), 404

        # Get client info
        client = User.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        return jsonify({
            'client': {
                'client_id': client.user_id,
                'name': f"{client.first_name} {client.last_name}",
                'email': client.email,
                'profile_image_url': client.profile_image_url
            }
        }), 200

    except Exception as e:
        logger.error(f"Error getting client info: {str(e)}")
        return jsonify({'error': 'Failed to get client info'}), 500

@flask_app.route('/api/coach/clients/<int:client_id>/progress', methods=['GET'])
@jwt_required()
def get_client_progress(client_id):
    try:
        # Get the current user (coach)
        current_user_id = get_jwt_identity()
        coach = User.query.get(current_user_id)
        
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            return jsonify({'error': 'Access denied: User is not a coach'}), 403

        # Verify client belongs to this coach
        client_relation = CoachClient.query.filter_by(
            coach_id=coach.coach_profile.profile_id,
            client_id=client_id,
            status='active'
        ).first()
        
        if not client_relation:
            return jsonify({'error': 'Client not found or not assigned to you'}), 404

        # Get progress records
        progress_records = ProgressTracking.query.filter_by(user_id=client_id).all()
        records = []
        for record in progress_records:
            exercise = PlanExercise.query.get(record.exercise_id)
            record_data = record.to_dict()
            record_data['exercise'] = exercise.to_dict() if exercise else {'name': 'Unknown Exercise'}
            records.append(record_data)

        return jsonify({'progress_records': records}), 200

    except Exception as e:
        logger.error(f"Error getting client progress: {str(e)}")
        return jsonify({'error': 'Failed to get client progress'}), 500

@flask_app.route('/api/coach/clients/<int:client_id>/metrics', methods=['GET'])
@jwt_required()
def get_client_metrics(client_id):
    try:
        # Get the current user (coach)
        current_user_id = get_jwt_identity()
        coach = User.query.get(current_user_id)
        
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            return jsonify({'error': 'Access denied: User is not a coach'}), 403

        # Verify client belongs to this coach
        client_relation = CoachClient.query.filter_by(
            coach_id=coach.coach_profile.profile_id,
            client_id=client_id,
            status='active'
        ).first()
        
        if not client_relation:
            return jsonify({'error': 'Client not found or not assigned to you'}), 404

        # Get body metrics
        metrics = BodyMetrics.query.filter_by(user_id=client_id).order_by(BodyMetrics.date.desc()).all()
        metrics_list = [metric.to_dict() for metric in metrics]

        return jsonify({'body_metrics': metrics_list}), 200

    except Exception as e:
        logger.error(f"Error getting client metrics: {str(e)}")
        return jsonify({'error': 'Failed to get client metrics'}), 500

@flask_app.route('/api/coach/clients/<int:client_id>/exercises', methods=['GET'])
@jwt_required()
def get_client_exercises(client_id):
    try:
        # Get the current user (coach)
        current_user_id = get_jwt_identity()
        coach = User.query.get(current_user_id)
        
        if not coach or coach.user_type != 'coach' or not coach.coach_profile:
            return jsonify({'error': 'Access denied: User is not a coach'}), 403

        # Verify client belongs to this coach
        client_relation = CoachClient.query.filter_by(
            coach_id=coach.coach_profile.profile_id,
            client_id=client_id,
            status='active'
        ).first()
        
        if not client_relation:
            return jsonify({'error': 'Client not found or not assigned to you'}), 404

        # Get client's training plan
        user_plan = UserTrainingPlan.query.filter_by(
            user_id=client_id,
            status='in_progress'
        ).first()

        if not user_plan:
            return jsonify({'exercises': []}), 200

        # Get all exercises for this plan
        exercises = PlanExercise.query.filter_by(plan_id=user_plan.plan_id).all()
        exercise_list = [exercise.to_dict() for exercise in exercises]

        return jsonify({'exercises': exercise_list}), 200

    except Exception as e:
        logger.error(f"Error getting client exercises: {str(e)}")
        return jsonify({'error': 'Failed to get client exercises'}), 500

@flask_app.route('/api/admin/training-plans', methods=['GET'])
@jwt_required()
def get_all_training_plans():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied: User is not an admin'}), 403
            
        training_plans = TrainingPlan.query.all()
        return jsonify([plan.to_dict() for plan in training_plans]), 200
            
    except Exception as e:
        logger.error(f"Error fetching all training plans: {str(e)}")
        return jsonify({'error': 'Failed to fetch training plans'}), 500

@flask_app.route('/api/coach/clients/<int:client_id>/assign-meal-plan', methods=['POST'])
@jwt_required()
def assign_meal_plan(client_id):
    try:
        current_user_id = get_jwt_identity()
        coach = User.query.get(current_user_id)
        
        if not coach or coach.user_type != 'coach':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        meal_plan_id = data.get('meal_plan_id')
        
        if not meal_plan_id:
            return jsonify({'error': 'Meal plan ID is required'}), 400
            
        # Check if meal plan exists and belongs to the coach
        meal_plan = MealPlan.query.get(meal_plan_id)
        if not meal_plan or meal_plan.coach_id != current_user_id:
            return jsonify({'error': 'Meal plan not found or not owned by you'}), 404

        # Get client details for audit log
        client = User.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
            
        # Create or update user meal plan
        user_plan = UserMealPlan.query.filter_by(user_id=client_id).first()
        if user_plan:
            # Store old plan details for audit log
            old_plan = MealPlan.query.get(user_plan.plan_id)
            if old_plan:
                log_audit(
                    user_id=current_user_id,
                    action='delete',
                    entity_type='meal_plan_assignment',
                    entity_id=user_plan.assignment_id,
                    details=f"Removed previous meal plan '{old_plan.name}' from client {client.first_name} {client.last_name}"
                )
        else:
            user_plan = UserMealPlan(user_id=client_id)
            
        user_plan.plan_id = meal_plan_id
        user_plan.status = 'active'
        db.session.add(user_plan)
        db.session.commit()

        # Log the new meal plan assignment
        log_audit(
            user_id=current_user_id,
            action='create',
            entity_type='meal_plan_assignment',
            entity_id=user_plan.assignment_id,
            details=f"Assigned meal plan '{meal_plan.name}' to client {client.first_name} {client.last_name}"
        )
        
        return jsonify({'message': 'Meal plan assigned successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error assigning meal plan: {str(e)}")
        return jsonify({'error': 'Failed to assign meal plan'}), 500

@flask_app.route('/api/admin/meal-plans', methods=['GET'])
@jwt_required()
def get_all_meal_plans():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied: User is not an admin'}), 403
            
        meal_plans = MealPlan.query.all()
        return jsonify({'meal_plans': [plan.to_dict() for plan in meal_plans]}), 200
            
    except Exception as e:
        logger.error(f"Error fetching all meal plans: {str(e)}")
        return jsonify({'error': 'Failed to fetch meal plans'}), 500

@flask_app.route('/api/admin/meal-plans/<plan_id>', methods=['GET'])
@jwt_required()
def get_admin_meal_plan(plan_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied: User is not an admin'}), 403
            
        meal_plan = MealPlan.query.get(plan_id)
        if not meal_plan:
            return jsonify({'error': 'Meal plan not found'}), 404
            
        return jsonify(meal_plan.to_dict()), 200
            
    except Exception as e:
        logger.error(f"Error fetching meal plan: {str(e)}")
        return jsonify({'error': 'Failed to fetch meal plan'}), 500

@flask_app.route('/api/admin/training-plans/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_admin_training_plan(plan_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied: User is not an admin'}), 403
            
        plan = TrainingPlan.query.get(plan_id)
        if not plan:
            return jsonify({'error': 'Training plan not found'}), 404
            
        plan_data = plan.to_dict()
        exercises = PlanExercise.query.filter_by(plan_id=plan_id).all()
        plan_data['exercises'] = [exercise.to_dict() for exercise in exercises]
        
        return jsonify(plan_data), 200
            
    except Exception as e:
        logger.error(f"Error fetching training plan: {str(e)}")
        return jsonify({'error': 'Failed to fetch training plan'}), 500

# Audit Logs Endpoint
@flask_app.route('/api/admin/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs():
    try:
        logger.info(f"Received parameters: {request.args}")
        
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            sort_by = request.args.get('sort_by', 'created_at')
            sort_order = request.args.get('sort_order', 'desc')
            action = request.args.get('action')
            entity_type = request.args.get('entity_type')
            user_type = request.args.get('user_type')
            user_search = request.args.get('user_search', '').strip()
            
            logger.info(f"Parsed parameters: page={page}, per_page={per_page}, sort_by={sort_by}, sort_order={sort_order}")
            logger.info(f"Filters: action={action}, entity_type={entity_type}, user_type={user_type}, user_search={user_search}")
            
        except ValueError as e:
            logger.error(f"Invalid parameter value: {str(e)}")
            return jsonify({'error': f'Invalid parameter value: {str(e)}'}), 422

        query = AuditLog.query.join(User)

        if action:
            query = query.filter(AuditLog.action == action)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if user_type:
            query = query.filter(User.user_type == user_type)
        if user_search:
            search_term = f"%{user_search}%"
            query = query.filter(
                db.or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.email.ilike(search_term),
                    db.func.concat(User.first_name, ' ', User.last_name).ilike(search_term)
                )
            )

        valid_sort_fields = ['created_at', 'action', 'entity_type', 'entity_id']
        if sort_by not in valid_sort_fields:
            logger.error(f"Invalid sort field: {sort_by}")
            return jsonify({
                'error': f'Invalid sort field. Must be one of: {", ".join(valid_sort_fields)}'
            }), 422

        if sort_order == 'desc':
            query = query.order_by(desc(getattr(AuditLog, sort_by)))
        else:
            query = query.order_by(asc(getattr(AuditLog, sort_by)))

        total = query.count()
        logger.info(f"Total records found: {total}")

        logs = query.offset((page - 1) * per_page).limit(per_page).all()
        logger.info(f"Retrieved {len(logs)} records for page {page}")

        serialized_logs = []
        for log in logs:
            log_dict = {
                'id': log.id,
                'created_at': log.created_at.isoformat(),
                'action': log.action,
                'entity_type': log.entity_type,
                'entity_id': log.entity_id,
                'details': log.details,
                'ip_address': log.ip_address,
                'user': {
                    'id': log.user.user_id,
                    'first_name': log.user.first_name,
                    'last_name': log.user.last_name,
                    'email': log.user.email,
                    'user_type': log.user.user_type
                } if log.user else None
            }
            serialized_logs.append(log_dict)

        return jsonify({
            'logs': serialized_logs,
            'total': total
        }), 200

    except Exception as e:
        logger.error(f"Error fetching audit logs: {str(e)}")
        return jsonify({'error': f'Failed to fetch audit logs: {str(e)}'}), 500


@flask_app.route('/api/admin/invite-link', methods=['POST'])
@admin_required
def create_invite_link():
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400

        email = data['email']
        user_type = data.get('user_type', 'user')  # Default to 'user' if not specified
        
        # Validate user_type
        if user_type not in ['user', 'coach', 'admin']:
            return jsonify({'error': 'Invalid user type. Must be user, coach, or admin'}), 400

        current_user_id = get_jwt_identity()

        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409

        # Check if there's an active invite for this email
        existing_invite = InviteLink.query.filter_by(
            email=email, 
            is_used=False
        ).filter(InviteLink.expires_at > datetime.utcnow()).first()
        
        if existing_invite:
            return jsonify({'error': 'Active invitation already exists for this email'}), 409

        # Generate unique token
        token = secrets.token_urlsafe(32)
        
        # Create invite link that expires in 7 days
        invite = InviteLink(
            token=token,
            email=email,
            user_type=user_type,
            created_by=current_user_id,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.session.add(invite)
        db.session.commit()

        # Send invitation email
        try:
            invite_email = InviteEmail(email, token, user_type)
            html = invite_email.invite_mail()
            email_service.send_email(
                    to_email=email,
                    subject="Invite to Train-Sync",
                    html_content=html,
                    sender_name="TrainSync"
                )
        except Exception as e:
            # Log the error but don't fail the request
            print(f"Failed to send invitation email: {str(e)}")

        # Log the action
        log_audit(
            current_user_id,
            'create',
            'invite_link',
            invite.invite_id,
            {'email': email, 'user_type': user_type}
        )

        return jsonify({
            'message': 'Invite link created successfully',
            'invite': invite.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create invite link: {str(e)}'}), 500

@flask_app.route('/api/auth/verify-invite', methods=['GET'])
def verify_invite():
    token = request.args.get('token')
    if not token:
        return jsonify({'error': 'No token provided'}), 400

    invite = InviteLink.query.filter_by(token=token, is_used=False).first()
    
    if not invite:
        return jsonify({'error': 'Invalid or expired invitation'}), 404

    if invite.expires_at < datetime.now():
        return jsonify({'error': 'Invitation has expired'}), 410

    return jsonify({
        'valid': True,
        'email': invite.email
    }), 200


@flask_app.route('/api/auth/setup-password', methods=['POST'])
@jwt_required()
def setup_password():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if user came from an invite
        # if not user.is_invited:
        #     return jsonify({'error': 'Unauthorized. Only invited users can use this endpoint'}), 403

        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({'error': 'Password is required'}), 400

        password = data['password']
        
        # Validate password
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400

        # Hash and set the new password
        user.password = generate_password_hash(password)
        # user.is_invited = False  # Mark that the user has completed setup
        
        db.session.commit()

        # Log the action
        log_audit(
            current_user_id,
            'update',
            'user',
            user.user_id,
            {'action': 'password_setup'}
        )

        return jsonify({
            'message': 'Password set successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to set up password: {str(e)}'}), 500

def validate_user_profile_data(data):
    if 'age' in data and not (0 < int(data['age']) < 150):
        raise ValueError("Age must be between 1 and 149.")
    if 'height' in data and not (50 < int(data['height']) < 300):  # Assuming height is in cm
        raise ValueError("Height must be between 50 and 300 cm.")
    if 'weight' in data and not (10 < int(data['weight']) < 500):  # Assuming weight is in kg
        raise ValueError("Weight must be between 10 and 500 kg.")

# Example usage in update_user_profile
    try:
        validate_user_profile_data(data)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=8888, debug=True)
                