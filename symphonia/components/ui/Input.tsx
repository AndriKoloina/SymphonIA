
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className="relative mt-6">
  <input
    {...props}
    id={props.name || label.toLowerCase().replace(/\s+/g, '-').toLowerCase()}
    value={props.value ?? ""}
    placeholder=" " 
    className="peer block w-full rounded-lg border border-white/20 bg-transparent px-3 py-3 text-white text-xs 
               placeholder-transparent focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50
               autofill:shadow-[0_0_0_30px_#1B2945_inset] transition-all"
  />
  
  <label
    htmlFor={label}
    className="absolute left-3 -top-2.5 z-10 bg-[#1B2945] px-1 text-xs font-medium text-purple-400 transition-all 
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-500 
               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-400 font-sans pointer-events-none" 
  >
    {label}
  </label>
</div>
  )
}