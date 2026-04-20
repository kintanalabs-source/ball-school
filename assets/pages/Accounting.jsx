import React, { useState, useEffect } from 'react';
import { AccountingService } from '../utils/api';
import { config } from '../utils/config';
import { TrendingUp, TrendingDown, Plus, Download } from 'lucide-react';
import Modal from '../components/Modal';

const Accounting = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    type: 'entry',
    category: config.categories.accounting[0]
  });

  const loadMovements = () => {
    setLoading(true);
    AccountingService.getAll()
      .then(res => {
        setMovements(res.data['member'] || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
        ...formData,
        amount: parseFloat(formData.amount)
    };
    AccountingService.create(data)
      .then(() => {
        setIsModalOpen(false);
        setFormData({ label: '', amount: '', type: 'entry', category: config.categories.accounting[0] });
        loadMovements();
      })
      .catch(err => console.error(err));
  };

  const totalEntries = movements.filter(m => m.type === 'entry').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExits = movements.filter(m => m.type === 'exit').reduce((acc, curr) => acc + curr.amount, 0);

  if (loading && movements.length === 0) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Mouvements Comptables</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-gray-600">
            <Download size={18} />
            Exporter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nouvelle Opération
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Entrées</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">+{totalEntries.toLocaleString()} {config.currency}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Sorties</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">-{totalExits.toLocaleString()} {config.currency}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Solde Période</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">{(totalEntries - totalExits).toLocaleString()} {config.currency}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Libellé</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {movements.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(m.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{m.label}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase tracking-wider">
                    {m.category}
                  </span>
                </td>
                <td className={`px-6 py-4 font-bold ${
                  m.type === 'entry' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {m.type === 'entry' ? '+' : '-'}{m.amount.toLocaleString()} {config.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {movements.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500 italic">Aucun mouvement enregistré.</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Opération Comptable">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
            <input
              required
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Salaire Professeur Math"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="entry">Entrée (Recette)</option>
                <option value="exit">Sortie (Dépense)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {config.categories.accounting.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant ({config.currency})</label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Enregistrer l'opération
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Accounting;
