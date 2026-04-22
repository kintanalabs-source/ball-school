import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentService, ClasseService, FeeService } from '../utils/api';
import { config } from '../utils/config';
import { Search, Plus, Edit2, Trash2, User, Mail, Phone, Calendar as CalendarIcon, MapPin, BookOpen, DollarSign, LogOut, Eye } from 'lucide-react';
import Modal from '../components/Modal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isClasseModalOpen, setIsClasseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // New state for payment modal
  const [studentUnpaidFees, setStudentUnpaidFees] = useState([]); // New state for unpaid fees
  const [selectedFeesToPay, setSelectedFeesToPay] = useState([]); // New state for selected fees to pay
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false); // État de chargement
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // État pour la recherche
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'M',
    address: '',
    phoneNumber: '',
    email: '',
    classe: ''
  });

  const [classeData, setClasseData] = useState({
    name: '',
    tuitionPrice: 50000
  });

  const loadStudents = () => {
    setLoading(true);
    StudentService.getAll()
      .then(res => {
        setStudents(res.data['member'] || res.data['hydra:member'] || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const loadClasses = () => {
    ClasseService.getAll()
      .then(res => {
        const items = res.data?.['member'] || res.data?.['hydra:member'] || (Array.isArray(res.data) ? res.data : []);
        setClasses(items);
      })
      .catch(err => console.error('Error loading classes:', err));
  };

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ firstName: '', lastName: '', birthDate: '', gender: 'M', address: '', phoneNumber: '', email: '', classe: '' });
    loadClasses(); // Reload classes when opening modal
    setIsModalOpen(true);
  };

  const loadStudentUnpaidFees = (studentId) => {
    FeeService.getAll({ student: studentId, isPaid: false })
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
  const identifier = fee['@id'] || `/api/fees/${fee.id}`;
  setSelectedFeesToPay(prev =>
    prev.includes(identifier)
      ? prev.filter(id => id !== identifier)
      : [...prev, identifier]
  );
};
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const service = isEditing 
        ? StudentService.update(selectedStudent.id, formData) 
        : StudentService.create(formData);
    
    service.then(() => {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData({ firstName: '', lastName: '', birthDate: '', gender: 'M', address: '', phoneNumber: '', email: '', classe: '' });
        loadStudents();
      })
      .catch(err => console.error(err));
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

  const handleConfirmPayment = () => {
    if (selectedFeesToPay.length === 0) {
      alert("Veuillez sélectionner au moins un mois à payer.");
      return;
    }

    if (window.confirm(`Confirmer le paiement de ${selectedFeesToPay.length} écolage(s) ?`)) {
      setIsSubmittingPayment(true);
      console.log("Appel API FeeService.pay lancé...");

      FeeService.pay(selectedFeesToPay)
        .then(res => {
          console.log("Paiement enregistré avec succès !", res);
          setIsPaymentModalOpen(false);
          setSelectedFeesToPay([]); // Vider la sélection
          alert('Le paiement a été enregistré avec succès.');
          loadStudents();
        })
        .catch(err => {
          console.error("Erreur API paiement:", err);
          alert("Erreur lors de l'enregistrement. Vérifiez votre contrôleur.");
        })
        .finally(() => {
          setIsSubmittingPayment(false);
        });
    }
  };
  const handleCreateClasse = (e) => {
    e.preventDefault();
    ClasseService.create(classeData)
      .then((res) => {
        setIsClasseModalOpen(false);
        setClasseData({ name: '', tuitionPrice: 50000 });
        loadClasses();
        setFormData({ ...formData, classe: res.data['@id'] });
      })
      .catch(err => console.error(err));
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        birthDate: student.birthDate.split('T')[0],
        gender: student.gender,
        address: student.address || '',
        phoneNumber: student.phoneNumber || '',
        email: student.email || '',
        classe: student.classe?.['@id'] || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cet élève ?')) {
        StudentService.delete(id).then(() => loadStudents());
    }
  };

  const openDetail = (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  // Logique de filtrage pour la recherche
  const filteredStudents = students.filter(student => 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.classe?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && students.length === 0) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setIsEditing(false); setFormData({ firstName: '', lastName: '', birthDate: '', gender: 'M', address: '', phoneNumber: '', email: '', classe: '' }); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Ajouter un élève
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Élève</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Classe</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Date de naissance</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Sexe</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Inscrit le</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 uppercase">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">ID: #{student.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase">
                    {student.classe?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">{new Date(student.birthDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    student.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">{new Date(student.registrationDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={() => openDetail(student)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                        onClick={() => openPaymentModal(student)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Payer écolage"
                    >
                      <DollarSign size={18} />
                    </button>
                    <button 
                        onClick={() => openEdit(student)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500 italic">Aucun élève trouvé.</div>
        )}
      </div>

      {/* Modal Ajouter/Modifier Élève */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setIsEditing(false); }} 
        title={isEditing ? "Modifier l'élève" : "Ajouter un nouvel élève"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                required
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                required
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <div className="flex gap-2">
                <select
                    required
                    value={formData.classe}
                    onChange={(e) => setFormData({...formData, classe: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(c => (
                        <option key={c['@id'] || c.id} value={c['@id'] || `/api/classes/${c.id}`}>{c.name}</option>
                    ))}
                </select>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsClasseModalOpen(true)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Créer une nouvelle classe"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input
              required
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Parent)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            {isEditing ? 'Enregistrer les modifications' : "Enregistrer l'élève"}
          </button>
        </form>
      </Modal>

      {/* Fiche Élève Detail */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Fiche Élève">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg uppercase">
                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
              </div>
              <h4 className="text-2xl font-bold text-gray-800">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
              <p className="text-blue-600 font-medium">Inscrit le {new Date(selectedStudent.registrationDate).toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <BookOpen className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Classe</p>
                  <p className="text-gray-800 font-medium">{selectedStudent.classe?.name || 'Non assignée'}</p>
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
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sexe</p>
                  <p className="text-gray-800 font-medium">{selectedStudent.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
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

            <div className="flex gap-3 pt-4">
                <button 
                    onClick={() => handleGenerateYear(selectedStudent.id)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Générer Année
                </button>
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    Historique Écolage
                </button>
            </div>
            <div className="pt-4">
                <button 
                    onClick={() => openPaymentModal(selectedStudent)}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                    Payer un écolage
                </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Ajouter Classe (Sur le champ) */}
      <Modal isOpen={isClasseModalOpen} onClose={() => setIsClasseModalOpen(false)} title="Nouvelle Classe">
        <form onSubmit={handleCreateClasse} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la classe</label>
                <input
                    required
                    autoFocus
                    type="text"
                    value={classeData.name}
                    onChange={(e) => setClasseData({...classeData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 6ème A, Terminale S..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix écolage mensuel ({config.currency})</label>
                <input
                    required
                    type="number"
                    value={classeData.tuitionPrice}
                    onChange={(e) => setClasseData({...classeData, tuitionPrice: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Créer la classe
            </button>
        </form>
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
                            else setSelectedFeesToPay(studentUnpaidFees.map(f => f['@id'] || `/api/fees/${f.id}`));
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
                        checked={selectedFeesToPay.includes(fee['@id'] || `/api/fees/${fee.id}`)}
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
    </div>
  );
};

export default Students;
