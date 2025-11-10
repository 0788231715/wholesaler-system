import React from 'react';

const OrderDetails = ({ order }) => {
  if (!order) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Order Details</h3>
      <p>Order #{order.orderNumber}</p>
      <p>Status: {order.status}</p>
      <p>Total: ${order.totalAmount}</p>
    </div>
  );
};

export default OrderDetails;