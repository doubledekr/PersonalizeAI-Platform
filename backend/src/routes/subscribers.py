"""
Subscribers API Routes for PersonalizeAI Platform
Handles subscriber management, segmentation, and analytics
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random

# Import models (will be properly imported when integrated)
try:
    from models.subscriber import Subscriber
    from main import db
except ImportError:
    # Fallback for standalone testing
    Subscriber = None
    db = None

subscribers_bp = Blueprint('subscribers', __name__)

@subscribers_bp.route('/', methods=['GET'])
def get_subscribers():
    """Get all subscribers with optional filtering and pagination"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        tier = request.args.get('tier', '')
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # For demo purposes, return mock data if no database
        if not Subscriber or not db:
            return jsonify({
                'subscribers': get_mock_subscribers(),
                'total': 15420,
                'page': page,
                'per_page': per_page,
                'total_pages': 771,
                'status': 'success'
            })
        
        # Build query
        query = Subscriber.query
        
        # Apply filters
        if search:
            query = query.filter(
                Subscriber.email.contains(search) |
                Subscriber.first_name.contains(search) |
                Subscriber.last_name.contains(search)
            )
        
        if status:
            query = query.filter(Subscriber.subscription_status == status)
        
        if tier:
            query = query.filter(Subscriber.subscription_tier == tier)
        
        # Apply sorting
        if sort_order == 'desc':
            query = query.order_by(getattr(Subscriber, sort_by).desc())
        else:
            query = query.order_by(getattr(Subscriber, sort_by).asc())
        
        # Paginate
        paginated = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'subscribers': [sub.to_dict() for sub in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'total_pages': paginated.pages,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@subscribers_bp.route('/<int:subscriber_id>', methods=['GET'])
def get_subscriber(subscriber_id):
    """Get a specific subscriber by ID"""
    try:
        if not Subscriber or not db:
            # Return mock data for demo
            return jsonify({
                'subscriber': get_mock_subscriber(subscriber_id),
                'status': 'success'
            })
        
        subscriber = Subscriber.query.get_or_404(subscriber_id)
        return jsonify({
            'subscriber': subscriber.to_dict(),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@subscribers_bp.route('/', methods=['POST'])
def create_subscriber():
    """Create a new subscriber"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email'):
            return jsonify({'error': 'Email is required', 'status': 'error'}), 400
        
        if not Subscriber or not db:
            # Return mock response for demo
            return jsonify({
                'subscriber': {
                    'id': random.randint(1000, 9999),
                    'email': data['email'],
                    'first_name': data.get('first_name'),
                    'last_name': data.get('last_name'),
                    'subscription_status': 'active',
                    'created_at': datetime.utcnow().isoformat()
                },
                'message': 'Subscriber created successfully',
                'status': 'success'
            }), 201
        
        # Check if subscriber already exists
        existing = Subscriber.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Subscriber with this email already exists', 'status': 'error'}), 409
        
        # Create new subscriber
        subscriber = Subscriber(
            email=data['email'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            subscription_tier=data.get('subscription_tier', 'basic'),
            risk_tolerance=data.get('risk_tolerance', 'moderate'),
            investment_experience=data.get('investment_experience', 'intermediate'),
            portfolio_size=data.get('portfolio_size'),
            preferred_content_types=data.get('preferred_content_types', []),
            preferred_frequency=data.get('preferred_frequency', 'daily')
        )
        
        db.session.add(subscriber)
        db.session.commit()
        
        return jsonify({
            'subscriber': subscriber.to_dict(),
            'message': 'Subscriber created successfully',
            'status': 'success'
        }), 201
        
    except Exception as e:
        if db:
            db.session.rollback()
        return jsonify({'error': str(e), 'status': 'error'}), 500

@subscribers_bp.route('/<int:subscriber_id>', methods=['PUT'])
def update_subscriber(subscriber_id):
    """Update an existing subscriber"""
    try:
        data = request.get_json()
        
        if not Subscriber or not db:
            # Return mock response for demo
            return jsonify({
                'subscriber': get_mock_subscriber(subscriber_id),
                'message': 'Subscriber updated successfully',
                'status': 'success'
            })
        
        subscriber = Subscriber.query.get_or_404(subscriber_id)
        
        # Update fields
        for field in ['first_name', 'last_name', 'subscription_status', 'subscription_tier',
                     'risk_tolerance', 'investment_experience', 'portfolio_size',
                     'preferred_content_types', 'preferred_frequency', 'device_preference']:
            if field in data:
                setattr(subscriber, field, data[field])
        
        subscriber.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'subscriber': subscriber.to_dict(),
            'message': 'Subscriber updated successfully',
            'status': 'success'
        })
        
    except Exception as e:
        if db:
            db.session.rollback()
        return jsonify({'error': str(e), 'status': 'error'}), 500

@subscribers_bp.route('/<int:subscriber_id>', methods=['DELETE'])
def delete_subscriber(subscriber_id):
    """Delete a subscriber"""
    try:
        if not Subscriber or not db:
            # Return mock response for demo
            return jsonify({
                'message': 'Subscriber deleted successfully',
                'status': 'success'
            })
        
        subscriber = Subscriber.query.get_or_404(subscriber_id)
        db.session.delete(subscriber)
        db.session.commit()
        
        return jsonify({
            'message': 'Subscriber deleted successfully',
            'status': 'success'
        })
        
    except Exception as e:
        if db:
            db.session.rollback()
        return jsonify({'error': str(e), 'status': 'error'}), 500

@subscribers_bp.route('/analytics', methods=['GET'])
def get_subscriber_analytics():
    """Get subscriber analytics and insights"""
    try:
        # Mock analytics data for demo
        analytics = {
            'total_subscribers': 15420,
            'active_subscribers': 14156,
            'new_this_month': 1247,
            'churn_rate': 8.2,
            'avg_engagement_score': 67.3,
            'tier_distribution': {
                'basic': 12336,
                'premium': 2584,
                'enterprise': 500
            },
            'engagement_distribution': {
                'high': 4626,  # 30%
                'medium': 7710,  # 50%
                'low': 3084   # 20%
            },
            'risk_tolerance_distribution': {
                'conservative': 4626,  # 30%
                'moderate': 9262,     # 60%
                'aggressive': 1532    # 10%
            },
            'top_performing_segments': [
                {'segment': 'Premium Growth Investors', 'engagement': 84.2, 'count': 1247},
                {'segment': 'Conservative Retirees', 'engagement': 78.9, 'count': 2156},
                {'segment': 'Tech-Savvy Millennials', 'engagement': 76.4, 'count': 1893}
            ],
            'at_risk_subscribers': 1156,
            'high_value_subscribers': 892,
            'recent_trends': {
                'engagement_trend': [65.2, 66.8, 67.3, 68.1, 67.9, 67.3],  # Last 6 months
                'growth_trend': [13245, 13678, 14012, 14389, 14756, 15420],  # Last 6 months
                'churn_trend': [9.1, 8.7, 8.4, 8.2, 8.5, 8.2]  # Last 6 months
            }
        }
        
        return jsonify({
            'analytics': analytics,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@subscribers_bp.route('/segments', methods=['GET'])
def get_subscriber_segments():
    """Get subscriber segments for targeting"""
    try:
        segments = [
            {
                'id': 1,
                'name': 'High-Value Investors',
                'description': 'Premium subscribers with high engagement and large portfolios',
                'criteria': {
                    'subscription_tier': 'premium',
                    'portfolio_size': '>1m',
                    'engagement_score': '>80'
                },
                'count': 892,
                'avg_engagement': 84.2,
                'avg_ltv': 45000
            },
            {
                'id': 2,
                'name': 'Growth Seekers',
                'description': 'Aggressive investors looking for high-growth opportunities',
                'criteria': {
                    'risk_tolerance': 'aggressive',
                    'investment_experience': 'advanced',
                    'preferred_content': 'growth_stocks'
                },
                'count': 1532,
                'avg_engagement': 76.4,
                'avg_ltv': 32000
            },
            {
                'id': 3,
                'name': 'Conservative Retirees',
                'description': 'Risk-averse investors focused on income and preservation',
                'criteria': {
                    'risk_tolerance': 'conservative',
                    'preferred_content': 'dividend_stocks',
                    'age_group': '55+'
                },
                'count': 2156,
                'avg_engagement': 78.9,
                'avg_ltv': 28000
            },
            {
                'id': 4,
                'name': 'New Investors',
                'description': 'Beginner investors seeking education and guidance',
                'criteria': {
                    'investment_experience': 'beginner',
                    'subscription_date': 'last_90_days'
                },
                'count': 1247,
                'avg_engagement': 65.3,
                'avg_ltv': 15000
            },
            {
                'id': 5,
                'name': 'At-Risk Subscribers',
                'description': 'Subscribers with declining engagement who may churn',
                'criteria': {
                    'engagement_score': '<30',
                    'last_engagement': '>30_days'
                },
                'count': 1156,
                'avg_engagement': 22.1,
                'avg_ltv': 8000
            }
        ]
        
        return jsonify({
            'segments': segments,
            'total_segments': len(segments),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

def get_mock_subscribers():
    """Generate mock subscriber data for demo"""
    subscribers = []
    names = [
        ('John', 'Smith'), ('Sarah', 'Johnson'), ('Michael', 'Brown'), ('Emily', 'Davis'),
        ('David', 'Wilson'), ('Jessica', 'Miller'), ('Christopher', 'Moore'), ('Ashley', 'Taylor'),
        ('Matthew', 'Anderson'), ('Amanda', 'Thomas'), ('James', 'Jackson'), ('Jennifer', 'White'),
        ('Robert', 'Harris'), ('Lisa', 'Martin'), ('William', 'Thompson'), ('Karen', 'Garcia'),
        ('Richard', 'Martinez'), ('Susan', 'Robinson'), ('Joseph', 'Clark'), ('Betty', 'Rodriguez')
    ]
    
    tiers = ['basic', 'premium', 'enterprise']
    statuses = ['active', 'paused']
    risk_levels = ['conservative', 'moderate', 'aggressive']
    
    for i in range(20):
        first_name, last_name = names[i]
        email = f"{first_name.lower()}.{last_name.lower()}@example.com"
        
        subscribers.append({
            'id': i + 1,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'subscription_status': random.choice(statuses),
            'subscription_tier': random.choice(tiers),
            'engagement_score': round(random.uniform(20, 95), 1),
            'total_emails_sent': random.randint(50, 500),
            'total_emails_opened': random.randint(10, 400),
            'total_clicks': random.randint(5, 200),
            'risk_tolerance': random.choice(risk_levels),
            'churn_risk_score': round(random.uniform(0.1, 0.8), 2),
            'lifetime_value': round(random.uniform(5000, 50000), 2),
            'created_at': (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat()
        })
    
    return subscribers

def get_mock_subscriber(subscriber_id):
    """Generate mock subscriber data for a specific ID"""
    return {
        'id': subscriber_id,
        'email': f'subscriber{subscriber_id}@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'subscription_status': 'active',
        'subscription_tier': 'premium',
        'engagement_score': 78.5,
        'total_emails_sent': 156,
        'total_emails_opened': 124,
        'total_clicks': 67,
        'risk_tolerance': 'moderate',
        'investment_experience': 'intermediate',
        'portfolio_size': '100k-1m',
        'churn_risk_score': 0.23,
        'lifetime_value': 28500.00,
        'preferred_content_types': ['market_analysis', 'stock_picks'],
        'ai_persona': 'growth_investor',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }

