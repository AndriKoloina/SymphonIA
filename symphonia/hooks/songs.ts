export interface Song {
  id: number
  title: string
  duration: string
  dateCreated: string
}

export const SONGS: Song[] = [
  { id: 1, title: "L'Envol des Murmures (Soprano)", duration: "4:12", dateCreated: "2024-06-10" },
  { id: 2, title: "Résonance de l'Âme (Alto)", duration: "3:25", dateCreated: "2024-06-12" },
  { id: 3, title: "Chœur des Ombres - Acte I", duration: "5:40", dateCreated: "2024-06-14" },
  { id: 4, title: "Éclat de Ténor (Solo)", duration: "2:55", dateCreated: "2024-06-15" },
  { id: 5, title: "Vocalise en Ré Mineur", duration: "1:50", dateCreated: "2024-06-16" },
  { id: 6, title: "Sérénade au Clair de Lune", duration: "3:15", dateCreated: "2024-06-18" },
  { id: 7, title: "L'Aube Grise (Baryton)", duration: "4:05", dateCreated: "2024-06-20" },
  { id: 8, title: "Hymne à la Lumière", duration: "6:20", dateCreated: "2024-06-21" },
  { id: 9, title: "Souffle d'Hiver (Choral)", duration: "3:30", dateCreated: "2024-06-22" },
  { id: 10, title: "Cantique de la Mer", duration: "4:45", dateCreated: "2024-06-23" },
  { id: 11, title: "L'Écho des Montagnes", duration: "2:10", dateCreated: "2024-06-25" },
  { id: 12, title: "Ballade de l'Oubli", duration: "3:55", dateCreated: "2024-06-26" },
  { id: 13, title: "Requiem Imaginaire", duration: "7:12", dateCreated: "2024-06-27" },
  { id: 14, title: "Aria pour Cœur Brisé", duration: "3:20", dateCreated: "2024-06-28" },
  { id: 15, title: "Chant du Crépuscule", duration: "4:00", dateCreated: "2024-06-29" },
  { id: 16, title: "Alléluia Éphémère", duration: "2:45", dateCreated: "2024-06-30" },
]

const FAVORITES_KEY = "symphonia_favorites"

export function loadFavoriteIds(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : []
  } catch {
    return []
  }
}

export function saveFavoriteIds(ids: number[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  } catch {
    // stockage indisponible : l'état en mémoire reste valide
  }
}
