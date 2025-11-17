import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { reportAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import ProducerDashboard from './ProducerDashboard';
import RetailerDashboard from './RetailerDashboard';

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, init } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      await init();
      setIsInitialized(true);
    };
    initAuth();
  }, [init]);

  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard', user?.role],
    () => reportAPI.getDashboard(),
    {
      enabled: isInitialized && ['admin', 'manager'].includes(user?.role),
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: 1000
    }
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard data={dashboardData} />;
      case 'manager':
        return <ManagerDashboard data={dashboardData} />;
      case 'producer':
        return <ProducerDashboard />;
      case 'retailer':
        return <RetailerDashboard />;
      default:
        return <div>No dashboard available for your role.</div>;
    }
  };

  if (isLoading && ['admin', 'manager'].includes(user?.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default Dashboard;