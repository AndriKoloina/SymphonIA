'use client'

import { useMemo, useState } from "react"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SideMobile from "@/components/ui/mobile/bar_options"
import ContentMain from "@/components/ui/ContentMain"
import { SONGS, loadFavoriteIds, saveFavoriteIds } from "@/hooks/songs"
import { HeartIcon, MusicalNoteIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"

export default function FavoritesPage() {
  const [initialIds] = useState<number[]>(() => loadFavoriteIds())
  const [favoriteIds, setFavoriteIds] = useState<number[]>(initialIds)
  const [search, setSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      saveFavoriteIds(next)
      return next
    })
  }

  const favorites = useMemo(() => SONGS.filter((s) => favoriteIds.includes(s.id)), [favoriteIds])

  const visibleSongs = useMemo(() => {
    const base = showAll ? SONGS : favorites
    const q = search.toLowerCase()
    if (!q) return base
    return base.filter((s) => s.title.toLowerCase().includes(q))
  }, [showAll, favorites, search])

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <div className="hidden lg:block">
        <SymphoniaSidebar />
      </div>
      <div className="block lg:hidden">
        <SideMobile />
      </div>
      <ContentMain className="mt-4 px-4 sm:px-6 lg:px-8 pb-10">
        <TitlePage title="Favoris" />
        <h1 className="text-xs lg:text-lg font-black text-white tracking-tight leading-tight mb-2 lg:mb-4 break-words">
          Mes morceaux aimés
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          {favorites.length} favori{favorites.length > 1 ? "s" : ""} sur {SONGS.length} morceaux.
        </p>

        {/* Recherche + bascule */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un morceau..."
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-purple-400 outline-none transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAll(false)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                !showAll
                  ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white border-transparent shadow-lg shadow-purple-500/30"
                  : "bg-white/5 text-slate-200 border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              Favoris ({favorites.length})
            </button>
            <button
              onClick={() => setShowAll(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                showAll
                  ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white border-transparent shadow-lg shadow-purple-500/30"
                  : "bg-white/5 text-slate-200 border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              Catalogue ({SONGS.length})
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white/[0.06] border border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
          {visibleSongs.length === 0 ? (
            <div className="py-10 text-center px-4">
              {showAll ? (
                <p className="text-sm text-slate-300">Aucun morceau ne correspond à la recherche.</p>
              ) : (
                <>
                  <HeartIcon className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-300">
                    Aucun favori pour le moment. Basculez sur le catalogue pour aimer des morceaux.
                  </p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {visibleSongs.map((song, index) => {
                const isFav = favoriteIds.includes(song.id)
                return (
                  <li key={song.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors">
                    <span className="text-xs font-mono text-slate-500 w-6 shrink-0">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      <MusicalNoteIcon className="w-5 h-5 text-purple-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                      <p className="text-xs text-slate-400">
                        {song.dateCreated} · <span className="font-mono">{song.duration}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(song.id)}
                      title={isFav ? `Retirer ${song.title} des favoris` : `Ajouter ${song.title} aux favoris`}
                      aria-pressed={isFav}
                      className="p-2 rounded-xl hover:bg-pink-500/15 transition-colors shrink-0"
                    >
                      {isFav ? (
                        <HeartSolidIcon className="w-5 h-5 text-pink-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-slate-400 hover:text-pink-400 transition-colors" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </ContentMain>
    </div>
  )
}
