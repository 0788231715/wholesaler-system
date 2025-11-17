import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { productAPI, orderAPI } from '../../api/auth';
import Button from '../../components/common/Button';

const ProducerDashboard = () => {
  const { data: products } = useQuery('producer-products', () => 
    productAPI.getProducts()
  );

  const { data: orders } = useQuery('producer-orders', () =>
    orderAPI.getOrders()
  );

  const totalProducts = products?.data?.length || 0;
  const lowStockProducts = products?.data?.filter(p => p.stock < 10).length || 0;
  const outOfStockProducts = products?.data?.filter(p => p.stock === 0).length || 0;
  
  const pendingOrders = orders?.data?.filter(o => o.status === 'pending').length || 0;

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'blue',
      link: '/products'
    },
    {
      title: 'Low Stock',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'orange',
      link: '/products'
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts,
      icon: AlertTriangle,
      color: 'red',
      link: '/products'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: TrendingUp,
      color: 'purple',
      link: '/orders'
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
                  stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                  stat.color === 'red' ? 'bg-red-50 text-red-600' :
                  'bg-purple-50 text-purple-600'
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
          <Link to="/products">
            <Button>Manage Products</Button>
          </Link>
          <Link to="/products/new">
            <Button variant="secondary">Add Product</Button>
          </Link>
          <Link to="/orders">
            <Button variant="secondary">View Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;