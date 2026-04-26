import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/app.css';
import { LoadingProvider, useLoading } from './utils/loading';
import LoadingOverlay from './components/LoadingOverlay';
import { setLoadingCallbacks } from './utils/api';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import SchoolYears from './pages/SchoolYears';
import Fees from './pages/Fees';
import News from './pages/News';
import Accounting from './pages/Accounting';

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
                    <Route path="/school-years" element={<SchoolYears />} />
                    {/* Les autres routes sont enveloppées individuellement par le Layout pour afficher la sidebar */}
                    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/students" element={<Layout><Students /></Layout>} />
                    <Route path="/classes" element={<Layout><Classes /></Layout>} />
                    <Route path="/fees" element={<Layout><Fees /></Layout>} />
                    <Route path="/news" element={<Layout><News /></Layout>} />
                    <Route path="/accounting" element={<Layout><Accounting /></Layout>} />
                </Routes>
            </Router>
        </LoadingProvider>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
