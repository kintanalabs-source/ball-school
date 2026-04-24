import React, { useState, useEffect } from 'react';
import { FeeService, StudentService } from '../utils/api';
import { config } from '../utils/config';
import { Search, CheckCircle, Clock, CreditCard } from 'lucide-react';

const Fees = () => {
  const currentMonthFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ][new Date().getMonth()];

  const [filter, setFilter] = useState('unpaid');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthFr);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFees, setSelectedFees] = useState([]);

  const loadFees = () => {
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    const yearIRI = selectedYear?.['@id'] || (selectedYear?.id ? `/api/school_years/${selectedYear.id}` : null);

    setLoading(true);
    const params = { month: selectedMonth }; // Garde le filtre par mois

    if (yearIRI) {
        params.schoolYear = yearIRI; // Ajoute le filtre par année scolaire
    }

    if (filter !== 'all') {
        params.isPaid = filter === 'paid';
    }
    FeeService.getAll(params) // Envoie les paramètres à l'API
      .then(res => {
        setFees(res.data['member'] || res.data['hydra:member'] || []);
        setLoading(false);
        setSelectedFees([]); // Reset selection on reload
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFees();
  }, [filter, selectedMonth]);

  const toggleSelect = (id) => {
    setSelectedFees(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const unpaidInView = fees.filter(f => !f.isPaid).map(f => f.id);
    if (selectedFees.length === unpaidInView.length && unpaidInView.length > 0) {
      setSelectedFees([]);
    } else {
      setSelectedFees(unpaidInView);
    }
  };

  const handleBulkPay = () => {
    if (selectedFees.length === 0) return;
    
    if (window.confirm(`Confirmer le paiement de ${selectedFees.length} écolage(s) ?`)) {
      FeeService.pay(selectedFees)
        .then(() => {
          loadFees();
        })
        .catch(err => console.error(err));
    }
  };

  const handleMarkAsPaid = (id) => {
    FeeService.pay([id]).then(() => loadFees());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 w-fit">
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'unpaid' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Impayés
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'paid' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Payés
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tous
          </button>
        </div>

        <div className="flex items-center gap-4">
          {selectedFees.length > 0 && (
            <button
              onClick={handleBulkPay}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all animate-in fade-in zoom-in duration-200"
            >
              <CreditCard size={18} />
              Payer ({selectedFees.length})
            </button>
          )}

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map(m => (
                <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={fees.length > 0 && fees.filter(f => !f.isPaid).every(f => selectedFees.includes(f.id))}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Élève</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Période</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fees.map((fee) => (
              <tr key={fee.id} className={selectedFees.includes(fee.id) ? 'bg-blue-50/30' : ''}>
                <td className="px-6 py-4">
                  {!fee.isPaid && (
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedFees.includes(fee.id)}
                      onChange={() => toggleSelect(fee.id)}
                    />
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                    {fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : 'N/A'}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{fee.amount.toLocaleString()} {config.currency}</td>
                <td className="px-6 py-4 text-gray-600">{fee.month} {fee.year}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                    fee.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {fee.isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {fee.isPaid ? 'Payé' : 'En attente'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {!fee.isPaid && (
                    <button
                        onClick={() => handleMarkAsPaid(fee.id)}
                        className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Marquer comme payé
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {fees.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500">
            Aucun résultat pour ces critères.
          </div>
        )}
      </div>
    </div>
  );
};

export default Fees;
