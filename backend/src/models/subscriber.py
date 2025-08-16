"""
Subscriber Model for PersonalizeAI Platform
Manages subscriber data and preferences for personalization
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON

# Import db from main app (will be initialized there)
from main import db

class Subscriber(db.Model):
    """Subscriber model for storing subscriber information and preferences"""
    
    __tablename__ = 'subscribers'
    
    # Primary key
    id = Column(Integer, primary_key=True)
    
    # Basic information
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    
    # Subscription details
    subscription_date = Column(DateTime, default=datetime.utcnow)
    subscription_status = Column(String(20), default='active')  # active, paused, cancelled
    subscription_tier = Column(String(50), default='basic')  # basic, premium, enterprise
    
    # Engagement metrics
    total_emails_sent = Column(Integer, default=0)
    total_emails_opened = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    last_engagement_date = Column(DateTime, nullable=True)
    engagement_score = Column(Float, default=0.0)  # 0-100 score
    
    # Personalization preferences
    preferred_content_types = Column(JSON, nullable=True)  # ['market_analysis', 'stock_picks', 'education']
    risk_tolerance = Column(String(20), default='moderate')  # conservative, moderate, aggressive
    investment_experience = Column(String(20), default='intermediate')  # beginner, intermediate, advanced
    portfolio_size = Column(String(20), nullable=True)  # <10k, 10k-100k, 100k-1m, >1m
    
    # Behavioral data
    preferred_send_time = Column(String(10), nullable=True)  # HH:MM format
    preferred_frequency = Column(String(20), default='daily')  # daily, weekly, bi-weekly
    device_preference = Column(String(20), default='desktop')  # mobile, desktop, tablet
    
    # AI personalization data
    ai_persona = Column(String(50), nullable=True)  # conservative_investor, growth_seeker, etc.
    content_preferences = Column(JSON, nullable=True)  # AI-learned preferences
    churn_risk_score = Column(Float, default=0.0)  # 0-1 probability of churning
    lifetime_value = Column(Float, default=0.0)  # Calculated LTV
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Subscriber {self.email}>'
    
    def to_dict(self):
        """Convert subscriber to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'subscription_date': self.subscription_date.isoformat() if self.subscription_date else None,
            'subscription_status': self.subscription_status,
            'subscription_tier': self.subscription_tier,
            'total_emails_sent': self.total_emails_sent,
            'total_emails_opened': self.total_emails_opened,
            'total_clicks': self.total_clicks,
            'last_engagement_date': self.last_engagement_date.isoformat() if self.last_engagement_date else None,
            'engagement_score': self.engagement_score,
            'preferred_content_types': self.preferred_content_types,
            'risk_tolerance': self.risk_tolerance,
            'investment_experience': self.investment_experience,
            'portfolio_size': self.portfolio_size,
            'preferred_send_time': self.preferred_send_time,
            'preferred_frequency': self.preferred_frequency,
            'device_preference': self.device_preference,
            'ai_persona': self.ai_persona,
            'content_preferences': self.content_preferences,
            'churn_risk_score': self.churn_risk_score,
            'lifetime_value': self.lifetime_value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def open_rate(self):
        """Calculate email open rate"""
        if self.total_emails_sent == 0:
            return 0.0
        return (self.total_emails_opened / self.total_emails_sent) * 100
    
    @property
    def click_rate(self):
        """Calculate email click rate"""
        if self.total_emails_sent == 0:
            return 0.0
        return (self.total_clicks / self.total_emails_sent) * 100
    
    @property
    def full_name(self):
        """Get full name of subscriber"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return self.email.split('@')[0]
    
    def update_engagement_score(self):
        """Calculate and update engagement score based on recent activity"""
        # Simple engagement scoring algorithm
        # In production, this would be more sophisticated
        
        base_score = 0
        
        # Open rate contribution (40% of score)
        if self.open_rate > 50:
            base_score += 40
        elif self.open_rate > 30:
            base_score += 30
        elif self.open_rate > 15:
            base_score += 20
        else:
            base_score += 10
        
        # Click rate contribution (30% of score)
        if self.click_rate > 10:
            base_score += 30
        elif self.click_rate > 5:
            base_score += 20
        elif self.click_rate > 2:
            base_score += 15
        else:
            base_score += 5
        
        # Recency contribution (20% of score)
        if self.last_engagement_date:
            days_since_engagement = (datetime.utcnow() - self.last_engagement_date).days
            if days_since_engagement <= 7:
                base_score += 20
            elif days_since_engagement <= 30:
                base_score += 15
            elif days_since_engagement <= 90:
                base_score += 10
            else:
                base_score += 5
        
        # Subscription tier contribution (10% of score)
        if self.subscription_tier == 'enterprise':
            base_score += 10
        elif self.subscription_tier == 'premium':
            base_score += 8
        else:
            base_score += 5
        
        self.engagement_score = min(base_score, 100)  # Cap at 100
        return self.engagement_score
    
    def calculate_churn_risk(self):
        """Calculate churn risk score using simple heuristics"""
        # In production, this would use ML models
        
        risk_score = 0.0
        
        # Low engagement increases churn risk
        if self.engagement_score < 20:
            risk_score += 0.4
        elif self.engagement_score < 40:
            risk_score += 0.2
        
        # No recent engagement increases risk
        if self.last_engagement_date:
            days_since_engagement = (datetime.utcnow() - self.last_engagement_date).days
            if days_since_engagement > 90:
                risk_score += 0.3
            elif days_since_engagement > 30:
                risk_score += 0.2
        else:
            risk_score += 0.4
        
        # Low open/click rates increase risk
        if self.open_rate < 10:
            risk_score += 0.2
        if self.click_rate < 1:
            risk_score += 0.1
        
        self.churn_risk_score = min(risk_score, 1.0)  # Cap at 1.0
        return self.churn_risk_score
    
    @classmethod
    def get_high_value_subscribers(cls, limit=10):
        """Get subscribers with highest engagement scores"""
        return cls.query.order_by(cls.engagement_score.desc()).limit(limit).all()
    
    @classmethod
    def get_at_risk_subscribers(cls, threshold=0.7, limit=10):
        """Get subscribers at risk of churning"""
        return cls.query.filter(cls.churn_risk_score >= threshold).order_by(cls.churn_risk_score.desc()).limit(limit).all()
    
    @classmethod
    def get_by_persona(cls, persona):
        """Get subscribers by AI persona"""
        return cls.query.filter(cls.ai_persona == persona).all()
    
    @classmethod
    def search_by_email(cls, email_pattern):
        """Search subscribers by email pattern"""
        return cls.query.filter(cls.email.like(f'%{email_pattern}%')).all()

