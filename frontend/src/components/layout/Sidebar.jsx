import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Users,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'producer', 'retailer'] },
    { path: '/products', icon: Package, label: 'Products', roles: ['admin', 'manager', 'producer', 'retailer'] },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'manager', 'producer', 'retailer'] },
    { path: '/chat', icon: MessageSquare, label: 'Chat', roles: ['admin', 'manager', 'producer', 'retailer'] },
    { path: '/invoices', icon: FileText, label: 'Invoices', roles: ['admin', 'manager', 'retailer'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Wholesaler System</h1>
        <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;