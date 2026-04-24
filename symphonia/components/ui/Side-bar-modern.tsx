'use client'
import { useState } from 'react'
import { OptionsMenu } from '@/hooks/menu';
import Link from 'next/link';

export default function SymphoniaSidebar() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(1)

  const menuItems = OptionsMenu

  return (
    <aside className="flex flex-col w-64 xl:w-75 h-[98vh] m-2 bg-[#1B2945] rounded-[1rem] pr-4 pl-0 py-4 border border-white/5 shadow-2xl font-sans overflow-hidden absolute"> 
      
   
      <div className="flex flex-col items-center justify-center w-full mb-6 mt-2">
          <div className="relative w-12 h-12 mb-2">
            <img src="/symphonia-logo.png" className="w-full h-full object-contain" alt="Symphonia Logo" />
          </div>
          <span className="text-md font-bold tracking-[0.2em] uppercase text-white/90 italic">
            Symphon<span className="text-purple-500">ia</span>
          </span>
      </div>
      
      <div className="flex flex-1 items-center overflow-hidden gap-4 xl:gap-4">
        
      
        <div 
          className="relative w-20 h-[80%] shadow-xl overflow-hidden shrink-0"
          style={{ clipPath: 'polygon(0% 0%, 100% 10%, 100% 90%, 0% 100%)' }}
        >
          <div className="absolute inset-0 bg-[var(--color-side-bar-1)] flex flex-col justify-center  items-center pl-4">
            <div className="flex flex-col justify-center  gap-4 xl:gap-4 w-full">
              {menuItems.map((item) => { 
                const isHighlighted = hoveredId === item.id || activeId === item.id;
                const Icon = item.icon; 
                return ( 
                  <div key={item.id} className="flex justify-center transition-transform duration-300 ml-4 xl:ml-8 ">
                    <Icon className={`w-5 h-5 xl:w-6 xl:h-6  transition-all duration-300 ${isHighlighted ? 'scale-125 text-white bg-[var(--color-button)]/50 rounded-tl-sm rounded-bl-sm p-1' : 'text-black'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

       
        <div 
          className="relative flex-1 h-[80%] shadow-xl overflow-hidden"
          style={{ clipPath: 'polygon(0% 10%, 100% 0%, 100% 100%, 0% 90%)' }}
        >
          <div className="absolute inset-0 bg-[var(--color-side-bar-2)] rounded-3xl p-6 ml-[-1rem] xl:ml-[-1.5rem]">
            <div className="flex flex-col justify-center h-full ml-[-0.5rem] gap-2 xl:gap-2"> 
              {menuItems.map((item) => {
                const isHighlighted = hoveredId === item.id || activeId === item.id;
                return (
                  <Link href={item.path} key={item.id} className='block'>
                    <li
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setActiveId(item.id)} 
                      className={`cursor-pointer py-2 px-4 rounded-tr-sm rounded-br-sm transition-all duration-300 font-medium text-xs tracking-wider 
                        ${isHighlighted ? 'bg-[var(--color-button)]/50 text-white translate-x-1 font-bold' : 'text-white/80 font-bold'}`}
                    >
                      {item.label} 
                    </li>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-auto border-t border-white/10 pt-4 space-y-3">
        <button className="flex items-center text-gray-400 hover:text-white transition-colors group w-full">
            <img src="/parametre.png" className='w-4 mr-3 transition-transform duration-500 group-hover:rotate-60' alt="settings" />
            <span className="text-xs font-medium">Paramètres</span>
        </button>
        <button className="flex items-center text-red-400/80 hover:text-red-400 transition-colors group w-full">
            <img src="/deconnexion.png" className='w-4 mr-3' alt="logout" />
            <span className="text-xs font-semibold">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}