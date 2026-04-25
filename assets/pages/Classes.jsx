import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClasseService, StudentService, FeeService } from '../utils/api';
import { config } from '../utils/config';
import { Plus, Edit2, Trash2, School, DollarSign, Users, Eye, Mail, Phone, Calendar as CalendarIcon, MapPin, BookOpen, Tag, User } from 'lucide-react';
import Modal from '../components/Modal';

const Classes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentDetailOpen, setIsStudentDetailOpen] = useState(false);
  const [studentFeesForDetail, setStudentFeesForDetail] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [studentUnpaidFees, setStudentUnpaidFees] = useState([]);
  const [selectedFeesToPay, setSelectedFeesToPay] = useState([]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tuitionPrice: 50000
  });

  const loadClasses = () => {
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    const yearIRI = selectedYear?.['@id'] || (selectedYear?.id ? `/api/school_years/${selectedYear.id}` : null);
    
    setLoading(true);
    const params = yearIRI ? { schoolYear: yearIRI } : {};

    ClasseService.getAll(params)
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
    // Ensure a school year is selected before loading classes
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    if (!selectedYear) return; // Do not proceed if no year is selected

    loadClasses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    const yearIRI = selectedYear?.['@id'] || `/api/school_years/${selectedYear.id}`;

    const data = { ...formData, schoolYear: yearIRI };
    const service = isEditing 
        ? ClasseService.update(selectedClasse.id, data) 
        : ClasseService.create(data);
    
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
    
    // Récupérer l'année scolaire sélectionnée dans le localStorage
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    
    // Filtrer par classe ET par année scolaire
    const params = { 
        classe: classe['@id'],
        schoolYear: selectedYear?.['@id'] || selectedYear?.id
    };

    StudentService.getAll(params)
      .then(res => {
        setClassStudents(res.data['member'] || res.data['hydra:member'] || []);
      })
      .catch(err => console.error(err));
  };

  const openStudentDetail = (student) => {
    setIsStudentDetailOpen(true);
    setSelectedStudent(student); 
    setStudentFeesForDetail([]);

    // Récupérer l'élève complet pour l'image
    StudentService.get(student.id).then(res => {
      setSelectedStudent(res.data);
    }).catch(err => console.error("Erreur fetch image:", err));

    // Récupérer l'année scolaire sélectionnée dans le localStorage
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    const yearIRI = selectedYear?.['@id'] || (selectedYear?.id ? `/api/school_years/${selectedYear.id}` : null);

    // Paramètres pour filtrer les écolages par étudiant ET par année scolaire
    const params = {
      'student.id': student.id,
    };

    if (yearIRI) {
      params.schoolYear = yearIRI;
    }

    FeeService.getAll(params)
      .then(res => {
        setStudentFeesForDetail(res.data['member'] || res.data['hydra:member'] || []);
      })
      .catch(err => console.error('Error loading student fees for detail:', err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette classe ? Cela pourrait affecter les élèves liés.')) {
        ClasseService.delete(id).then(() => loadClasses());
    }
  };

  const loadStudentUnpaidFees = (studentId) => {
    const selectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
    const yearIRI = selectedYear?.['@id'] || (selectedYear?.id ? `/api/school_years/${selectedYear.id}` : null);
    
    const params = { 
        'student.id': studentId, 
        isPaid: false 
    };

    if (yearIRI) {
        params.schoolYear = yearIRI;
    }

    FeeService.getAll(params)
      .then(res => {
        setStudentUnpaidFees(res.data['member'] || res.data['hydra:member'] || []);
      })
      .catch(err => console.error('Error loading unpaid fees:', err));
  };

  const openPaymentModal = (student) => {
    setSelectedStudent(student);
    setSelectedFeesToPay([]);
    loadStudentUnpaidFees(student.id);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSelection = (fee) => {
    const identifier = fee.id;
    setSelectedFeesToPay(prev =>
      prev.includes(identifier)
        ? prev.filter(id => id !== identifier)
        : [...prev, identifier]
    );
  };

  const handleConfirmPayment = () => {
    if (selectedFeesToPay.length === 0) {
      alert("Veuillez sélectionner au moins un mois à payer.");
      return;
    }

    if (window.confirm(`Confirmer le paiement de ${selectedFeesToPay.length} écolage(s) ?`)) {
      setIsSubmittingPayment(true);
      FeeService.pay(selectedFeesToPay)
        .then(() => {
          setIsPaymentModalOpen(false);
          setSelectedFeesToPay([]);
          alert("Le paiement a été enregistré avec succès.");
          if (selectedClasse) openDetail(selectedClasse);
        })
        .catch(err => {
          console.error("Erreur API paiement:", err);
          alert("Erreur lors de l'enregistrement.");
        })
        .finally(() => {
          setIsSubmittingPayment(false);
        });
    }
  };

  const handleGenerateYear = (studentId) => {
    if(window.confirm('Générer tous les écolages de l\'année pour cet élève ?')) {
        StudentService.generateYearFees(studentId)
            .then(() => {
                alert('Écolages générés avec succès !');
                loadStudentUnpaidFees(studentId);
            })
            .catch(err => console.error(err));
    }
  };

  const currentSelectedYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
  if (!currentSelectedYear) {
    return <div className="p-8 text-center text-red-500 font-bold">Veuillez sélectionner une année scolaire sur la page d'accueil.</div>;
  }
  if (loading && classes.length === 0) return <div className="p-8 text-center text-gray-500">Chargement des classes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Classes</h2>
          <p className="text-sm text-blue-600 font-medium">Année scolaire : {JSON.parse(localStorage.getItem('selectedSchoolYear'))?.label}</p>
        </div>
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
        title={isEditing ? "Modifier la Classe" : `Ajouter une Classe (${JSON.parse(localStorage.getItem('selectedSchoolYear'))?.label})`}
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
                    <th className="px-4 py-3 font-bold text-gray-600 uppercase text-right">Actions</th>
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
                        <div className="flex items-center gap-3">
                          {student.image ? (
                            <img src={student.image} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-[10px] uppercase">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                          )}
                          <span>{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => openStudentDetail(student)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Voir fiche élève"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => openPaymentModal(student)}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold transition-colors"
                            title="Payer l'écolage"
                          >
                            <DollarSign size={16} />
                            Payer
                          </button>
                        </div>
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

      {/* Modal Payer Ecolage */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Payer l'écolage pour ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}>
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Sélectionnez le(s) mois à régler :</label>
                {studentUnpaidFees.length > 0 && (
                    <button 
                        onClick={() => {
                            if (selectedFeesToPay.length === studentUnpaidFees.length) setSelectedFeesToPay([]);
                            else setSelectedFeesToPay(studentUnpaidFees.map(f => f.id));
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline"
                    >
                        {selectedFeesToPay.length === studentUnpaidFees.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                )}
            </div>
            {studentUnpaidFees.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {studentUnpaidFees.map(fee => (
                  <div key={fee.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedFeesToPay.includes(fee.id)}
                        onChange={() => handlePaymentSelection(fee)}
                      />
                      <div>
                        <p className="font-medium">{fee.month} {fee.year}</p>
                        <p className="text-sm text-gray-500">{fee.amount.toLocaleString()} {config.currency}</p>
                      </div>
                    </label>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      En attente
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 italic mb-4">Aucun écolage impayé trouvé pour cet élève.</p>
                <button
                    onClick={() => handleGenerateYear(selectedStudent.id)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                    Générer les écolages de l'année
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isSubmittingPayment}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingPayment ? 'Enregistrement...' : `Enregistrer le paiement (${selectedFeesToPay.length})`}
            </button>
          </div>
        )}
      </Modal>

      {/* Fiche Élève Detail (Modal réutilisée de Students.jsx) */}
      <Modal isOpen={isStudentDetailOpen} onClose={() => setIsStudentDetailOpen(false)} title="Fiche Élève">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              {selectedStudent.image ? (
                <img src={selectedStudent.image} alt="" className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg uppercase">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
              )}
              <h4 className="text-2xl font-bold text-gray-800">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
              <p className="text-blue-600 font-medium">Inscrit le {new Date(selectedStudent.registrationDate).toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Tag className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Numéro Matricule</p>
                  <p className="text-gray-800 font-bold">{selectedStudent.matricule || 'Non assigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <CalendarIcon className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date de naissance</p>
                  <p className="text-gray-800 font-medium">{new Date(selectedStudent.birthDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Parent</p>
                  <p className="text-gray-800 font-medium">{selectedStudent.email || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Téléphone</p>
                  <p className="text-gray-800 font-medium">{selectedStudent.phoneNumber || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Adresse</p>
                  <p className="text-gray-800 font-medium">{selectedStudent.address || 'Non renseignée'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-bold text-gray-700 uppercase tracking-widest">État des Écolages</h5>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                  Total : {studentFeesForDetail.length || 0} mois
                </span>
              </div>
              
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-bold text-gray-600">Période</th>
                      <th className="px-4 py-3 font-bold text-gray-600">Montant</th>
                      <th className="px-4 py-3 font-bold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentFeesForDetail.length > 0 ? (
                      [...studentFeesForDetail].sort((a, b) => a.id - b.id).map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-700">{fee.month} {fee.year}</td>
                          <td className="px-4 py-3 text-gray-600">{fee.amount.toLocaleString()} {config.currency}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                              fee.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {fee.isPaid ? 'Payé' : 'En attente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-400 italic">Chargement...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Classes;
