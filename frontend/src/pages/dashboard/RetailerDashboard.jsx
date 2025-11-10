import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Clock, CheckCircle } from 'lucide-react';
import { orderAPI } from '../../api/auth';
import Button from '../../components/common/Button';

const RetailerDashboard = () => {
  // Initialize with some data while loading
  const [localStats, setLocalStats] = useState({
    pending: 0,
    processing: 0,
    delivered: 0,
    total: 0
  });

  const { data: orders, isLoading, isError } = useQuery(
    'retailer-orders',
    async () => {
      try {
        console.log('Fetching orders...');
        const response = await orderAPI.getOrders();
        console.log('Orders response:', response);
        
        // Update local stats when we get real data
        if (response?.data) {
          const newStats = {
            pending: response.data.filter(o => o.status === 'pending').length,
            processing: response.data.filter(o => o.status === 'processing').length,
            delivered: response.data.filter(o => o.status === 'delivered').length,
            total: response.data.length
          };
          setLocalStats(newStats);
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    {
      refetchOnWindowFocus: false,
      retry: 3,
      initialData: { data: [] }
    }
  );

  // Use localStats instead of calculating from orders
  const stats = [
    {
      title: 'Pending Orders',
      value: localStats.pending,
      icon: Clock,
      color: 'orange',
      link: '/orders?status=pending'
    },
    {
      title: 'Processing',
      value: localStats.processing,
      icon: Package,
      color: 'blue',
      link: '/orders?status=processing'
    },
    {
      title: 'Delivered',
      value: localStats.delivered,
      icon: CheckCircle,
      color: 'green',
      link: '/orders?status=delivered'
    },
    {
      title: 'Total Orders',
      value: localStats.total,
      icon: ShoppingCart,
      color: 'purple',
      link: '/orders'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p className="font-bold">Error loading dashboard</p>
        <p className="text-sm">Please try refreshing the page</p>
      </div>
    );
  }

  // Get recent orders
  const recentOrders = orders?.data?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                  'bg-purple-50 text-purple-600'
                }`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <Link 
                key={order._id} 
                to={`/orders/${order._id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                        ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No orders yet
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link 
            to="/orders" 
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View all orders →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
          <Link to="/orders/new">
            <Button variant="secondary">Place Order</Button>
          </Link>
          <Link to="/invoices">
            <Button variant="secondary">View Invoices</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;