import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Brain, 
  TrendingUp, 
  DollarSign, 
  TestTube, 
  Mail, 
  Database,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  Search
} from 'lucide-react';

// API Configuration - will be updated by GitHub Actions for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://personalizeai-api.azurewebsites.net/api'
  : '/api';

// Import components
import OverviewTab from './components/OverviewTab';
import SubscribersTab from './components/SubscribersTab';
import PersonalizationTab from './components/PersonalizationTab';
import AnalyticsTab from './components/AnalyticsTab';
import RevenueImpactTab from './components/RevenueImpactTab';
import ABTestingTab from './components/ABTestingTab';
import EmailIntegrationTab from './components/EmailIntegrationTab';
import SalesforceTab from './components/SalesforceTab';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // API call to backend
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // Fallback to mock data for demo
        setDashboardData({
          total_subscribers: 15420,
          engagement_rate: 23.4,
          revenue_impact: 285000,
          churn_reduction: 18.5,
          recent_activity: [
            { action: 'Subject line generated', subscriber: 'John D.', time: '2 minutes ago' },
            { action: 'A/B test completed', test: 'Newsletter #47', time: '15 minutes ago' },
            { action: 'New subscriber added', subscriber: 'Sarah M.', time: '1 hour ago' },
            { action: 'Revenue impact calculated', amount: '$12,450', time: '2 hours ago' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setDashboardData({
        total_subscribers: 15420,
        engagement_rate: 23.4,
        revenue_impact: 285000,
        churn_reduction: 18.5,
        recent_activity: [
          { action: 'Subject line generated', subscriber: 'John D.', time: '2 minutes ago' },
          { action: 'A/B test completed', test: 'Newsletter #47', time: '15 minutes ago' },
          { action: 'New subscriber added', subscriber: 'Sarah M.', time: '1 hour ago' },
          { action: 'Revenue impact calculated', amount: '$12,450', time: '2 hours ago' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, description: 'Dashboard overview and key metrics' },
    { id: 'subscribers', name: 'Subscribers', icon: Users, description: 'Manage and analyze subscribers' },
    { id: 'personalization', name: 'Personalization', icon: Brain, description: 'AI-powered content optimization' },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, description: 'Detailed performance analytics' },
    { id: 'revenue', name: 'Revenue Impact', icon: DollarSign, description: 'ROI analysis and projections' },
    { id: 'ab-testing', name: 'A/B Testing Lab', icon: TestTube, description: 'Test and optimize campaigns' },
    { id: 'email-integration', name: 'Email Integration', icon: Mail, description: 'Platform integrations' },
    { id: 'salesforce', name: 'Salesforce CRM', icon: Database, description: 'CRM integration and sync' }
  ];

  const renderActiveTab = () => {
    const props = { dashboardData, loading, onRefresh: fetchDashboardData };
    
    switch (activeTab) {
      case 'overview':
        return <OverviewTab {...props} />;
      case 'subscribers':
        return <SubscribersTab {...props} />;
      case 'personalization':
        return <PersonalizationTab {...props} />;
      case 'analytics':
        return <AnalyticsTab {...props} />;
      case 'revenue':
        return <RevenueImpactTab {...props} />;
      case 'ab-testing':
        return <ABTestingTab {...props} />;
      case 'email-integration':
        return <EmailIntegrationTab {...props} />;
      case 'salesforce':
        return <SalesforceTab {...props} />;
      default:
        return <OverviewTab {...props} />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PersonalizeAI Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">PersonalizeAI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={tab.description}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">DM</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">David Maxwell</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                <Bell className="h-5 w-5" />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                <Settings className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">DM</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Quick stats */}
              {activeTab === 'overview' && dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card">
                    <div className="card-body">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Users className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData?.total_subscribers?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrendingUp className="h-8 w-8 text-success-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData?.engagement_rate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DollarSign className="h-8 w-8 text-warning-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                          <p className="text-2xl font-bold text-gray-900">${dashboardData?.revenue_impact?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Brain className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Churn Reduction</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData?.churn_reduction}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab content */}
              <div className="animate-fade-in">
                {renderActiveTab()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

