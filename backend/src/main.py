"""
PersonalizeAI Platform - Main Flask Application
AI-powered newsletter personalization for financial publishers
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=["*"])

# Database configuration
database_url = os.getenv('DATABASE_URL', 'sqlite:///personalizeai.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize database
db = SQLAlchemy(app)

# Import models and routes
from models.subscriber import Subscriber
from models.personalization import PersonalizationResult, ABTest
from routes.subscribers import subscribers_bp
from routes.personalization import personalization_bp
from routes.analytics import analytics_bp
from routes.ab_testing import ab_testing_bp

# Register blueprints
app.register_blueprint(subscribers_bp, url_prefix='/api/subscribers')
app.register_blueprint(personalization_bp, url_prefix='/api/personalize')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(ab_testing_bp, url_prefix='/api/ab-test')

# Health check endpoint
@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'service': 'PersonalizeAI Platform',
        'version': '1.0.0',
        'database': 'connected' if db.engine.dialect.name else 'disconnected'
    })

# Root endpoint
@app.route('/')
def root():
    """Root endpoint with API information"""
    return jsonify({
        'service': 'PersonalizeAI Platform API',
        'version': '1.0.0',
        'description': 'AI-powered newsletter personalization for financial publishers',
        'endpoints': {
            'health': '/health',
            'subscribers': '/api/subscribers',
            'personalization': '/api/personalize',
            'analytics': '/api/analytics',
            'ab_testing': '/api/ab-test'
        },
        'documentation': 'https://github.com/[username]/PersonalizeAI-Platform/docs/API.md'
    })

# Dashboard data endpoint
@app.route('/api/dashboard')
def dashboard_data():
    """Get dashboard overview data"""
    try:
        # Get subscriber count
        total_subscribers = Subscriber.query.count()
        
        # Calculate engagement metrics (mock data for demo)
        engagement_rate = 23.4
        revenue_impact = 285000
        churn_reduction = 18.5
        
        # Recent activity (mock data)
        recent_activity = [
            {'action': 'Subject line generated', 'subscriber': 'John D.', 'time': '2 minutes ago'},
            {'action': 'A/B test completed', 'test': 'Newsletter #47', 'time': '15 minutes ago'},
            {'action': 'New subscriber added', 'subscriber': 'Sarah M.', 'time': '1 hour ago'},
            {'action': 'Revenue impact calculated', 'amount': '$12,450', 'time': '2 hours ago'}
        ]
        
        return jsonify({
            'total_subscribers': total_subscribers,
            'engagement_rate': engagement_rate,
            'revenue_impact': revenue_impact,
            'churn_reduction': churn_reduction,
            'recent_activity': recent_activity,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'status': 'error'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'status': 'error'}), 500

# Database initialization
@app.before_first_request
def create_tables():
    """Create database tables on first request"""
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the application
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"Starting PersonalizeAI Platform on port {port}")
    print(f"Debug mode: {debug}")
    print(f"Database: {database_url}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

