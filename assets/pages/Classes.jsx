import React, { useState, useEffect } from 'react';
import { ClasseService } from '../utils/api';
import { config } from '../utils/config';
import { Plus, Edit2, Trash2, School, DollarSign, Users } from 'lucide-react';
import Modal from '../components/Modal';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    tuitionPrice: 50000
  });

  const loadClasses = () => {
    setLoading(true);
    ClasseService.getAll()
      .then(res => {
        setClasses(res.data['member'] || res.data['hydra:member'] || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const service = isEditing 
        ? ClasseService.update(selectedClasse.id, formData) 
        : ClasseService.create(formData);
    
    service.then(() => {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData({ name: '', tuitionPrice: 50000 });
        loadClasses();
      })
      .catch(err => console.error(err));
  };

  const openEdit = (classe) => {
    setSelectedClasse(classe);
    setIsEditing(true);
    setFormData({
        name: classe.name,
        tuitionPrice: classe.tuitionPrice
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette classe ? Cela pourrait affecter les élèves liés.')) {
        ClasseService.delete(id).then(() => loadClasses());
    }
  };

  if (loading && classes.length === 0) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Classes</h2>
        <button
          onClick={() => { setIsEditing(false); setFormData({ name: '', tuitionPrice: 50000 }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nouvelle Classe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classe) => (
          <div key={classe.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <School size={24} />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openEdit(classe)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(classe.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-1">{classe.name}</h3>
            
            <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={18} className="text-green-500" />
                    <span className="font-bold text-gray-900">{classe.tuitionPrice?.toLocaleString()} {config.currency}</span>
                    <span className="text-sm">/ mois</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Users size={18} className="text-blue-400" />
                    <span>Niveau de tarification standard</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500 italic bg-white rounded-xl border border-dashed border-gray-300">
              Aucune classe configurée. Commencez par en ajouter une.
          </div>
      )}

      {/* Modal Ajouter/Modifier Classe */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setIsEditing(false); }} 
        title={isEditing ? "Modifier la Classe" : "Ajouter une Classe"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la classe</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: 6ème A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix de l'écolage ({config.currency})</label>
            <input
              required
              type="number"
              value={formData.tuitionPrice}
              onChange={(e) => setFormData({...formData, tuitionPrice: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            {isEditing ? 'Mettre à jour' : "Créer la classe"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
