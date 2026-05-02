import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/app.css';
import { LoadingProvider, useLoading } from './utils/loading';
import LoadingOverlay from './components/LoadingOverlay';
import { setLoadingCallbacks } from './utils/api';
import Welcome from './pages/Welcome';
import AdminLayout from './components/AdminLayout'; // Import AdminLayout
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import SchoolYears from './pages/SchoolYears';
import Fees from './pages/Fees';
import News from './pages/News';
import Accounting from './pages/Accounting';
import Regularization from './pages/Regularization';
import Users from './pages/Users'; // Import Users

// Composant interne qui enregistre les callbacks de loading
const LoadingManager = () => {
    const loading = useLoading();
    
    // Enregistrer les callbacks au premier rendu
    React.useEffect(() => {
        setLoadingCallbacks({
            startLoading: loading.startLoading,
            stopLoading: loading.stopLoading
        });
    }, []);
    
    return <LoadingOverlay />;
};

const App = () => {
    return (
        <LoadingProvider>
            <LoadingManager />
            <Router>
                <Routes>
                    {/* La racine affiche maintenant la page blanche de bienvenue sans la barre latérale */}
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* Page de sélection d'année sans sidebar pour un effet "Portail" */}
                    <Route path="/admin/school-years" element={<SchoolYears />} />

                    {/* Routes d'administration avec AdminLayout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="students" element={<Students />} />
                        <Route path="classes" element={<Classes />} />
                        <Route path="fees" element={<Fees />} />
                        <Route path="news" element={<News />} />
                        <Route path="regularization" element={<Regularization />} />
                        <Route path="accounting" element={<Accounting />} />
                        <Route path="users" element={<Users />} /> {/* La route pour le composant Users */}
                    </Route>
                </Routes>
            </Router>
        </LoadingProvider>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
