# FitnessApp - backend

on WSL

cd /mnt/path to backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn server:flask_app --host 0.0.0.0 --port 8888 --reload --log-level debug

# Fitness App Backend Features Documentation

## Core Features

### 1. User Management System
- **User Registration & Authentication**
  - Email-based registration system
  - JWT-based authentication
  - Password hashing with bcrypt
  - Invite link system for controlled registration
  - Password reset functionality

- **User Profiles**
  - Personal information management
  - Profile picture upload
  - User preferences and settings
  - Role-based profiles (User, Coach, Admin)

### 2. Coach-Client Relationship Management
- **Coach Features**
  - Coach profile creation and management
  - Client assignment and management
  - Training plan creation for clients
  - Meal plan creation for clients
  - Progress tracking for clients
  - Client communication tools

- **Client Features**
  - View assigned training plans
  - View assigned meal plans
  - Track personal progress
  - Submit body metrics
  - Communication with assigned coach

### 3. Training Management
- **Training Plans**
  - Create and customize training plans
  - Exercise library management
  - Exercise details (sets, reps, weights)
  - Exercise instructions and notes
  - Plan assignment to clients
  - Plan progress tracking

- **Exercise Tracking**
  - Log exercise performance
  - Track sets, reps, and weights
  - Record exercise notes
  - View exercise history
  - Progress visualization

### 4. Nutrition Management
- **Meal Plans**
  - Create and customize meal plans
  - Meal library management
  - Nutritional information tracking
  - Meal instructions and recipes
  - Plan assignment to clients
  - Plan adherence tracking

- **Meal Tracking**
  - Log daily meals
  - Track nutritional intake
  - Record meal notes
  - View meal history
  - Nutritional progress visualization

### 5. Progress Tracking
- **Body Metrics**
  - Weight tracking
  - Body measurements
  - Body fat percentage
  - Progress photos
  - Historical data visualization

- **Performance Metrics**
  - Exercise performance tracking
  - Strength progress
  - Endurance metrics
  - Custom metric tracking
  - Progress reports

### 6. Admin Dashboard
- **User Management**
  - User account management
  - Role assignment
  - Account status control
  - User activity monitoring

- **System Management**
  - System settings configuration
  - Coach-client assignment
  - Training plan oversight
  - Meal plan oversight
  - Audit log access

### 7. Communication Features
- **Email Notifications**
  - Registration confirmations
  - Password reset emails
  - Plan assignment notifications
  - Progress updates
  - System notifications

- **Coach-Client Communication**
  - Direct messaging system
  - Progress feedback
  - Plan adjustments
  - Support requests

### 8. Security Features
- **Authentication & Authorization**
  - JWT token-based authentication
  - Role-based access control
  - Secure password handling
  - Session management

- **Data Protection**
  - Secure file uploads
  - Data encryption
  - Audit logging
  - Access control

### 9. Integration Features
- **Payment Processing**
  - Stripe integration
  - Subscription management
  - Payment tracking
  - Billing history

- **AI Integration**
  - OpenAI integration for personalized recommendations
  - AI-powered progress analysis
  - Smart plan suggestions

### 10. Reporting & Analytics
- **Progress Reports**
  - Individual progress tracking
  - Client progress reports
  - Performance analytics
  - Goal achievement tracking

- **System Analytics**
  - User activity reports
  - System usage statistics
  - Performance metrics
  - Error tracking

## Technical Features

### 1. Database Support
- SQLite for development
- PostgreSQL for production
- Database migration support
- Backup and recovery

### 2. API Features
- RESTful API design
- JSON response format
- Rate limiting
- Error handling
- API documentation

### 3. File Management
- Secure file uploads
- Image processing
- File storage management
- Access control

### 4. Performance Features
- Caching system
- Query optimization
- Load balancing support
- Performance monitoring

### 5. Development Features
- Development environment setup
- Testing framework
- Debugging tools
- Logging system

