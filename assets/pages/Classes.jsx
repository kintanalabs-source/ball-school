import React, { useState, useEffect } from 'react';
import { ClasseService, StudentService } from '../utils/api';
import { config } from '../utils/config';
import { Plus, Edit2, Trash2, School, DollarSign, Users, Eye } from 'lucide-react';
import Modal from '../components/Modal';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [classStudents, setClassStudents] = useState([]);

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

  const openDetail = (classe) => {
    setSelectedClasse(classe);
    setIsDetailOpen(true);
    setClassStudents([]);
    
    // On récupère les élèves dont la classe correspond à l'IRI de la classe sélectionnée
    StudentService.getAll({ classe: classe['@id'] })
      .then(res => {
        setClassStudents(res.data['member'] || res.data['hydra:member'] || []);
      })
      .catch(err => console.error(err));
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
                    <button onClick={() => openDetail(classe)} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Liste des élèves">
                        <Eye size={18} />
                    </button>
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

      {/* Modal Liste des élèves de la classe */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title={`Élèves inscrits en ${selectedClasse?.name}`}
      >
        <div className="space-y-4">
          {classStudents.length > 0 ? (
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase">Matricule</th>
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase">Nom & Prénom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {classStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {student.matricule || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-right">
                <p className="text-xs text-gray-500 font-bold">Total : {classStudents.length} élève(s)</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 italic">
              Aucun élève n'est encore inscrit dans cette classe.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Classes;
