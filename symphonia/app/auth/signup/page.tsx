'use client';

import Input from "@/components/ui/Input"
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react"

export default function SignupForm() {
    // Mise à jour de l'état pour inclure tous les champs
    const [formData, setFormData] = useState({ 
        email: '', 
        username: '', 
        password: '', 
        confirmPassword: '' 
    });
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Gestion universelle des changements d'input
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Logique de validation des mots de passe
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setIsLoading(false);
            return;
        }

        try {
            // Simulation de création de compte
            await new Promise((res) => setTimeout(res, 1000))
            console.log("Compte créé pour :", formData.username)
            router.push("/home")
        } catch {
            setError("Erreur lors de la création du compte")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#17083] p-4">
            <div className="w-full max-w-md bg-[#1B2945] p-10 rounded-2xl shadow-2xl border border-white/5">
                
                <form className="flex flex-col items-center" onSubmit={handleSubmit}>
                    <img src="/symphonia-logo.png" className="w-16 h-auto mb-4" alt="Logo Symphonia" />
                    <span className="text-lg font-bold tracking-[0.2em] uppercase text-white/90 font-sans italic">
                        Symphon<span className="text-purple-500">ia</span>
                    </span>
                    <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-1 mb-6 opacity-50"></div>

                    {error && (
                        <div className="w-full p-3 mb-4 text-xs text-center text-red-400 bg-red-400/10 rounded-lg border border-red-400/20">
                            {error}
                        </div>
                    )}

                    <div className="w-full space-y-4">
                        <Input 
                            label="Email" 
                            name="email"
                            type="email" 
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                        <Input 
                            label="Pseudo" 
                            name="username"
                            type="text" 
                            value={formData.username}
                            onChange={handleChange}
                            required 
                        />
                        <Input 
                            label="Mot de passe"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <Input 
                            label="Réécrire le mot de passe"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`mt-8 w-full md:w-auto px-8 py-3 bg-[#8A2BE2] font-bold text-white rounded-lg transition-all text-xs uppercase tracking-widest hover:bg-purple-500 shadow-lg shadow-purple-500/20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? "Création..." : "Créer mon compte"}
                    </button>

                    <a href="/auth/login" className="mt-4 text-xs fond-bold text-zinc-400 hover:text-white transition-colors">
                        Déjà un compte ? Se connecter
                    </a>
                </form>
            </div>
        </div>
    )
}