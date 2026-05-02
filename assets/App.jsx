import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users'; // Importez le composant Users
import Login from './pages/Login';
import Register from './pages/Register';
import SchoolYears from './pages/SchoolYears';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Fees from './pages/Fees';
import Regularization from './pages/Regularization';
import Accounting from './pages/Accounting';
import News from './pages/News';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} /> {/* La route pour le composant Users */}
          <Route path="school-years" element={<SchoolYears />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="fees" element={<Fees />} />
          <Route path="regularization" element={<Regularization />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="news" element={<News />} />
        </Route>
        {/* Route par défaut, par exemple rediriger vers la page de connexion */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;