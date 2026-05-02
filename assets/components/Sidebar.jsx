import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School, 
  CreditCard, 
  FileText,
  LogOut, 
  PieChart,
  History
} from 'lucide-react';
import { config } from '../utils/config';

const Sidebar = () => {
  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/admin/students', icon: GraduationCap, label: 'Élèves' },
    { path: '/admin/classes', icon: School, label: 'Classes' },
    { path: '/admin/fees', icon: CreditCard, label: 'Écolages' },
    { path: '/admin/regularization', icon: History, label: 'Régularisations' },
    { path: '/admin/accounting', icon: PieChart, label: 'Comptabilité' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' }, // Le bouton demandé
    { path: '/admin/news', icon: FileText, label: 'Actualités' },
  ];

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      window.location.href = '/';
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen sticky top-0 p-8 flex flex-col shrink-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
          <School size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg text-gray-800 leading-tight uppercase tracking-tighter">
            {config.schoolName}
          </span>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Administration</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1' 
                : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1'}
            `}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all duration-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:translate-x-1"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;