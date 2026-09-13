'use client';

import { useState } from 'react';
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";
import SideMobile from '@/components/ui/mobile/bar_options';
import ContentMain from "@/components/ui/ContentMain";
import api from '@/components/auth/api';

export default function SettingsPage() {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('symphonia_user');
            return storedUser ? JSON.parse(storedUser) : { username: '', email: '' };
        } catch {
            return { username: '', email: '' };
        }
    });
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

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
            const res = await api.put('/update-profile', 
                { 
                    username: user.username, 
                    email: user.email, 
                    new_password: passwords.new || null 
                }
            );

            if (res.data.status === "success") {
                localStorage.setItem('symphonia_user', JSON.stringify(user));
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
                setPasswords({ new: '', confirm: '' }); // Reset les champs password
            }
        } catch {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        }
    };

    return (
            <div className="flex-1 lg:flex min-h-screen">
                <div className='hidden lg:block'>
                    <SymphoniaSidebar />
                </div>
                <div className='block lg:hidden'>
                    <SideMobile/>
                </div>
                <ContentMain className="mt-[-2rem] p-6 md:p-12 flex flex-col items-center">
                     <TitlePage title="Paramètres" />
                    <div className=" w-sm lg:w-full max-w-2xl">
                        
                        <div className="mt-8 bg-[#1B2945]/80 backdrop-blur p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/30">
                            <h2 className="text-sm lg:text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                                Informations du compte
                            </h2>
                            
                            <form onSubmit={handleUpdate} className="space-y-5">
                            
                                <div>
                                    <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Nom d&apos;utilisateur</label>
                                    <input 
                                        type="text" 
                                        value={user.username}
                                        onChange={(e) => setUser({...user, username: e.target.value})}
                                        className="w-full bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3.5 text-white text-xs lg:text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Adresse Email</label>
                                    <input 
                                        type="email" 
                                        value={user.email}
                                        readOnly
                                        className="w-full font-bold bg-[#0f0a1e]/50 border border-white/10 text-xs lg:text-sm rounded-xl p-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="h-px bg-white/5 my-4"></div>

                                {/* Mot de passe */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Nouveau mot de passe</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                            className="w-full bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3.5 text-white text-xs lg:text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Confirmer</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                            className={`w-full bg-[#0f0a1e]/50 border ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white focus:outline-none transition-all text-xs lg:text-sm`}
                                        />
                                    </div>
                                </div>

                                {/* Messages d'état */}
                                {message.text && (
                                    <div role="status" className={`p-3 rounded-xl text-center text-sm font-semibold border ${message.type === 'success' ? 'bg-green-500/15 text-green-300 border-green-400/30' : 'bg-red-500/15 text-red-300 border-red-400/30'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* Bouton de validation */}
                                <div className="flex justify-center w-full lg:mt-10">
                                    <button
                                        type="submit"
                                        className="lg:w-1/2 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-purple-500/30 focus-visible:outline-2 focus-visible:outline-purple-300"
                                    >
                                        Mettre à jour mon profil
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ContentMain>
            </div>
       
    );
}