import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Search, Eye, Edit, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { orderAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import OrderForm from './OrderForm';
import OrderDetails from './OrderDetails';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery(
    ['orders', searchTerm, statusFilter],
    () => orderAPI.getOrders({ search: searchTerm, status: statusFilter })
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => orderAPI.updateOrderStatus(id, { status }),
    {
      onSuccess: () => {
        toast.success('Order status updated successfully');
        queryClient.invalidateQueries('orders');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order status');
      }
    }
  );

  const canCreateOrders = user?.role === 'retailer';
  const canManageOrders = ['admin', 'manager'].includes(user?.role);

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track orders</p>
        </div>
        
        {canCreateOrders && (
          <Button onClick={() => setIsOrderModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            New Order
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retailer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.data?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.retailer?.company}</div>
                    <div className="text-sm text-gray-500">{order.retailer?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.totalAmount?.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {canManageOrders && order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'processing')}
                          className="text-green-600 hover:text-green-900"
                          title="Start Processing"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {canManageOrders && order.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'shipped')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Mark as Shipped"
                        >
                          <Truck size={16} />
                        </button>
                      )}
                      
                      {canManageOrders && order.status === 'shipped' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Delivered"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders?.data?.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-2 text-gray-600">
              {canCreateOrders 
                ? 'Get started by creating your first order.' 
                : 'No orders have been placed yet.'}
            </p>
            {canCreateOrders && (
              <Button onClick={() => setIsOrderModalOpen(true)} className="mt-4">
                <Plus size={20} className="mr-2" />
                New Order
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Create New Order"
        size="xl"
      >
        <OrderForm onSuccess={() => setIsOrderModalOpen(false)} />
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        <OrderDetails order={selectedOrder} />
      </Modal>
    </div>
  );
};

export default Orders;