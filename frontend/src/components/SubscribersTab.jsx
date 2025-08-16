import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  TrendingUp, 
  AlertTriangle,
  Star,
  Download,
  Upload
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://personalizeai-api.azurewebsites.net/api'
  : '/api';

const SubscribersTab = ({ dashboardData, loading, onRefresh }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [subscribersPerPage] = useState(10);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [subscribers, searchTerm, filterStatus, filterTier]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscribers`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } else {
        // Fallback to mock data
        setSubscribers(getMockSubscribers());
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setSubscribers(getMockSubscribers());
    }
  };

  const filterSubscribers = () => {
    let filtered = subscribers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.subscription_status === filterStatus);
    }

    // Tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(sub => sub.subscription_tier === filterTier);
    }

    setFilteredSubscribers(filtered);
    setCurrentPage(1);
  };

  const handleSelectSubscriber = (subscriberId) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId) 
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSelectAll = () => {
    const currentPageSubscribers = getCurrentPageSubscribers();
    const allSelected = currentPageSubscribers.every(sub => selectedSubscribers.includes(sub.id));
    
    if (allSelected) {
      setSelectedSubscribers(prev => prev.filter(id => !currentPageSubscribers.map(s => s.id).includes(id)));
    } else {
      setSelectedSubscribers(prev => [...new Set([...prev, ...currentPageSubscribers.map(s => s.id)])]);
    }
  };

  const getCurrentPageSubscribers = () => {
    const indexOfLastSubscriber = currentPage * subscribersPerPage;
    const indexOfFirstSubscriber = indexOfLastSubscriber - subscribersPerPage;
    return filteredSubscribers.slice(indexOfFirstSubscriber, indexOfLastSubscriber);
  };

  const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);

  const getEngagementBadge = (score) => {
    if (score >= 70) return { color: 'success', text: 'High' };
    if (score >= 40) return { color: 'warning', text: 'Medium' };
    return { color: 'danger', text: 'Low' };
  };

  const getChurnRiskBadge = (score) => {
    if (score >= 0.7) return { color: 'danger', text: 'High Risk' };
    if (score >= 0.4) return { color: 'warning', text: 'Medium Risk' };
    return { color: 'success', text: 'Low Risk' };
  };

  const getMockSubscribers = () => {
    const names = [
      ['John', 'Smith'], ['Sarah', 'Johnson'], ['Michael', 'Brown'], ['Emily', 'Davis'],
      ['David', 'Wilson'], ['Jessica', 'Miller'], ['Christopher', 'Moore'], ['Ashley', 'Taylor'],
      ['Matthew', 'Anderson'], ['Amanda', 'Thomas'], ['James', 'Jackson'], ['Jennifer', 'White'],
      ['Robert', 'Harris'], ['Lisa', 'Martin'], ['William', 'Thompson'], ['Karen', 'Garcia'],
      ['Richard', 'Martinez'], ['Susan', 'Robinson'], ['Joseph', 'Clark'], ['Betty', 'Rodriguez']
    ];
    
    const tiers = ['basic', 'premium', 'enterprise'];
    const statuses = ['active', 'paused'];
    const riskLevels = ['conservative', 'moderate', 'aggressive'];
    
    return names.map((name, i) => ({
      id: i + 1,
      email: `${name[0].toLowerCase()}.${name[1].toLowerCase()}@example.com`,
      first_name: name[0],
      last_name: name[1],
      subscription_status: statuses[Math.floor(Math.random() * statuses.length)],
      subscription_tier: tiers[Math.floor(Math.random() * tiers.length)],
      engagement_score: Math.floor(Math.random() * 80) + 20,
      total_emails_sent: Math.floor(Math.random() * 450) + 50,
      total_emails_opened: Math.floor(Math.random() * 350) + 10,
      total_clicks: Math.floor(Math.random() * 150) + 5,
      risk_tolerance: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      churn_risk_score: Math.random() * 0.8 + 0.1,
      lifetime_value: Math.floor(Math.random() * 45000) + 5000,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse">
          <div className="card-body">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscriber Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and analyze your {filteredSubscribers.length.toLocaleString()} subscribers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn btn-outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button className="btn btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Status filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tier filter */}
            <div>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="input"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <button className="btn btn-outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={getCurrentPageSubscribers().length > 0 && getCurrentPageSubscribers().every(sub => selectedSubscribers.includes(sub.id))}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscriber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LTV
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageSubscribers().map((subscriber) => {
                  const engagementBadge = getEngagementBadge(subscriber.engagement_score);
                  const churnRiskBadge = getChurnRiskBadge(subscriber.churn_risk_score);
                  const openRate = subscriber.total_emails_sent > 0 ? 
                    ((subscriber.total_emails_opened / subscriber.total_emails_sent) * 100).toFixed(1) : 0;
                  const clickRate = subscriber.total_emails_sent > 0 ? 
                    ((subscriber.total_clicks / subscriber.total_emails_sent) * 100).toFixed(1) : 0;

                  return (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onChange={() => handleSelectSubscriber(subscriber.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {subscriber.first_name?.[0] || subscriber.email[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {subscriber.first_name} {subscriber.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{subscriber.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`badge ${
                            subscriber.subscription_status === 'active' ? 'badge-success' : 
                            subscriber.subscription_status === 'paused' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {subscriber.subscription_status}
                          </span>
                          <span className="badge badge-gray">
                            {subscriber.subscription_tier}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`badge badge-${engagementBadge.color}`}>
                            {engagementBadge.text} ({subscriber.engagement_score}%)
                          </span>
                          <div className="text-xs text-gray-500">
                            Score: {subscriber.engagement_score}/100
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>Open: {openRate}%</div>
                          <div>Click: {clickRate}%</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {subscriber.total_emails_sent} emails sent
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${churnRiskBadge.color}`}>
                          {churnRiskBadge.text}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {(subscriber.churn_risk_score * 100).toFixed(1)}% probability
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${subscriber.lifetime_value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Lifetime value
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-gray-400 hover:text-primary-600">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-primary-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-danger-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * subscribersPerPage) + 1} to {Math.min(currentPage * subscribersPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedSubscribers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-strong border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900">
              {selectedSubscribers.length} selected
            </span>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-outline">
                <Mail className="h-4 w-4 mr-1" />
                Send Email
              </button>
              <button className="btn btn-sm btn-outline">
                <Edit className="h-4 w-4 mr-1" />
                Bulk Edit
              </button>
              <button className="btn btn-sm btn-danger">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
            <button
              onClick={() => setSelectedSubscribers([])}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersTab;

