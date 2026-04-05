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
          <h2 className="text-3xl font-bold  text-white mb-8">SymphonIA</h2>
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
          <button className="mt-8 w-auto p-6 bg-[#8A2BE2] hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all">
            Se connecter
          </button>
        </form>

      </div>
    </div>
  )
}