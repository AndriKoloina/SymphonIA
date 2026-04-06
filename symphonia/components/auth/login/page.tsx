'use client'
import Input from "@/components/ui/Input"
import { useState, FormEvent, use } from "react"

export default function LoginForm() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try{
             await new Promise ((res) => setTimeout(res, 5000))
             console.log("connexion avec: ", formData)
        }
        catch{
           setError("Erreur de connexion")
        }
        finally{
            setIsLoading(false)
        }
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#17083] p-4">
      <div className="w-full max-w-md bg-[#1B2945] p-10 rounded-2xl shadow-xl">
        
        <form className="flex flex-col items-center">
          <img src="/symphonia-logo.png" className="w-16 h-auto mb-4" alt="Logo" />
          <span className="text-lg font-bold tracking-[0.2em] uppercase text-white/90 font-sans italic">
            Symphon<span className="text-purple-500">ia</span>
          </span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-1 opacity-50"></div>
          <div className="w-full space-y-2">
            <Input 
                label="Email" 
                type="email" 
                required 
            />
            <Input 
                label="Mot de passe"
                type="password"
                required
            />
          </div>
          <button className="mt-8 w-auto p-6 bg-[#8A2BE2] font-bold hover:bg-purple-500  text-white  py-3 rounded-lg transition-all text-xs">
            Se connecter
          </button>
        </form>

      </div>
    </div>
  )
}