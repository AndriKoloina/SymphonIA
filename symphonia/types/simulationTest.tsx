import { useState, useRef, useEffect } from 'react'

interface NoteSequence {
  note: string
  octave: number
  delay: number     // Attente avant la note suivante (ms)
  duration: number  // Temps d'enfoncement de la touche (ms)
}

// Mélodie structurée (Thème classique en La mineur)
const PIANO_MELODY: NoteSequence[] = [
  // Phrase 1
  { note: 'E', octave: 5, delay: 250, duration: 200 },
  { note: 'D#', octave: 5, delay: 250, duration: 200 },
  { note: 'E', octave: 5, delay: 250, duration: 200 },
  { note: 'D#', octave: 5, delay: 250, duration: 200 },
  { note: 'E', octave: 5, delay: 250, duration: 200 },
  { note: 'B', octave: 4, delay: 250, duration: 200 },
  { note: 'D', octave: 5, delay: 250, duration: 200 },
  { note: 'C', octave: 5, delay: 250, duration: 200 },
  { note: 'A', octave: 4, delay: 500, duration: 400 },

  // Arpège d'accompagnement
  { note: 'C', octave: 4, delay: 250, duration: 200 },
  { note: 'E', octave: 4, delay: 250, duration: 200 },
  { note: 'A', octave: 4, delay: 250, duration: 200 },
  { note: 'B', octave: 4, delay: 500, duration: 400 },

  // Phrase 2
  { note: 'E', octave: 4, delay: 250, duration: 200 },
  { note: 'G#', octave: 4, delay: 250, duration: 200 },
  { note: 'B', octave: 4, delay: 250, duration: 200 },
  { note: 'C', octave: 5, delay: 500, duration: 400 },

  // Reprise
  { note: 'E', octave: 5, delay: 250, duration: 200 },
  { note: 'D#', octave: 5, delay: 250, duration: 200 },
  { note: 'E', octave: 5, delay: 250, duration: 200 },
  { note: 'D#', octave: 5, delay: 250, duration: 200 },
  { note: 'E', octave: 5, delay: 250, duration: 200 },
  { note: 'B', octave: 4, delay: 250, duration: 200 },
  { note: 'D', octave: 5, delay: 250, duration: 200 },
  { note: 'C', octave: 5, delay: 250, duration: 200 },
  { note: 'A', octave: 4, delay: 800, duration: 600 },
]

export function useMusicSimulation(allKeys: any[]) {
  const [fallingNotes, setFallingNotes] = useState<any[]>([])
  const [activePianoNotes, setActivePianoNotes] = useState<string[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const isPlayingRef = useRef<boolean>(false)

  const FALL_DURATION_MS = 2000 // 2 secondes de descente visuelle

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current = []
  }

  const startSimulation = () => {
    if (isPlayingRef.current || !allKeys || allKeys.length === 0) return
    isPlayingRef.current = true

    let currentTime = 0

    PIANO_MELODY.forEach((item) => {
      // Trouver la touche physique correspondante sur la grille du piano
      const keyIndex = allKeys.findIndex(
        (k) => k.note === item.note && k.octave === item.octave
      )

      if (keyIndex !== -1) {
        const selectedKey = allKeys[keyIndex]
        const whiteBefore = allKeys.slice(0, keyIndex).filter((k) => !k.isBlack).length
        const whiteKeyWidth = 22
        const blackKeyWidth = 18

        const leftPosition = selectedKey.isBlack
          ? whiteBefore * whiteKeyWidth - blackKeyWidth / 2
          : whiteBefore * whiteKeyWidth

        const noteWidth = selectedKey.isBlack ? blackKeyWidth : whiteKeyWidth
        const noteId = `${selectedKey.note}${selectedKey.octave}`
        const uniqueId = Math.random().toString(36).substring(2, 9)

        // 1. Planifier l'apparition de la note dans la cascade
        const spawnTimeout = setTimeout(() => {
          if (!isPlayingRef.current) return

          setFallingNotes((prev) => [
            ...prev,
            {
              id: uniqueId,
              noteId: noteId,
              leftPosition: leftPosition,
              width: noteWidth,
              duration: FALL_DURATION_MS / 1000,
              isBlack: selectedKey.isBlack,
            },
          ])

          // 2. Déclencher le son/l'impact visuel exact quand la note touche le piano
          const hitTimeout = setTimeout(() => {
            if (!isPlayingRef.current) return

            setActivePianoNotes((prev) => [...prev, noteId])

            // Éteindre la touche après la durée spécifiée
            const releaseTimeout = setTimeout(() => {
              setActivePianoNotes((prev) => prev.filter((id) => id !== noteId))
            }, item.duration)

            timeoutsRef.current.push(releaseTimeout)
          }, FALL_DURATION_MS)

          // 3. Supprimer la note du composant Waterfall une fois franchie
          const removeTimeout = setTimeout(() => {
            setFallingNotes((prev) => prev.filter((n) => n.id !== uniqueId))
          }, FALL_DURATION_MS + 100)

          timeoutsRef.current.push(hitTimeout, removeTimeout)
        }, currentTime)

        timeoutsRef.current.push(spawnTimeout)
      }

      currentTime += item.delay
    })
  }

  const stopSimulation = () => {
    isPlayingRef.current = false
    clearAllTimeouts()
    setFallingNotes([])
    setActivePianoNotes([])
  }

  useEffect(() => {
    return () => stopSimulation()
  }, [])

  return { fallingNotes, activePianoNotes, startSimulation, stopSimulation }
}