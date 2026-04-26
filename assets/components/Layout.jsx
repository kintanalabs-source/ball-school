import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Newspaper,
  Calculator,
  School,
  LogOut
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Élèves', path: '/admin/students', icon: Users },
    { name: 'Classes', path: '/admin/classes', icon: School },
    { name: 'Écolage', path: '/admin/fees', icon: CreditCard },
    { name: 'Actualités', path: '/admin/news', icon: Newspaper },
    { name: 'Comptabilité', path: '/admin/accounting', icon: Calculator },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <School size={24} />
          </div>
          <span className="text-xl font-bold text-gray-800">FJKM Mahalavolona</span>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600 mt-4 border-t border-gray-50 pt-6"
          >
            <LogOut size={20} />
            <span className="font-bold uppercase text-xs tracking-wider">Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-700">
            {menuItems.find(item => item.path === location.pathname)?.name || 'Application'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              AD
            </div>
          </div>
        </header>

        <div className="p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
