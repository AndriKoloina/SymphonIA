"""
Orchestrateur structuré : génère une vraie forme de chanson
(Couplet -> Transition -> Refrain -> Couplet Varié -> Refrain)
et produit le JSON final consommé par le frontend.
"""
import random

from theory import roman_to_chord
from chord_library import get_progression
from emotion_params import get_params

# --- UTILITAIRES DE TEMPS ---
def beats_to_seconds(beats: float, tempo_bpm: float) -> float:
    return beats * (60.0 / tempo_bpm)

def shift_notes_time(notes: list[dict], offset_sec: float) -> list[dict]:
    """Décale un bloc de notes dans le temps."""
    shifted = []
    for n in notes:
        new_n = n.copy()
        new_n['start_time'] = round(n['start_time'] + offset_sec, 3)
        shifted.append(new_n)
    return shifted

def get_scale_pitches(key: str, mode: str, octaves: list = [4, 5, 6]) -> list[int]:
    """Génère les notes de la gamme sur plusieurs octaves (sécurité si non présent dans theory.py)."""
    # Notes de base (C=0, C#=1, etc.)
    notes_map = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 
                 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
    root_pitch = notes_map.get(key, 0)
    intervals = [0, 2, 4, 5, 7, 9, 11] if mode == 'major' else [0, 2, 3, 5, 7, 8, 10]
    
    scale = []
    for oct in octaves:
        base = root_pitch + (oct + 1) * 12
        for interval in intervals:
            scale.append(base + interval)
    return scale

# --- MOTEURS DE GÉNÉRATION DES SECTIONS ---

def generate_theme(chords_midi: list[list[int]], scale: list[int], tempo_bpm: float, 
                   is_chorus: bool = False, beats_per_bar: int = 4) -> tuple[list[dict], float]:
    """Génère une section de 4 mesures (Couplet ou Refrain)."""
    notes = []
    
    base_idx = len(scale) // 2 + (4 if is_chorus else 0) # Plus aigu pour le refrain
    base_vel_right = 95 if is_chorus else 75
    base_vel_left = 80 if is_chorus else 60
    
    # Rythmes
    RHYTHMS = [[1.5, 0.5, 1.0, 1.0], [1.0, 0.5, 0.5, 2.0], [2.0, 1.0, 1.0]]
    if is_chorus:
        RHYTHMS.append([0.5, 0.5, 1.0, 0.5, 1.5]) # Plus dynamique
        
    current_time_sec = 0.0

    for chord_tones in chords_midi:
        beat_cursor = 0.0
        pattern = random.choice(RHYTHMS)
        pattern_idx = 0
        current_idx = base_idx
        
        # --- MAIN GAUCHE (Accompagnement) ---
        if not is_chorus:
            # Couplet : Accords longs et doux
            for pitch in chord_tones:
                notes.append({
                    'pitch': pitch - 12, # Octave inférieure
                    'start_time': current_time_sec,
                    'duration': round(beats_to_seconds(beats_per_bar * 0.9, tempo_bpm), 3),
                    'velocity': base_vel_left,
                    'hand': 'left'
                })
        else:
            # Refrain : Arpèges rapides (croches)
            arp_cursor = 0.0
            while arp_cursor < beats_per_bar:
                arp_pitch = chord_tones[int((arp_cursor * 2) % len(chord_tones))] - 12
                notes.append({
                    'pitch': arp_pitch,
                    'start_time': round(current_time_sec + beats_to_seconds(arp_cursor, tempo_bpm), 3),
                    'duration': round(beats_to_seconds(0.4, tempo_bpm), 3),
                    'velocity': base_vel_left,
                    'hand': 'left'
                })
                arp_cursor += 0.5
                
        # --- MAIN DROITE (Mélodie) ---
        while beat_cursor < beats_per_bar:
            duration = pattern[pattern_idx % len(pattern)]
            duration = min(duration, beats_per_bar - beat_cursor)
            
            # Mouvement conjoint
            step = random.choices([1, 0, -1], weights=[40, 20, 40])[0]
            current_idx = max(0, min(len(scale) - 1, current_idx + step))
            melody_pitch = scale[current_idx]
            
            pitches = [melody_pitch]
            # Harmonisation sur les temps forts du refrain
            if is_chorus and current_idx >= 2 and beat_cursor in (0.0, 2.0):
                pitches.append(scale[current_idx - 2]) 
                
            start_sec = current_time_sec + beats_to_seconds(beat_cursor, tempo_bpm)
            dur_sec = beats_to_seconds(duration * 0.9, tempo_bpm)
            
            for p in pitches:
                notes.append({
                    'pitch': p,
                    'start_time': round(start_sec, 3),
                    'duration': round(dur_sec, 3),
                    'velocity': base_vel_right,
                    'hand': 'right'
                })
                
            beat_cursor += duration
            pattern_idx += 1
            
        current_time_sec += beats_to_seconds(beats_per_bar, tempo_bpm)
        
    return notes, current_time_sec

def apply_variation(notes: list[dict]) -> list[dict]:
    """Variation pour le Couplet 2 (Octave supérieure)."""
    varied_notes = []
    for n in notes:
        new_n = n.copy()
        if new_n['hand'] == 'right':
            new_n['pitch'] += 12 # +1 octave
            new_n['velocity'] = min(127, new_n['velocity'] + 10)
        varied_notes.append(new_n)
    return varied_notes

def generate_transition(dominant_chord: list[int], tempo_bpm: float, beats_per_bar: int = 4) -> tuple[list[dict], float]:
    """Génère 1 mesure de montée en tension (Pré-refrain)."""
    notes = []
    beat_cursor = 0.0
    
    # Montée sur les notes de l'accord V
    pitches_to_climb = sorted(dominant_chord + [p + 12 for p in dominant_chord] + [p + 24 for p in dominant_chord])
    pitch_idx = 0
    
    while beat_cursor < beats_per_bar:
        tension_vel = int(70 + (beat_cursor / beats_per_bar) * 45) # Crescendo de 70 à 115
        pitch = pitches_to_climb[pitch_idx % len(pitches_to_climb)]
        
        start_sec = beats_to_seconds(beat_cursor, tempo_bpm)
        dur_sec = beats_to_seconds(0.4, tempo_bpm)
        
        # Main droite (monte)
        notes.append({
            'pitch': pitch, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3),
            'velocity': tension_vel, 'hand': 'right'
        })
        # Main gauche (martèle la basse)
        notes.append({
            'pitch': dominant_chord[0] - 12, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3),
            'velocity': tension_vel - 10, 'hand': 'left'
        })
        
        beat_cursor += 0.5 # Croches
        pitch_idx += 1
        
    duration_sec = beats_to_seconds(beats_per_bar, tempo_bpm)
    return notes, duration_sec

# --- ORCHESTRATEUR PRINCIPAL ---
def compose(genre: str, emotion: str, key: str = 'C', mode: str = 'minor',
            measures: int = 8, tempo_bpm: int | None = None,
            beats_per_bar: int = 4, seed: int | None = None) -> dict:

    if seed is not None:
        random.seed(seed)

    params = get_params(emotion)
    if tempo_bpm is None:
        tempo_bpm = random.randint(*params['tempo'])

    # 1. Obtenir les progressions
    progression_romans = get_progression(genre, emotion, mode)
    # On force une progression de 4 accords pour nos blocs
    base_romans = (progression_romans * 4)[:4] 
    chords_midi = [roman_to_chord(r, key, mode) for r in base_romans]
    
    # Accord de dominante (V) pour la transition
    trans_roman = 'V'
    trans_chord_midi = roman_to_chord(trans_roman, key, mode)
    
    scale = get_scale_pitches(key, mode)

    # 2. Génération des "Briques" (Themes)
    raw_verse_notes, verse_dur = generate_theme(chords_midi, scale, tempo_bpm, is_chorus=False)
    raw_chorus_notes, chorus_dur = generate_theme(chords_midi, scale, tempo_bpm, is_chorus=True)
    transition_notes, transition_dur = generate_transition(trans_chord_midi, tempo_bpm)
    
    # 3. Plan de Montage (Forme structurée de 17 mesures)
    # Couplet (4) -> Transition (1) -> Refrain (4) -> CoupletVar (4) -> Refrain (4)
    structure = [
        ("VERSE", raw_verse_notes, verse_dur, base_romans, chords_midi),
        ("TRANSITION", transition_notes, transition_dur, [trans_roman], [trans_chord_midi]),
        ("CHORUS", raw_chorus_notes, chorus_dur, base_romans, chords_midi),
        ("VERSE_VAR", apply_variation(raw_verse_notes), verse_dur, base_romans, chords_midi),
        ("CHORUS", raw_chorus_notes, chorus_dur, base_romans, chords_midi)
    ]
    
    final_notes = []
    final_chords_info = []
    global_time = 0.0
    total_measures = 0
    
    # 4. Assemblage sur la timeline
    for section_name, notes, section_duration, section_romans, section_chords_midi in structure:
        final_notes.extend(shift_notes_time(notes, global_time))
        
        # Mémorisation des accords pour les métadonnées Json (Optionnel mais propre)
        for r, c in zip(section_romans, section_chords_midi):
            final_chords_info.append({
                'roman': r,
                'start_time': round(global_time, 3),
                'duration': round(beats_to_seconds(beats_per_bar, tempo_bpm), 3),
                'notes': c,
            })
            global_time += beats_to_seconds(beats_per_bar, tempo_bpm)
            total_measures += 1
            
    final_notes = sorted(final_notes, key=lambda n: n['start_time'])

    return {
        'metadata': {
            'genre': genre,
            'emotion': emotion,
            'key': key,
            'mode': mode,
            'tempo_bpm': tempo_bpm,
            'measures': total_measures, # Renvoie 17 mesures générées au lieu des 8 demandées
            'time_signature': f"{beats_per_bar}/4",
            'total_duration_seconds': round(global_time, 3),
            'structure': "Verse -> Transition -> Chorus -> Verse Variation -> Chorus"
        },
        'chords': final_chords_info,
        'notes': final_notes,
    }
