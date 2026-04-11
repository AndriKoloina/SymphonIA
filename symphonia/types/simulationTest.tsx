import { useState, useRef, useEffect } from 'react'

export function useMusicSimulation(allKeys: any[]) {
  const [activeNotes, setActiveNotes] = useState<any[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startSimulation = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
   
      const randomKeyIndex = Math.floor(Math.random() * allKeys.length);
      
      const newNote = {
        id: Math.random().toString(36).substr(2, 9),
        lane: randomKeyIndex,
        duration: 3, 
        color: allKeys[randomKeyIndex].isBlack ? '#A855F7' : '#6366F1',
      };


      setActiveNotes((prev) => [...prev, newNote])
      setTimeout(() => {
        setActiveNotes((prev) => prev.filter((n) => n.id !== newNote.id))
      }, 3500)
    }, 500)
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  };

  useEffect(() => {
    return () => stopSimulation()
  }, []);

  return { activeNotes, startSimulation, stopSimulation }
}