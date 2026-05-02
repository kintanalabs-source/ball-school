import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto reveal visible">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;