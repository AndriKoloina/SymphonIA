
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className="relative mt-5">
      <input
        {...props}
        placeholder=" " 
        className="peer block w-full rounded-lg border border-gray-600 bg-transparent px-2 py-3 text-white  
        placeholder-transparent focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
        autofill:shadow-[0_0_0_30px_#1B2945_inset]"
      />
      
      <label
        className="absolute left-3 -top-3 z-10 bg-[#1B2945] px-1 text-xs font-medium text-gray-400 transition-all 
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                   peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-500 font-sans" 
      >
        {label}
      </label>
    </div>
  )
}