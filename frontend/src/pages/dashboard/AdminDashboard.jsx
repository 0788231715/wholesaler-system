import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import Button from '../../components/common/Button';

const AdminDashboard = ({ data }) => {
  const stats = [
    {
      title: 'Total Products',
      value: data?.totals?.products || 0,
      icon: Package,
      color: 'blue',
      link: '/products'
    },
    {
      title: 'Total Orders',
      value: data?.totals?.orders || 0,
      icon: ShoppingCart,
      color: 'green',
      link: '/orders'
    },
    {
      title: 'Total Revenue',
      value: `$${data?.financialSummary?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'purple',
      link: '/reports'
    },
    {
      title: 'Total Users',
      value: data?.totals?.users || 0,
      icon: Users,
      color: 'orange',
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
                  stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {data?.alerts?.lowStockProducts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-600 mr-3" size={20} />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {data.alerts.lowStockProducts} products are running low on stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/products/new">
            <Button>Add Product</Button>
          </Link>
          <Link to="/users/new">
            <Button variant="secondary">Add User</Button>
          </Link>
          <Link to="/reports">
            <Button variant="secondary">View Reports</Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {data?.recentOrders?.map((order) => (
            <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-600">{order.retailer?.company}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;