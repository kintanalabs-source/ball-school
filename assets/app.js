import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/app.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Fees from './pages/Fees';
import News from './pages/News';
import Accounting from './pages/Accounting';

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/fees" element={<Fees />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/accounting" element={<Accounting />} />
                </Routes>
            </Layout>
        </Router>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
