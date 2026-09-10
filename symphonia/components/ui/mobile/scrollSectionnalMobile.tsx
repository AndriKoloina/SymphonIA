'use client'
import { ScrollSectionPage } from "@/types/play_interface"

export function ScrollSectionnalMobile({ title, children }: ScrollSectionPage) {

    return (
        <div className="block lg:hidden mx-auto mt-4 mb-6 w-[94%] h-[20rem] flex flex-col border border-zinc-200/50 dark:border-white/5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
  
  {/* En-tête du Titre (Fixe en haut) */}
  <div className="px-5 pt-4 pb-2 border-b border-zinc-200/20 dark:border-white/5">
    <div className="text-sm font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
      {title}
    </div>
  </div>

  {/* Zone de défilement des morceaux (Prend tout le reste de l'espace) */}
  <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
    <div className="flex flex-col gap-1.5 w-full">
      {children}
    </div>
  </div>

</div>
    )
}