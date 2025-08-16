"""
Personalization Models for PersonalizeAI Platform
Manages AI personalization results and A/B testing data
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship

# Import db from main app
from main import db

class PersonalizationResult(db.Model):
    """Store AI personalization results for tracking and optimization"""
    
    __tablename__ = 'personalization_results'
    
    # Primary key
    id = Column(Integer, primary_key=True)
    
    # Foreign key to subscriber
    subscriber_id = Column(Integer, ForeignKey('subscribers.id'), nullable=False)
    subscriber = relationship("Subscriber", backref="personalization_results")
    
    # Personalization details
    content_type = Column(String(50), nullable=False)  # subject_line, content, recommendation
    original_content = Column(Text, nullable=True)
    personalized_content = Column(Text, nullable=False)
    personalization_strategy = Column(String(100), nullable=True)  # risk_based, engagement_based, etc.
    
    # AI model information
    ai_model_used = Column(String(50), default='gpt-4')
    ai_prompt_template = Column(Text, nullable=True)
    ai_confidence_score = Column(Float, default=0.0)  # 0-1 confidence in personalization
    
    # Performance metrics
    was_sent = Column(Boolean, default=False)
    was_opened = Column(Boolean, default=False)
    was_clicked = Column(Boolean, default=False)
    engagement_score = Column(Float, default=0.0)
    conversion_value = Column(Float, default=0.0)
    
    # A/B testing
    ab_test_id = Column(Integer, ForeignKey('ab_tests.id'), nullable=True)
    ab_test_variant = Column(String(10), nullable=True)  # A, B, C, etc.
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f'<PersonalizationResult {self.id} for {self.subscriber.email}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'subscriber_id': self.subscriber_id,
            'subscriber_email': self.subscriber.email if self.subscriber else None,
            'content_type': self.content_type,
            'original_content': self.original_content,
            'personalized_content': self.personalized_content,
            'personalization_strategy': self.personalization_strategy,
            'ai_model_used': self.ai_model_used,
            'ai_confidence_score': self.ai_confidence_score,
            'was_sent': self.was_sent,
            'was_opened': self.was_opened,
            'was_clicked': self.was_clicked,
            'engagement_score': self.engagement_score,
            'conversion_value': self.conversion_value,
            'ab_test_id': self.ab_test_id,
            'ab_test_variant': self.ab_test_variant,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'opened_at': self.opened_at.isoformat() if self.opened_at else None,
            'clicked_at': self.clicked_at.isoformat() if self.clicked_at else None
        }

class ABTest(db.Model):
    """A/B testing framework for personalization optimization"""
    
    __tablename__ = 'ab_tests'
    
    # Primary key
    id = Column(Integer, primary_key=True)
    
    # Test details
    test_name = Column(String(200), nullable=False)
    test_description = Column(Text, nullable=True)
    test_type = Column(String(50), nullable=False)  # subject_line, content, send_time, etc.
    
    # Test configuration
    variants = Column(JSON, nullable=False)  # List of variants being tested
    traffic_split = Column(JSON, nullable=False)  # Percentage split for each variant
    target_metric = Column(String(50), default='open_rate')  # open_rate, click_rate, conversion_rate
    
    # Test status
    status = Column(String(20), default='draft')  # draft, running, paused, completed, cancelled
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    planned_duration_days = Column(Integer, default=7)
    
    # Statistical significance
    confidence_level = Column(Float, default=0.95)  # 95% confidence
    minimum_sample_size = Column(Integer, default=100)
    statistical_significance_reached = Column(Boolean, default=False)
    winning_variant = Column(String(10), nullable=True)
    
    # Results summary
    total_participants = Column(Integer, default=0)
    results_summary = Column(JSON, nullable=True)  # Detailed results for each variant
    
    # Metadata
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    personalization_results = relationship("PersonalizationResult", backref="ab_test")
    
    def __repr__(self):
        return f'<ABTest {self.test_name} ({self.status})>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'test_name': self.test_name,
            'test_description': self.test_description,
            'test_type': self.test_type,
            'variants': self.variants,
            'traffic_split': self.traffic_split,
            'target_metric': self.target_metric,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'planned_duration_days': self.planned_duration_days,
            'confidence_level': self.confidence_level,
            'minimum_sample_size': self.minimum_sample_size,
            'statistical_significance_reached': self.statistical_significance_reached,
            'winning_variant': self.winning_variant,
            'total_participants': self.total_participants,
            'results_summary': self.results_summary,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def calculate_results(self):
        """Calculate A/B test results and statistical significance"""
        if not self.personalization_results:
            return None
        
        # Group results by variant
        variant_results = {}
        for result in self.personalization_results:
            variant = result.ab_test_variant
            if variant not in variant_results:
                variant_results[variant] = {
                    'participants': 0,
                    'opens': 0,
                    'clicks': 0,
                    'conversions': 0,
                    'total_value': 0.0
                }
            
            variant_results[variant]['participants'] += 1
            if result.was_opened:
                variant_results[variant]['opens'] += 1
            if result.was_clicked:
                variant_results[variant]['clicks'] += 1
            if result.conversion_value > 0:
                variant_results[variant]['conversions'] += 1
                variant_results[variant]['total_value'] += result.conversion_value
        
        # Calculate rates for each variant
        for variant, data in variant_results.items():
            if data['participants'] > 0:
                data['open_rate'] = (data['opens'] / data['participants']) * 100
                data['click_rate'] = (data['clicks'] / data['participants']) * 100
                data['conversion_rate'] = (data['conversions'] / data['participants']) * 100
                data['avg_value'] = data['total_value'] / data['participants']
            else:
                data['open_rate'] = 0
                data['click_rate'] = 0
                data['conversion_rate'] = 0
                data['avg_value'] = 0
        
        # Update total participants
        self.total_participants = sum(data['participants'] for data in variant_results.values())
        
        # Store results
        self.results_summary = variant_results
        
        # Determine winner (simplified - in production would use proper statistical tests)
        if self.total_participants >= self.minimum_sample_size:
            target_rates = {}
            for variant, data in variant_results.items():
                if self.target_metric == 'open_rate':
                    target_rates[variant] = data['open_rate']
                elif self.target_metric == 'click_rate':
                    target_rates[variant] = data['click_rate']
                elif self.target_metric == 'conversion_rate':
                    target_rates[variant] = data['conversion_rate']
                else:
                    target_rates[variant] = data['avg_value']
            
            if target_rates:
                self.winning_variant = max(target_rates, key=target_rates.get)
                # Simplified significance check - in production would use proper statistical tests
                max_rate = max(target_rates.values())
                second_max = sorted(target_rates.values())[-2] if len(target_rates) > 1 else 0
                if max_rate > second_max * 1.1:  # 10% improvement threshold
                    self.statistical_significance_reached = True
        
        return variant_results
    
    def start_test(self):
        """Start the A/B test"""
        self.status = 'running'
        self.start_date = datetime.utcnow()
        return True
    
    def stop_test(self):
        """Stop the A/B test"""
        self.status = 'completed'
        self.end_date = datetime.utcnow()
        self.calculate_results()
        return True
    
    @classmethod
    def get_active_tests(cls):
        """Get all currently running tests"""
        return cls.query.filter(cls.status == 'running').all()
    
    @classmethod
    def get_completed_tests(cls, limit=10):
        """Get recently completed tests"""
        return cls.query.filter(cls.status == 'completed').order_by(cls.end_date.desc()).limit(limit).all()

class ContentTemplate(db.Model):
    """Store content templates for personalization"""
    
    __tablename__ = 'content_templates'
    
    # Primary key
    id = Column(Integer, primary_key=True)
    
    # Template details
    template_name = Column(String(200), nullable=False)
    template_type = Column(String(50), nullable=False)  # subject_line, email_body, recommendation
    template_content = Column(Text, nullable=False)
    
    # Personalization variables
    variables = Column(JSON, nullable=True)  # List of variables that can be personalized
    personalization_rules = Column(JSON, nullable=True)  # Rules for how to personalize
    
    # Performance tracking
    usage_count = Column(Integer, default=0)
    avg_performance_score = Column(Float, default=0.0)
    
    # Metadata
    created_by = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ContentTemplate {self.template_name}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'template_name': self.template_name,
            'template_type': self.template_type,
            'template_content': self.template_content,
            'variables': self.variables,
            'personalization_rules': self.personalization_rules,
            'usage_count': self.usage_count,
            'avg_performance_score': self.avg_performance_score,
            'created_by': self.created_by,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

