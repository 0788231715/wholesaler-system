import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, AlertTriangle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';

const ManagerDashboard = ({ data }) => {
  const stats = [
    {
      title: 'Pending Orders',
      value: data?.totals?.pendingOrders || 0,
      icon: Clock,
      color: 'orange',
      link: '/orders?status=pending'
    },
    {
      title: 'Total Products',
      value: data?.totals?.products || 0,
      icon: Package,
      color: 'blue',
      link: '/products'
    },
    {
      title: 'Low Stock Items',
      value: data?.alerts?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'orange',
      link: '/products'
    },
    {
      title: 'Active Retailers',
      value: data?.totals?.users ? Math.floor(data.totals.users * 0.6) : 0, // Estimate
      icon: Users,
      color: 'green',
      link: '/users'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/orders">
            <Button>Manage Orders</Button>
          </Link>
          <Link to="/products">
            <Button variant="secondary">View Products</Button>
          </Link>
          <Link to="/reports">
            <Button variant="secondary">View Reports</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;