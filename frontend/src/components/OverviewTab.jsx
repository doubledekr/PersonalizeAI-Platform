import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Clock
} from 'lucide-react';

const OverviewTab = ({ dashboardData, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Active Subscribers',
      value: '14,156',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Avg. Open Rate',
      value: '34.2%',
      change: '+8.3%',
      trend: 'up',
      icon: Mail,
      color: 'success'
    },
    {
      title: 'Click-Through Rate',
      value: '12.7%',
      change: '+15.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'warning'
    },
    {
      title: 'Monthly Revenue',
      value: '$47,250',
      change: '+23.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Personalization Score',
      value: '87.3%',
      change: '+5.7%',
      trend: 'up',
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Avg. Engagement Time',
      value: '4m 32s',
      change: '+18.9%',
      trend: 'up',
      icon: Clock,
      color: 'green'
    }
  ];

  const recentActivity = dashboardData?.recent_activity || [
    { action: 'Subject line generated', subscriber: 'John D.', time: '2 minutes ago' },
    { action: 'A/B test completed', test: 'Newsletter #47', time: '15 minutes ago' },
    { action: 'New subscriber added', subscriber: 'Sarah M.', time: '1 hour ago' },
    { action: 'Revenue impact calculated', amount: '$12,450', time: '2 hours ago' }
  ];

  const topPerformingContent = [
    { title: 'Market Outlook: Tech Stocks Surge', opens: 2847, clicks: 456, ctr: '16.0%' },
    { title: 'Weekly Portfolio Review', opens: 2634, clicks: 398, ctr: '15.1%' },
    { title: 'Breaking: Fed Rate Decision', opens: 3156, clicks: 441, ctr: '14.0%' },
    { title: 'Dividend Aristocrats Update', opens: 2298, clicks: 310, ctr: '13.5%' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          
          return (
            <div key={index} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-success-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-danger-600" />
                      )}
                      <span className={`text-sm font-medium ml-1 ${
                        isPositive ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                    <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                      {activity.subscriber && (
                        <span className="text-gray-600"> for {activity.subscriber}</span>
                      )}
                      {activity.test && (
                        <span className="text-gray-600"> - {activity.test}</span>
                      )}
                      {activity.amount && (
                        <span className="text-success-600 font-medium"> - {activity.amount}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all activity →
              </button>
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Content</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {topPerformingContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {content.title}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {content.opens.toLocaleString()} opens
                      </span>
                      <span className="text-xs text-gray-500">
                        {content.clicks} clicks
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      {content.ctr} CTR
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View detailed analytics →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
          <p className="text-sm text-gray-600">Key insights from your PersonalizeAI implementation</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">+23.4%</div>
              <div className="text-sm font-medium text-gray-900">Engagement Increase</div>
              <div className="text-xs text-gray-500 mt-1">Since implementing AI personalization</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">$285K</div>
              <div className="text-sm font-medium text-gray-900">Annual Revenue Lift</div>
              <div className="text-xs text-gray-500 mt-1">Projected based on current performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600 mb-2">-18.5%</div>
              <div className="text-sm font-medium text-gray-900">Churn Reduction</div>
              <div className="text-xs text-gray-500 mt-1">Compared to pre-AI baseline</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-primary-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-primary-900">
                  Optimization Opportunity
                </h4>
                <p className="text-sm text-primary-700 mt-1">
                  Your A/B tests show 15% higher engagement with personalized subject lines. 
                  Consider expanding personalization to email content for additional revenue lift.
                </p>
                <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View recommendations →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

