import React, { useState, useEffect } from 'react';
import { NewsService } from '../utils/api';
import { config } from '../utils/config';
import { Plus, Calendar, Tag, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: config.categories.news[0],
    image: ''
  });

  const loadNews = () => {
    setLoading(true);
    NewsService.getAll()
      .then(res => {
        setNews(res.data['member'] || res.data['hydra:member'] || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const action = isEditing 
      ? NewsService.update(selectedNews.id, formData) 
      : NewsService.create(formData);

    action
      .then(() => {
        setIsModalOpen(false);
        setIsEditing(false);
        setSelectedNews(null);
        setFormData({ title: '', content: '', category: config.categories.news[0], image: '' });
        loadNews();
      })
      .catch(err => console.error(err));
  };

  const openEdit = (item) => {
    setSelectedNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      image: item.image || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette actualité ?")) {
      NewsService.delete(id)
        .then(() => {
          loadNews();
        })
        .catch(err => console.error(err));
    }
  };

  if (loading && news.length === 0) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Actualités & Programmes</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedNews(null);
            setFormData({ 
              title: '', content: '', 
              category: config.categories.news[0], image: '' 
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Publier une nouvelle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-48 bg-gray-100 relative">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                <Calendar size={14} />
                {new Date(item.publishedAt).toLocaleDateString()}
              </div>
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {item.content}
              </p>
              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">PUBLIÉ</span>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(item)} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                    <Edit2 size={14} />
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm font-bold flex items-center gap-1 hover:underline">
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {news.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 italic">Aucune actualité publiée.</div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setIsEditing(false); }} 
        title={isEditing ? "Modifier l'actualité" : "Publier une nouvelle"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Vacances de Pâques"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {config.categories.news.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea
              required
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Détails de l'actualité..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image (optionnel)</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            {isEditing ? 'Enregistrer les modifications' : 'Publier maintenant'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default News;
