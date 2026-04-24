import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentService, FeeService, AccountingService, NewsService } from '../utils/api';
import { config } from '../utils/config';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-sm">
        <TrendingUp size={16} className="text-green-500" />
        <span className="text-green-500 font-medium">{trend}</span>
        <span className="text-gray-400">vs mois dernier</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    entries: 0,
    exits: 0,
    unpaid: 0,
    initialBalance: 0
  });
  const [recentFees, setRecentFees] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    
    // Sécurité : Rediriger si aucune année n'est sélectionnée
    if (!selectedYear) {
      navigate('/school-years');
      return;
    }

    // On s'assure d'utiliser l'IRI complet pour le filtrage API Platform
    const yearIRI = selectedYear?.['@id'] || (selectedYear?.id ? `/api/school_years/${selectedYear.id}` : null);
    
    // Paramètres de filtrage globaux par année scolaire
    const params = yearIRI ? { schoolYear: yearIRI } : {};

    setStats(s => ({...s, initialBalance: selectedYear.initialBalance || 0}));

    // In a real app we would have a dedicated stats endpoint
    StudentService.getAll(params).then(res => setStats(s => ({...s, students: res.data['totalItems'] || res.data['hydra:totalItems']})));
    
    AccountingService.getAll(params).then(res => {
        const movs = res.data['member'] || res.data['hydra:member'] || [];
        const entries = movs.filter(m => m.type === 'entry').reduce((acc, curr) => acc + curr.amount, 0);
        const exits = movs.filter(m => m.type === 'exit').reduce((acc, curr) => acc + curr.amount, 0);
        setStats(s => ({...s, entries, exits}));
    });

    FeeService.getAll({ ...params, isPaid: false }).then(res => setStats(s => ({...s, unpaid: res.data['totalItems'] || res.data['hydra:totalItems']})));

    FeeService.getAll({ ...params, isPaid: true }).then(res => setRecentFees((res.data['member'] || res.data['hydra:member'])?.slice(0, 4) || []));
    NewsService.getAll().then(res => setRecentNews((res.data['member'] || res.data['hydra:member'])?.slice(0, 3) || []));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-gray-800">Tableau de Bord</h2>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Année Scolaire : {JSON.parse(localStorage.getItem('selectedSchoolYear'))?.label}</p>
        </div>
        <button 
          onClick={() => navigate('/school-years')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
          Changer d'année
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Élèves"
          value={stats.students}
          icon={Users}
          color="bg-blue-500"
          trend="+0%"
        />
        <StatCard
          title="Recettes Période"
          value={`${stats.entries.toLocaleString()} ${config.currency}`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Dépenses"
          value={`${stats.exits.toLocaleString()} ${config.currency}`}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Solde Final Estimé"
          value={`${(stats.initialBalance + stats.entries - stats.exits).toLocaleString()} ${config.currency}`}
          icon={TrendingUp}
          color="bg-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Derniers Écolages Payés</h3>
          <div className="space-y-4">
            {recentFees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 uppercase">
                    {fee.student?.firstName[0]}{fee.student?.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{fee.student?.firstName} {fee.student?.lastName}</p>
                    <p className="text-xs text-gray-500">{fee.month} {fee.year}</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+{fee.amount.toLocaleString()} {config.currency}</span>
              </div>
            ))}
            {recentFees.length === 0 && <p className="text-gray-500 italic text-sm">Aucun paiement récent.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Actualités Récentes</h3>
          <div className="space-y-4">
            {recentNews.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase">{item.category}</span>
                  <h4 className="font-bold mt-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                </div>
              </div>
            ))}
            {recentNews.length === 0 && <p className="text-gray-500 italic text-sm">Aucune actualité récente.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
