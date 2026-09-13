import { useState, useRef, useEffect } from 'react'
import type { FallingNoteData } from '@/hooks/pianoWaterFall'

export interface PianoKey {
  note: string
  octave: number
  isBlack: boolean
}

export function useMusicSimulation(allKeys: PianoKey[]) {
  const [fallingNotes, setFallingNotes] = useState<FallingNoteData[]>([])
  const [activePianoNotes, setActivePianoNotes] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const FALL_DURATION_MS = 2000 // La note met exactement 2 secondes à tomber

  const startSimulation = () => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      const randomKeyIndex = Math.floor(Math.random() * allKeys.length)
      const selectedKey = allKeys[randomKeyIndex]

      const whiteBefore = allKeys.slice(0, randomKeyIndex).filter(k => !k.isBlack).length
      const whiteKeyWidth = 22
      const blackKeyWidth = 18

      const leftPosition = selectedKey.isBlack
        ? (whiteBefore * whiteKeyWidth) - (blackKeyWidth / 2)
        : whiteBefore * whiteKeyWidth

      const noteWidth = selectedKey.isBlack ? blackKeyWidth : whiteKeyWidth
      const noteId = `${selectedKey.note}${selectedKey.octave}`
      const uniqueId = Math.random().toString(36).substring(2, 9)

      const newNote = {
        id: uniqueId,
        noteId: noteId,
        leftPosition: leftPosition,
        width: noteWidth,
        duration: FALL_DURATION_MS / 1000, // 2s
        isBlack: selectedKey.isBlack
      }

      // 1. Ajouter la note dans le Waterfall (elle commence à tomber)
      setFallingNotes((prev) => [...prev, newNote])

      // 2. Déclencher le son & l'impact sur le piano au moment exact où elle touche la touche
      setTimeout(() => {
        setActivePianoNotes((prev) => [...prev, noteId])

        // La touche reste enfoncée / éclairée pendant 300ms
        setTimeout(() => {
          setActivePianoNotes((prev) => prev.filter((id) => id !== noteId))
        }, 300)
      }, FALL_DURATION_MS)

      // 3. Retirer la note du Waterfall une fois tombée
      setTimeout(() => {
        setFallingNotes((prev) => prev.filter((n) => n.id !== uniqueId))
      }, FALL_DURATION_MS + 100)

    }, 600)
  }

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setFallingNotes([])
    setActivePianoNotes([])
  }

  useEffect(() => {
    return () => stopSimulation()
  }, [])

  return { fallingNotes, activePianoNotes, startSimulation, stopSimulation }
}