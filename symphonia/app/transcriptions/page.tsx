'use client'

import { useMemo, useState } from "react"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SideMobile from "@/components/ui/mobile/bar_options"
import ContentMain from "@/components/ui/ContentMain"
import { DocumentMagnifyingGlassIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

type ScanStatus = "termine" | "encours" | "echec"

interface Transcription {
  id: string
  title: string
  instrument: string
  date: string
  duration: string
  notes: number
  status: ScanStatus
}

const STORAGE_KEY = "symphonia_transcriptions"

const STATUS_LABEL: Record<ScanStatus, string> = {
  termine: "Terminé",
  encours: "En cours",
  echec: "Échec",
}

const STATUS_STYLE: Record<ScanStatus, string> = {
  termine: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  encours: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  echec: "bg-red-500/15 text-red-300 border-red-400/30",
}

function loadTranscriptions(): Transcription[] {
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

export default function TranscriptionsPage() {
  const [initial] = useState<Transcription[]>(() => loadTranscriptions())
  const [items, setItems] = useState<Transcription[]>(initial)
  const [filter, setFilter] = useState<"toutes" | ScanStatus>("toutes")
  const [search, setSearch] = useState("")
  const [title, setTitle] = useState("")
  const [instrument, setInstrument] = useState("Piano")
  const [error, setError] = useState<string | null>(null)

  const persist = (next: Transcription[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // stockage indisponible : l'état en mémoire reste valide
    }
  }

  const filtered = useMemo(() => {
    return items.filter((t) => {
      const matchStatus = filter === "toutes" || t.status === filter
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [items, filter, search])

  const stats = useMemo(() => {
    return {
      total: items.length,
      termine: items.filter((t) => t.status === "termine").length,
      notes: items.reduce((sum, t) => sum + t.notes, 0),
    }
  }, [items])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const name = title.trim()
    if (!name) {
      setError("Donnez un titre au scan.")
      return
    }
    setError(null)
    const entry: Transcription = {
      id: `scan-${Date.now()}`,
      title: name,
      instrument,
      date: new Date().toLocaleDateString("fr-FR"),
      duration: "--:--",
      notes: 0,
      status: "encours",
    }
    persist([entry, ...items])
    setTitle("")
  }

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette transcription ?")) return
    persist(items.filter((t) => t.id !== id))
  }

  const handleStatus = (id: string, status: ScanStatus) => {
    persist(items.map((t) => (t.id === id ? { ...t, status } : t)))
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
        <TitlePage title="Transcriptions" />
        <h1 className="text-xs lg:text-lg font-black text-white tracking-tight leading-tight mb-2 lg:mb-4 break-words">
          Historique des scans
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          {stats.total} scan{stats.total > 1 ? "s" : ""} · {stats.termine} terminé{stats.termine > 1 ? "s" : ""} · {stats.notes} notes transcrites.
        </p>

        {/* Formulaire d'ajout */}
        <form
          onSubmit={handleAdd}
          className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 mb-4"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Nouveau scan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du morceau scanné..."
              className="bg-[#0f0a1e]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 outline-none transition-all"
            />
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="bg-[#0f0a1e]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-purple-400 outline-none transition-all"
            >
              <option value="Piano">Piano</option>
              <option value="Guitare">Guitare</option>
              <option value="Violon">Violon</option>
              <option value="Flûte">Flûte</option>
              <option value="Saxophone">Saxophone</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm font-bold hover:from-purple-500 hover:to-indigo-400 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 p-3 rounded-xl text-center text-sm font-semibold bg-red-500/15 text-red-300 border border-red-400/30">
              {error}
            </p>
          )}
        </form>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un scan..."
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-purple-400 outline-none transition-all"
          />
          <div className="flex gap-2">
            {(["toutes", "termine", "encours", "echec"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  filter === s
                    ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white border-transparent shadow-lg shadow-purple-500/30"
                    : "bg-white/5 text-slate-200 border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                {s === "toutes" ? "Toutes" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white/[0.06] border border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <DocumentMagnifyingGlassIcon className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-sm text-slate-300">Aucune transcription pour ce filtre.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filtered.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    <DocumentMagnifyingGlassIcon className="w-5 h-5 text-purple-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {t.instrument} · {t.date} · {t.notes} notes · {t.duration}
                    </p>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatus(t.id, e.target.value as ScanStatus)}
                    title="Changer le statut"
                    className={`text-xs font-semibold rounded-lg px-2 py-1.5 border outline-none cursor-pointer shrink-0 ${STATUS_STYLE[t.status]}`}
                  >
                    <option value="termine">Terminé</option>
                    <option value="encours">En cours</option>
                    <option value="echec">Échec</option>
                  </select>
                  <button
                    onClick={() => handleDelete(t.id)}
                    title={`Supprimer ${t.title}`}
                    className="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors shrink-0"
                  >
                    <TrashIcon className="w-4 h-4 text-red-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ContentMain>
    </div>
  )
}
