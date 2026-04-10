'use client'
import { useState } from 'react'
import { OptionsMenu } from '@/hooks/menu';
import Link from 'next/link';

export default function SymphoniaSidebar() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(1)

  const menuItems = OptionsMenu
  return (
    <aside className="flex flex-col w-75 h-[98vh] m-2  bg-[#1B2945] rounded-[1rem] pr-4 pl-0 py-4 border border-white/5 shadow-2xl font-sans overflow-hidden absolute"> 
      <div className="flex flex-col items-center justify-center w-full mb-8 mt-2">
          <div className="relative w-14 h-14 mb-2">
            <img 
              src="/symphonia-logo.png" 
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
              alt="Symphonia Logo"
            />
          </div>
          <span className="text-lg font-bold tracking-[0.2em] uppercase text-white/90 font-sans italic">
            Symphon<span className="text-purple-500">ia</span>
          </span>

          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-1 opacity-50"></div>
        </div>
      
      <div className="flex flex-1 gap-3 mb-6 items-center">
        
        <div 
          className="relative w-22 h-3/4 shadow-xl overflow-hidden"
          style={{ clipPath: 'polygon(0% 0%, 100% 10%, 100% 90%, 0% 100%)' }}
        >
          <div className="absolute inset-0 bg-[var(--color-side-bar-1)] flex flex-col items-center py-16 pl-6">
            <div className="flex flex-col items-center space-y-[0.9rem] w-full relative z-10">
              {menuItems.map((item) => { 
                const isHighlighted = hoveredId === item.id || activeId === item.id;
                
                return ( 
                  <div
                    key={item.id}
                    className="w-6 h-[1.9rem] flex items-center justify-center transition-transform duration-300 ml-8"
                  >
                          <img 
                src={item.icon} 
                alt={item.label} 
                className={`w-full h-full object-contain transition-all duration-300
                  ${isHighlighted ? 'scale-120 bg-[var(--color-button)]/50 rounded-tl-[0.5rem] rounded-bl-[0.5rem] p-1' : 'scale-100'}`} 
                 />
              </div>
           );
              })}
          </div>
          </div>
        </div>
        <div 
          className="relative flex-1 h-3/4 shadow-xl overflow-hidden"
          style={{ clipPath: 'polygon(0% 10%, 100% 0%, 100% 100%, 0% 90%)' }}
        >
          <div className="absolute inset-0 bg-[var(--color-side-bar-2)] rounded-3xl p-8 ml-[-2.1rem]">
            <div className="relative z-10 flex flex-col w-full h-full justify-center h-8"> 
              <ul className="space-y-[0.8rem]">
                {menuItems.map((item) => {
                  const isHighlighted = hoveredId === item.id || activeId === item.id;
                  
                  return (
                    <Link href={item.path} key={item.id} className='block'>
                      <li
                      key={item.id}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setActiveId(item.id)} 
                      className={`cursor-pointer py-2 px-3 rounded-tr-xl rounded-br-xl transition-all duration-300 font-medium text-xs tracking-wider 
                        ${isHighlighted 
                          ? 'bg-[var(--color-button)]/50 text-white translate-x-1 font-bold' 
                          : 'text-white/80 font-bold'}`}
                    >
                      {item.label} 
                    </li>
                    </Link>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-auto border-t border-white/10 pt-6 space-y-4">
        <button className="flex items-center text-gray-400 hover:text-white transition-colors group">
          <span className="mr-3 group-hover:rotate-45 transition-transform text-lg">
            <img src="/parametre.png" className='w-5' />
          </span>
          <span className="text-xs font-medium hover:text-sm transition-all duration-300">Paramètres</span>
        </button>
        <button className="flex items-center text-red-400/80 hover:text-red-400 transition-colors group">
          <span className="mr-3 text-lg group-hover:-translate-x-1 transition-transform">
            <img src="/deconnexion.png" className='w-5 ' />
          </span>
          <span className="text-xs font-semibold">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}