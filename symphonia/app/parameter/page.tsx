'use client';

import { useState, useEffect } from 'react';
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";
import axios from 'axios';

export default function SettingsPage() {
    const [user, setUser] = useState({ username: '', email: '' });
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('symphonia_user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Vérification de la confirmation du mot de passe
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        const token = localStorage.getItem('symphonia_token')

        if (!token || token === "null") {
        setMessage({ type: 'error', text: 'Votre session a expiré. Veuillez vous reconnecter.' })
        return;
    }

        try {
            const res = await axios.put('http://localhost:8000/update-profile', 
                { 
                    username: user.username, 
                    email: user.email, 
                    new_password: passwords.new || null 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.status === "success") {
                localStorage.setItem('symphonia_user', JSON.stringify(user));
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
                setPasswords({ new: '', confirm: '' }); // Reset les champs password
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        }
    };

    return (
            <div className="flex min-h-screen">
                <SymphoniaSidebar />
                <main className="flex-1 mt-[-2rem] lg:ml-[18%] p-6 md:p-12 flex flex-col items-center">
                     <TitlePage title="Paramètres" />
                    <div className="w-full max-w-2xl">
                        
                        <div className="mt-8 bg-[#1B2945] p-8 rounded-3xl border border-white/5 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                                Informations du compte
                            </h2>
                            
                            <form onSubmit={handleUpdate} className="space-y-5">
                            
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Nom d'utilisateur</label>
                                    <input 
                                        type="text" 
                                        value={user.username}
                                        onChange={(e) => setUser({...user, username: e.target.value})}
                                        className="w-full bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Adresse Email</label>
                                    <input 
                                        type="email" 
                                        value={user.email}
                                        readOnly
                                        className="w-full font-bold bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="h-px bg-white/5 my-4"></div>

                                {/* Mot de passe */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Nouveau mot de passe</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                            className="w-full bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Confirmer</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                            className={`w-full bg-[#0f0a1e]/50 border ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white focus:outline-none transition-all`}
                                        />
                                    </div>
                                </div>

                                {/* Messages d'état */}
                                {message.text && (
                                    <div className={`p-3 rounded-lg text-center text-sm font-medium animate-pulse ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* Bouton de validation */}
                                <div className="flex justify-center w-full mt-10">
                                    <button 
                                        type="submit"
                                        className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-purple-500/20"
                                    >
                                        Mettre à jour mon profil
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
       
    );
}