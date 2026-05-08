'use client'

import Input from "@/components/ui/Input"
import { useRouter } from "next/navigation";
import { useState, FormEvent, use } from "react"
import axios from "axios"

export default function LoginForm() {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState<number>(0)
    const router=useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const Api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setProgress(0)

        try{
           console.log("Tentative de connexion pour :", formData.email)
            setProgress(25)
            const response = await axios.post(`${Api_url}/login`, {
              email : formData.email,
              password: formData.password
            })

            setProgress(75)

            if(response.data.status === "success") {
              const { token, user } = response.data

              localStorage.setItem('symphonia_token', token)
              localStorage.setItem('symphonia_user', JSON.stringify(user))

              setProgress(100)
              console.log("Connexion réussie !", user.username)

              setTimeout(() => {
                router.push('/home')
              }, 500)
            }
           
        }
        catch(err: any){
           setProgress(0)
           if(err.response && err.response.data) {
            setError(err.response?.data?.detail || "Identifiants invalides")
            } else {
            setError("Impossible de contacter le serveur")
           }
        }
        finally{
            setIsLoading(false)
        }
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#17083] p-4">
      <div className="w-full max-w-md bg-[#1B2945] p-10 rounded-2xl shadow-xl">
        
        <form
         className="flex flex-col items-center"
          
         onSubmit={(e) => {
    e.preventDefault(); // Verrou 1 : Empêche le rechargement immédiat
    handleSubmit(e);
  }}>
          <img src="/symphonia-logo.png" className="w-16 h-auto mb-4" alt="Logo" />
          <span className="text-lg font-bold tracking-[0.2em] uppercase text-white/90 font-sans italic">
            Symphon<span className="text-purple-500">ia</span>
          </span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-1 opacity-50"></div>
          <div className="w-full space-y-2">
            <Input 
                label="Email" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
            />
            <Input 
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
            />
          </div>
          <a href="/auth/signup" className="text-xs mr-40 text-white/50 mt-2 font-bold hover:text-white transition-colors">
                        Pas encore de compte ? S'inscrire
                    </a>
          <button 
              type="submit" 
              onClick={(e) => {
       
        if (isLoading) e.preventDefault(); 
    }}
              disabled={isLoading}
              className="mt-8 w-full md:w-auto min-w-[140px] h-12 bg-[#8A2BE2] font-bold hover:bg-purple-500 text-white rounded-lg transition-all text-xs flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-mono text-sm">{progress}%</span>
              </div>

              ) : (
                "Se connecter"
              )}
            </button>
        </form>

      </div>
    </div>
  )
}