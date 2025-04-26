from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()


# Base class for SQLAlchemy models
Base = declarative_base()

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)

# Database configuration
def init_db(app):
    # Configure database based on environment variable
    db_switch = os.getenv("DATABASE_SWITCH", "sqlite").lower()
    
    if db_switch == "postgresql":
        try:
            # Get PostgreSQL connection details
            pg_user = os.getenv('POSTGRES_USER')
            pg_password = os.getenv('POSTGRES_PASSWORD')
            pg_host = os.getenv('POSTGRES_HOST')
            pg_port = os.getenv('POSTGRES_PORT', '5432')
            pg_db = os.getenv('POSTGRES_DB')
            
            # Set the database URI
            app.config["SQLALCHEMY_DATABASE_URI"] = (
                f"postgresql://{pg_user}:{pg_password}"
                f"@{pg_host}:{pg_port}"
                f"/{pg_db}"
            )
                
        except Exception as e:
            print(f"PostgreSQL configuration error: {e}")
            raise
    elif db_switch == "sqlite":
        try:
            sqlite_path = os.getenv("SQLITE_PATH", "sqlite:///database.db")
            app.config["SQLALCHEMY_DATABASE_URI"] = sqlite_path
        except Exception as e:
            print(f"SQLite configuration error: {e}")
            raise
    else:
        raise ValueError(f"Unsupported database type: {db_switch}")
    
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Initialize the app with SQLAlchemy first
    db.init_app(app)
    
    # Now we can use db.session within the app context
    with app.app_context():
        if db_switch == "postgresql":
            # Create schema if it doesn't exist
            db.session.execute(text('CREATE SCHEMA IF NOT EXISTS public'))
            db.session.commit()
        
        # Create all tables
        db.create_all()
        print("Database tables created successfully (if they didn't exist)")
