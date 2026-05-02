import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users as UsersIcon, CheckCircle, XCircle, Mail, ShieldAlert, Plus, UserPlus, Trash2 } from 'lucide-react';
import { config } from '../utils/config';
import Modal from '../components/Modal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: '', password: '', confirmPassword: '' });

  const loadUsers = async () => {
    console.log("Tentative d'appel API pour charger les utilisateurs...");
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Le composant Users est monté");
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (newUserData.password !== newUserData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // On n'envoie que l'email et le mot de passe à l'API
      const { email, password } = newUserData;
      await api.post('/admin/users', { email, password });
      setIsModalOpen(false);
      setNewUserData({ email: '', password: '', confirmPassword: '' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        // Mise à jour locale pour retirer l'utilisateur de la liste
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.post(`/admin/users/${userId}/status`, { status: newStatus });
      // Mise à jour locale immédiate pour une interface fluide
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Comptes</h2>
          <p className="text-sm text-gray-500">Approuvez ou refusez l'accès aux utilisateurs inscrits.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Créer un utilisateur</span>
          </button>
          <input 
            type="text" 
            placeholder="Rechercher un email..."
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100"><UsersIcon size={20} /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rôles</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Statut Actuel</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                      <Mail size={16} />
                    </div>
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {user.roles.map(role => (
                      <span key={role} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                        {role.replace('ROLE_', '')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 'accepted' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {user.status === 'accepted' ? 'Accepté' : 'Refusé'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleStatusChange(user.id, 'accepted')}
                      disabled={user.status === 'accepted'}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        user.status === 'accepted' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleStatusChange(user.id, 'refused')}
                      disabled={user.status === 'refused'}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        user.status === 'refused' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Refuser
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer l'utilisateur"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <ShieldAlert size={40} className="opacity-20" />
            <p className="italic">Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un nouvel utilisateur">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail size={16} />
              </span>
              <input
                required
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="exemple@mail.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              required
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              required
              type="password"
              value={newUserData.confirmPassword}
              onChange={(e) => setNewUserData({...newUserData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4">
            <UserPlus size={18} />
            Créer le compte
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;