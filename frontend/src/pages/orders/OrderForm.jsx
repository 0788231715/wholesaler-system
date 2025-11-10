import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productAPI, orderAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const OrderForm = ({ onSuccess, onCancel }) => {
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Rwanda'
  });
  const [notes, setNotes] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: products } = useQuery(
    'products-for-order',
    () => productAPI.getProducts()
  );

  const createOrderMutation = useMutation(
    (orderData) => orderAPI.createOrder(orderData),
    {
      onSuccess: () => {
        toast.success('Order created successfully!');
        queryClient.invalidateQueries('orders');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create order');
      }
    }
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Only ${product.stock} units available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock < product.minOrderQuantity) {
        toast.error(`Minimum order quantity is ${product.minOrderQuantity}`);
        return;
      }
      setCart([...cart, {
        product,
        quantity: product.minOrderQuantity,
        price: product.price
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products?.data?.find(p => p._id === productId);
    
    if (newQuantity < product.minOrderQuantity) {
      toast.error(`Minimum order quantity is ${product.minOrderQuantity}`);
      return;
    }
    
    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} units available in stock`);
      return;
    }

    setCart(cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Please add at least one product to your order');
      return;
    }

    const orderData = {
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      shippingAddress,
      notes
    };

    createOrderMutation.mutate(orderData);
  };

  const availableProducts = products?.data?.filter(p => p.stock > 0) || [];

  return (
    <div className="max-h-96 overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Products Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2">
            {availableProducts.map((product) => (
              <div
                key={product._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-primary-600">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Min order: {product.minOrderQuantity} {product.unit}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="small"
                  onClick={() => addToCart(product)}
                  disabled={product.stock < product.minOrderQuantity}
                >
                  <Plus size={16} className="mr-1" />
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        {cart.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">${item.price} per {item.product.unit}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        disabled={item.quantity <= item.product.minOrderQuantity}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <span className="font-medium text-gray-900 w-20 text-right">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-medium text-lg">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Street"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
              required
            />
            <Input
              label="City"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
              required
            />
            <Input
              label="State/Province"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
              required
            />
            <Input
              label="ZIP Code"
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any special instructions for this order..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={createOrderMutation.isLoading}
            disabled={cart.length === 0}
          >
            <ShoppingCart size={20} className="mr-2" />
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;