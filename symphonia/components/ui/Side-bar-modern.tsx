'use client'
import { OptionsMenu } from '@/hooks/menu';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import api from '@/components/auth/api';
import { useSidebar } from '@/components/ui/SidebarContext';

export default function SymphoniaSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, toggle } = useSidebar()

  const menuItems = OptionsMenu

const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error("Erreur backend logout:", error)
    } finally {
      localStorage.removeItem('symphonia_token')
      localStorage.removeItem('symphonia_user')
      router.push('/auth/login')
    }
  }

const handleParameters = () => {
    router.push('/parameter')
}

  return (
    <aside className={`flex flex-col h-[98vh] m-2 bg-[#1B2945] rounded-[1rem] py-4 border border-white/5 shadow-2xl font-sans absolute transition-all duration-300 ${collapsed ? 'w-20' : 'w-64 xl:w-75'}`}>
      {/* Bouton replier / déplier */}
      <button
        onClick={toggle}
        title={collapsed ? "Déplier le menu" : "Replier le menu"}
        aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-8 z-50 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/40 hover:scale-110 active:scale-95 transition-transform"
      >
        {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
      </button>


      <div className="flex flex-col items-center justify-center w-full mb-6 mt-2">
          <div className="relative w-12 h-12 mb-2">
            <img src="/symphonia-logo.png" className="w-full h-full object-contain" alt="Symphonia Logo" />
          </div>
          {!collapsed && (
            <>
              <span className="text-md font-bold tracking-[0.2em] uppercase text-white/90 italic">
                Symphon<span className="text-purple-500">ia</span>
              </span>
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-1 opacity-50"></div>
            </>
          )}
      </div>

      <nav className={`flex-1 min-h-0 mx-3 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl flex flex-col justify-center gap-1 p-2 overflow-y-auto scrollbar-hide ${collapsed ? 'items-center' : ''}`}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.path}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 shrink-0 ${collapsed ? 'justify-center w-full' : 'w-full'} ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
              {!collapsed && (
                <span className="text-xs font-semibold tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`mt-auto border-t border-white/10 pt-3 space-y-3 ${collapsed ? 'px-0 flex flex-col items-center' : 'px-5'}`}>
        <button className={`flex items-center text-slate-200 hover:text-white transition-colors group ${collapsed ? 'justify-center w-full' : 'w-full'}`}
          onClick={handleParameters}
          title="Paramètres"
        >
            <img src="/parametre.png" className={`w-4 transition-transform duration-500 group-hover:rotate-60 brightness-0 invert opacity-90 ${collapsed ? '' : 'mr-3'}`} alt="settings" />
            {!collapsed && <span className="text-xs font-medium">Paramètres</span>}
        </button>
        <button className={`flex items-center text-red-300 hover:text-red-200 transition-colors group ${collapsed ? 'justify-center w-full' : 'w-full'}`}
          onClick={handleLogout}
          title="Déconnexion"
        >
            <img src="/deconnexion.png" className={`w-4 brightness-0 invert opacity-90 ${collapsed ? '' : 'mr-3'}`} alt="logout" />
            {!collapsed && <a href="/auth"><span className="text-xs font-semibold">Déconnexion</span></a>}
        </button>
      </div>
      {!collapsed && (
        <div className="flex items-center px-5 mt-3 border-t border-white/10 pt-5">
          <img
            src="/download 1.png"
            alt="ISPM"
            className="w-10 h-auto opacity-90 hover:opacity-100 transition-opacity"
          />
          <div className="ml-3 flex flex-col">
            <p className="text-[10px] font-medium text-slate-300 leading-tight">
              Institut Supérieur Polytechnique de Madagascar
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
