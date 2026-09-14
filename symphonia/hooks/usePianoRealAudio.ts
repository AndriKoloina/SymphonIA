'use client'

import { useEffect, useRef, useState } from 'react'

const SOUND_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

const SAMPLE_MAP: Record<string, string> = {
  A0: 'A0.mp3', 
  C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', A1: 'A1.mp3',
  C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', A2: 'A2.mp3',
  C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', A3: 'A3.mp3',
  C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', A4: 'A4.mp3',
  C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', A5: 'A5.mp3',
  C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', A6: 'A6.mp3',
  C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', A7: 'A7.mp3', // <-- D#7 et F#7 ajoutés ici
  C8: 'C8.mp3'
}

const NOTE_OFFSETS: Record<string, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
}

export function formatNoteId(noteInput: any): string {
  if (typeof noteInput === 'string') return noteInput
  if (noteInput && typeof noteInput === 'object') {
    return `${noteInput.note}${noteInput.octave}`
  }
  return ''
}

function noteToMidi(noteId: string): number {
  const match = noteId.match(/^([A-G]#?)(\d+)$/)
  if (!match) return 60
  const [, note, octaveStr] = match
  return (parseInt(octaveStr, 10) + 1) * 12 + (NOTE_OFFSETS[note] ?? 0)
}

export function usePianoRealAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<Map<string, { buffer: AudioBuffer; midi: number }>>(new Map())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx

    const loadSamples = async () => {
      const entries = Object.entries(SAMPLE_MAP)
      await Promise.all(
        entries.map(async ([note, fileName]) => {
          try {
            const response = await fetch(`${SOUND_BASE_URL}${fileName}`)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
            audioBuffersRef.current.set(note, {
              buffer: audioBuffer,
              midi: noteToMidi(note)
            })
          } catch (err) {
            console.error(`Erreur audio ${note}:`, err)
          }
        })
      )
      setIsReady(true)
    }

    loadSamples()
    return () => { ctx.close() }
  }, [])

  const playNote = (rawNote: any) => {
    const noteId = formatNoteId(rawNote)
    if (!noteId || !audioCtxRef.current || audioBuffersRef.current.size === 0) return

    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const targetMidi = noteToMidi(noteId)
    let closestSample: { buffer: AudioBuffer; midi: number } | null = null
    let minDiff = Infinity

    audioBuffersRef.current.forEach((sample) => {
      const diff = Math.abs(sample.midi - targetMidi)
      if (diff < minDiff) {
        minDiff = diff
        closestSample = sample
      }
    })

    if (closestSample) {
      const { buffer, midi } = closestSample
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.playbackRate.value = Math.pow(2, (targetMidi - midi) / 12)
      source.connect(ctx.destination)
      source.start(0)
    }
  }

  return { playNote, isReady }
}