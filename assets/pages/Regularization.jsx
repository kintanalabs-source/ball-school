import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../utils/config';
import { CreditCard, History, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';

const Regularization = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const loadRegularizations = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/previous_year_regularizations');
            setData(res.data['member'] || res.data['hydra:member'] || []);
        } catch (err) {
            console.error("Erreur chargement régularisations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegularizations();
    }, []);

    const handleSync = async () => {
        const currentYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
        setIsSyncing(true);
        try {
            const res = await axios.post('/api/regularizations/sync', {
                currentYear: currentYear?.['@id'] || `/api/school_years/${currentYear?.id}`
            });
            alert(res.data.message);
            loadRegularizations();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la recherche des dettes.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleOpenPay = (reg) => {
        setSelectedReg(reg);
        setPayAmount(reg.totalRemaining.toString());
        setIsModalOpen(true);
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        const currentYear = JSON.parse(localStorage.getItem('selectedSchoolYear'));
        
        setIsSubmitting(true);
        try {
            await axios.post(`/api/regularizations/${selectedReg.id}/pay`, {
                amount: parseFloat(payAmount),
                schoolYear: currentYear?.['@id'] || `/api/school_years/${currentYear?.id}`
            });
            alert("Paiement de régularisation enregistré !");
            setIsModalOpen(false);
            loadRegularizations();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors du paiement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const globalDebt = data.reduce((acc, curr) => acc + curr.totalRemaining, 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Régularisation Année Précédente</h2>
                    <p className="text-sm text-gray-500">Liste des élèves ayant des arriérés sur l'exercice précédent.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-sm"
                >
                    <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Recherche...' : 'Chercher les impayés (An -1)'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Élève</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Mois impayés</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Reste à payer</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.filter(r => r.totalRemaining > 0).map((reg) => (
                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {typeof reg.student === 'object' 
                                        ? `${reg.student?.firstName} ${reg.student?.lastName}` 
                                        : `Élève #${reg.id}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 italic">{reg.unpaidMonths}</td>
                                <td className="px-6 py-4 font-bold text-red-600">
                                    {reg.totalRemaining.toLocaleString()} {config.currency}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {reg.totalRemaining > 0 ? (
                                        <button
                                            onClick={() => handleOpenPay(reg)}
                                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                                        >
                                            <CreditCard size={16} /> Régler
                                        </button>
                                    ) : (
                                        <span className="text-green-600 font-bold text-sm">Réglé</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                        <tr>
                            <td colSpan="2" className="px-6 py-4 text-gray-700 text-right">Dette Totale à Recouvrer :</td>
                            <td className="px-6 py-4 text-red-600 text-lg">{globalDebt.toLocaleString()} {config.currency}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Paiement de régularisation">
                <form onSubmit={handleConfirmPayment} className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium">
                            Élève : {typeof selectedReg?.student === 'object' 
                                ? `${selectedReg.student.firstName} ${selectedReg.student.lastName}` 
                                : 'Chargement...'}
                        </p>
                        <p className="text-lg font-bold text-blue-800">Reste total : {selectedReg?.totalRemaining.toLocaleString()} {config.currency}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant à payer manuellement ({config.currency})</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            max={selectedReg?.totalRemaining}
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-xl"
                        />
                        <p className="text-xs text-gray-400 mt-2 italic">Libellé comptable : Régularisation d’écolage de l’année précédente</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Confirmer le règlement'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Regularization;