'use client'

import { useEffect, useMemo, useState } from "react"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SideMobile from "@/components/ui/mobile/bar_options"
import ContentMain from "@/components/ui/ContentMain"
import { MusicalNoteIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

interface Track {
  id: string
  title: string
  duration: string
}

interface Playlist {
  id: string
  name: string
  createdAt: string
  tracks: Track[]
}

const STORAGE_KEY = "symphonia_playlists"

function loadPlaylists(): Playlist[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseDuration(dur: string): number {
  const parts = dur.split(":")
  if (parts.length !== 2) return 0
  const min = Number(parts[0]) || 0
  const sec = Number(parts[1]) || 0
  return min * 60 + sec
}

function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, "0")}`
}

export default function PlaylistsPage() {
  const [initialPlaylists] = useState<Playlist[]>(() => loadPlaylists())
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists)
  const [activeId, setActiveId] = useState<string | null>(initialPlaylists[0]?.id ?? null)
  const [newName, setNewName] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newDuration, setNewDuration] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
    } catch {
      // stockage plein ou indisponible : on ignore, l'état en mémoire reste valide
    }
  }, [playlists])

  const active = useMemo(
    () => playlists.find((p) => p.id === activeId) ?? null,
    [playlists, activeId]
  )

  const totalDuration = useMemo(() => {
    if (!active) return "0:00"
    return formatDuration(active.tracks.reduce((sum, t) => sum + parseDuration(t.duration), 0))
  }, [active])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) {
      setError("Donnez un nom à la playlist.")
      return
    }
    setError(null)
    const playlist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      tracks: [],
    }
    setPlaylists((prev) => [...prev, playlist])
    setActiveId(playlist.id)
    setNewName("")
  }

  const handleDeletePlaylist = (id: string) => {
    if (!confirm("Supprimer cette playlist ?")) return
    setPlaylists((prev) => {
      const rest = prev.filter((p) => p.id !== id)
      if (activeId === id) setActiveId(rest.length > 0 ? rest[0].id : null)
      return rest
    })
  }

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!active) {
      setError("Créez d'abord une playlist.")
      return
    }
    const title = newTitle.trim()
    const duration = newDuration.trim()
    if (!title || !duration) {
      setError("Titre et durée sont requis (ex. 3:45).")
      return
    }
    if (!/^\d+:\d{2}$/.test(duration)) {
      setError("Format de durée invalide, utilisez m:ss (ex. 3:45).")
      return
    }
    setError(null)
    const track: Track = { id: `tr-${Date.now()}`, title, duration }
    setPlaylists((prev) =>
      prev.map((p) => (p.id === active.id ? { ...p, tracks: [...p.tracks, track] } : p))
    )
    setNewTitle("")
    setNewDuration("")
  }

  const handleRemoveTrack = (trackId: string) => {
    if (!active) return
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === active.id ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p
      )
    )
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <div className="hidden lg:block">
        <SymphoniaSidebar />
      </div>
      <div className="block lg:hidden">
        <SideMobile />
      </div>
      <ContentMain className="mt-4 px-4 sm:px-6 lg:px-8 pb-10">
        <TitlePage title="Playlists" />
        <h1 className="text-xs lg:text-lg font-black text-white tracking-tight leading-tight mb-2 lg:mb-4 break-words">
          Mes playlists
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          {playlists.length} playlist{playlists.length > 1 ? "s" : ""} sauvegardée{playlists.length > 1 ? "s" : ""} sur cet appareil.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Liste des playlists */}
          <section className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 h-fit">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Playlists</h2>
            <form onSubmit={handleCreate} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nouvelle playlist..."
                className="flex-1 min-w-0 bg-[#0f0a1e]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 outline-none transition-all"
              />
              <button
                type="submit"
                title="Créer la playlist"
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-400 transition-all shadow-lg shadow-purple-500/30"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </form>
            {playlists.length === 0 && (
              <p className="text-sm text-slate-400">Aucune playlist pour le moment.</p>
            )}
            <ul className="space-y-2">
              {playlists.map((p) => (
                <li key={p.id}>
                  <div
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border transition-all ${
                      p.id === activeId
                        ? "bg-gradient-to-r from-purple-600/30 to-indigo-500/20 border-purple-400/40 text-white"
                        : "bg-white/[0.03] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    <button
                      onClick={() => setActiveId(p.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <span className="block text-sm font-semibold truncate">{p.name}</span>
                      <span className="block text-xs text-slate-400">
                        {p.tracks.length} morceau{p.tracks.length > 1 ? "x" : ""} · {p.createdAt}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(p.id)}
                      title={`Supprimer ${p.name}`}
                      className="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors shrink-0"
                    >
                      <TrashIcon className="w-4 h-4 text-red-300" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Contenu de la playlist active */}
          <section className="lg:col-span-2 bg-white/[0.06] border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20">
            {!active ? (
              <div className="py-10 text-center">
                <MusicalNoteIcon className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-300">Sélectionnez ou créez une playlist pour ajouter des morceaux.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <h2 className="text-lg font-black text-white truncate">{active.name}</h2>
                  <span className="text-xs font-mono text-slate-300">
                    {active.tracks.length} morceaux · {totalDuration}
                  </span>
                </div>

                <form onSubmit={handleAddTrack} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2 mb-4">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Titre du morceau..."
                    className="bg-[#0f0a1e]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 outline-none transition-all"
                  />
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="3:45"
                    className="bg-[#0f0a1e]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 outline-none transition-all font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm font-bold hover:from-purple-500 hover:to-indigo-400 transition-all shadow-lg shadow-purple-500/30"
                  >
                    Ajouter
                  </button>
                </form>

                {error && (
                  <p role="alert" className="mb-4 p-3 rounded-xl text-center text-sm font-semibold bg-red-500/15 text-red-300 border border-red-400/30">
                    {error}
                  </p>
                )}

                {active.tracks.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Cette playlist est vide.</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {active.tracks.map((t, index) => (
                      <li key={t.id} className="flex items-center gap-3 py-3">
                        <span className="text-xs font-mono text-slate-500 w-6 shrink-0">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-white/10 flex items-center justify-center shrink-0">
                          <MusicalNoteIcon className="w-4 h-4 text-purple-200" />
                        </div>
                        <span className="flex-1 min-w-0 text-sm font-medium text-white truncate">{t.title}</span>
                        <span className="text-xs font-mono text-slate-300 shrink-0">{t.duration}</span>
                        <button
                          onClick={() => handleRemoveTrack(t.id)}
                          title={`Retirer ${t.title}`}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors shrink-0"
                        >
                          <TrashIcon className="w-4 h-4 text-red-300" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      </ContentMain>
    </div>
  )
}
