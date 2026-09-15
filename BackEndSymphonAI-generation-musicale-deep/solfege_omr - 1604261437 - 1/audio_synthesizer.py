# audio_synthesizer.py
# ============================================================
# Synthèse sonore avec timbre piano
# Utilise : numpy, wave (stdlib), sounddevice
# ============================================================

import numpy as np
import wave
import struct
import sounddevice as sd
from music_model import Note, Silence, Partition

# ----------------------------
# PARAMÈTRES AUDIO
# ----------------------------
SAMPLE_RATE = 44100   # Hz — qualité CD standard
AMPLITUDE   = 0.6     # Volume global (0.0 à 1.0)


def generer_son_piano(frequence: float, duree: float) -> np.ndarray:
    """
    Génère un son avec timbre piano pour une note donnée.

    3 ingrédients :
    1. Harmoniques  → superposition de sinusoïdes (fondamentale + octave + quinte)
    2. Enveloppe    → ADSR (Attaque, Déclin, Sustain, Relâche)
    3. Amplitude    → volume normalisé

    Arguments:
        frequence : fréquence en Hz (ex: 440.0 pour La4)
        duree     : durée en secondes

    Retourne: tableau numpy de samples audio (float32)
    """
    t = np.linspace(0, duree, int(SAMPLE_RATE * duree), endpoint=False)

    # --------------------------------------------------
    # ÉTAPE 1 : Harmoniques (ce qui rend le son "piano")
    # --------------------------------------------------
    # Fondamentale          : fréquence × 1  (poids 1.00) — la note elle-même
    # 2ème harmonique       : fréquence × 2  (poids 0.50) — octave
    # 3ème harmonique       : fréquence × 3  (poids 0.25) — quinte à l'octave
    # 4ème harmonique       : fréquence × 4  (poids 0.12) — double octave
    # 5ème harmonique       : fréquence × 5  (poids 0.06) — tierce à la double octave

    son = (
        1.00 * np.sin(2 * np.pi * frequence * 1 * t) +
        0.50 * np.sin(2 * np.pi * frequence * 2 * t) +
        0.25 * np.sin(2 * np.pi * frequence * 3 * t) +
        0.12 * np.sin(2 * np.pi * frequence * 4 * t) +
        0.06 * np.sin(2 * np.pi * frequence * 5 * t)
    )

    # --------------------------------------------------
    # ÉTAPE 2 : Enveloppe ADSR
    # --------------------------------------------------
    n_samples = len(t)

    # Durées de chaque phase (en proportion de la durée totale)
    # Attaque  : 2%  → le marteau frappe, montée rapide
    # Déclin   : 8%  → la corde stabilise, légère descente
    # Sustain  : 80% → touche maintenue, niveau stable à 70%
    # Relâche  : 10% → touche relâchée, extinction progressive

    n_attaque  = int(0.02 * n_samples)
    n_declin   = int(0.08 * n_samples)
    n_sustain  = int(0.80 * n_samples)
    n_relache  = n_samples - n_attaque - n_declin - n_sustain

    niveau_sustain = 0.7  # 70% du volume max pendant le sustain

    enveloppe = np.concatenate([
        np.linspace(0.0, 1.0, n_attaque),                          # Attaque
        np.linspace(1.0, niveau_sustain, n_declin),                # Déclin
        np.full(n_sustain, niveau_sustain),                        # Sustain
        np.linspace(niveau_sustain, 0.0, max(n_relache, 1))       # Relâche
    ])

    # Appliquer l'enveloppe au son
    son = son * enveloppe

    # --------------------------------------------------
    # ÉTAPE 3 : Normalisation
    # --------------------------------------------------
    son = son * AMPLITUDE / np.max(np.abs(son) + 1e-9)

    return son.astype(np.float32)


def generer_silence(duree: float) -> np.ndarray:
    """Génère un tableau de zéros (silence)."""
    return np.zeros(int(SAMPLE_RATE * duree), dtype=np.float32)


def partition_vers_audio(partition: Partition) -> np.ndarray:
    """
    Convertit une partition complète en tableau audio.
    Parcourt toutes les notes et les concatène.
    """
    segments = []
    for element in partition.toutes_les_notes():
        if isinstance(element, Note):
            segment = generer_son_piano(element.frequence, element.duree)
        else:  # Silence
            segment = generer_silence(element.duree)
        segments.append(segment)

    if not segments:
        return np.array([], dtype=np.float32)

    return np.concatenate(segments)


def jouer_audio(audio: np.ndarray):
    """Joue le tableau audio directement via sounddevice."""
    print("▶ Lecture en cours...")
    sd.play(audio, samplerate=SAMPLE_RATE)
    sd.wait()  # Attendre la fin de la lecture
    print("■ Lecture terminée.")


def sauvegarder_wav(audio: np.ndarray, chemin: str):
    """
    Sauvegarde le tableau audio en fichier .wav
    Utilise uniquement le module 'wave' de la stdlib Python.
    """
    audio_int16 = (audio * 32767).astype(np.int16)

    with wave.open(chemin, 'w') as f:
        f.setnchannels(1)           # Mono
        f.setsampwidth(2)           # 16 bits = 2 octets
        f.setframerate(SAMPLE_RATE)
        f.writeframes(audio_int16.tobytes())

    print(f"💾 Sauvegardé : {chemin}")