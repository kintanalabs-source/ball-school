import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolYearService } from '../utils/api';
import { config } from '../utils/config';
import { Calendar, Plus, ArrowRight, Wallet, History, Lock } from 'lucide-react';

const SchoolYears = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadYears = () => {
    setLoading(true);
    SchoolYearService.getAll()
      .then(res => {
        const data = res.data['member'] || res.data['hydra:member'] || [];
        // Trier par ID décroissant pour avoir les plus récentes en premier
        const sorted = data.sort((a, b) => b.id - a.id).slice(0, 10);
        setYears(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleSelectYear = (year) => {
    // On stocke l'année entière pour avoir accès au libellé et à l'ID partout
    localStorage.setItem('selectedSchoolYear', JSON.stringify(year));
    navigate('/admin/dashboard');
  };

  const handleCreateNewYear = () => {
    const lastYear = years[0]; 
    const nextLabel = prompt("Libellé de la nouvelle année (ex: 2024-2025) :");
    
    if (!nextLabel) return;

    // Logique de transfert : on récupère le solde final de la période précédente
    const carryOverBalance = lastYear ? lastYear.finalBalance : 0;

    const newYearData = {
      label: nextLabel,
      initialBalance: parseFloat(carryOverBalance),
      startDate: new Date().toISOString(),
    };

    SchoolYearService.create(newYearData)
      .then(res => {
        localStorage.setItem('selectedSchoolYear', JSON.stringify(res.data));
        navigate('/admin/dashboard');
      })
      .catch(err => alert("Erreur lors de la création de l'année."));
  };

  if (loading) return <div className="p-12 text-center text-gray-500 italic">Chargement des périodes...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Archives Scolaires</h1>
          <p className="text-gray-500">Sélectionnez une année pour accéder au Dashboard spécifique</p>
        </div>
        <button
          onClick={handleCreateNewYear}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
          Nouvelle Année scolaire
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.map((year) => (
          <div 
            key={year.id}
            onClick={() => handleSelectYear(year)}
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <History size={100} />
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{year.label}</h3>
              {year.isClosed && (
                <span className="ml-auto bg-red-100 text-red-600 p-1.5 rounded-full" title="Compte clôturé">
                  <Lock size={14} />
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget de fonctionnement</span>
                <span className="font-bold text-gray-700">{(year.totalBudget || 0).toLocaleString()} {config.currency}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className="text-gray-500 font-medium text-sm">Solde Final</span>
                <span className={`text-lg font-black ${year.finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(year.finalBalance || 0).toLocaleString()} {config.currency}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              Ouvrir la gestion <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolYears;