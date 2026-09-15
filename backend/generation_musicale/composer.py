"""
Orchestrateur structuré : génère une vraie forme de chanson et produit le
JSON final. La mélodie (main droite) utilise désormais une approche
hybride intégrée directement dans generate_melody() : structure/phrasé
procéduraux + décision de chaque pas mélodique déléguée au LSTM (repli
automatique sur la chaîne de Markov si le modèle n'est pas chargé).
"""
import random

# from theory import roman_to_chord
# from chord_library import get_progression
# from emotion_params import get_params
# from melody_generator import generate_melody, generate_accompaniment

from theory import roman_to_chord, apply_voice_leading
from chord_library import get_progression
from emotion_params import get_params
from genre_styles import get_genre_settings
from melody_generator import generate_melody, generate_accompaniment

# CHORUS_PATTERNS = {
#     'pop_ballad': 'arpeggio_8th',
#     'alberti_bass': 'pop_ballad',
#     'bass_chord': 'bass_chord',
#     'block': 'bass_chord',
# }


# --- MODULE D'HUMANISATION & SUSTAIN ---

def apply_humanization(notes: list[dict]) -> list[dict]:
    grouped_by_time = {}
    for n in notes:
        t = n['start_time']
        grouped_by_time.setdefault(t, []).append(n)

    humanized_notes = []
    for original_time, note_group in grouped_by_time.items():
        time_jitter = random.gauss(0, 0.012)

        if len(note_group) > 1:
            note_group.sort(key=lambda x: x['pitch'])
            for index, note in enumerate(note_group):
                n = note.copy()
                finger_delay = index * random.uniform(0.008, 0.018)
                n['start_time'] = max(0.0, round(original_time + time_jitter + finger_delay, 3))

                vel_noise = int(random.gauss(0, 4))
                n['velocity'] = max(1, min(127, n['velocity'] + vel_noise))

                dur_noise = random.uniform(0.95, 1.05)
                n['duration'] = round(n['duration'] * dur_noise, 3)
                humanized_notes.append(n)
        else:
            n = note_group[0].copy()
            n['start_time'] = max(0.0, round(original_time + time_jitter, 3))

            vel_noise = int(random.gauss(0, 3))
            n['velocity'] = max(1, min(127, n['velocity'] + vel_noise))
            humanized_notes.append(n)

    return sorted(humanized_notes, key=lambda x: x['start_time'])


def generate_sustain_events(chords_info: list[dict]) -> list[dict]:
    sustain_events = []
    for chord in chords_info:
        start = chord['start_time']
        duration = chord['duration']

        pedal_down = round(start + 0.03, 3)
        pedal_up = round(start + duration - 0.04, 3)

        sustain_events.append({'time': pedal_down, 'value': 127, 'type': 'pedal_down'})
        sustain_events.append({'time': pedal_up, 'value': 0, 'type': 'pedal_up'})

    return sorted(sustain_events, key=lambda x: x['time'])

def beats_to_seconds(beats: float, tempo_bpm: float) -> float:
    return beats * (60.0 / tempo_bpm)

def shift_notes_time(notes: list[dict], offset_sec: float) -> list[dict]:
    shifted = []
    for n in notes:
        new_n = n.copy()
        new_n['start_time'] = round(n['start_time'] + offset_sec, 3)
        shifted.append(new_n)
    return shifted


# --- ORCHESTRATION DES SECTIONS ---

def generate_section(chords_midi: list[list[int]], key: str, mode: str, params: dict,
                     tempo_bpm: float, pattern_name: str, is_chorus: bool = False,
                     beats_per_bar: int = 4, use_lstm_steps: bool = True,
                     use_passing_chords: bool = False, apply_blue_notes: bool = False) -> tuple[list[dict], float]:
    """
    Génère une section :
    - Main droite : generate_melody() gère le phrasé/climax/rythme, et
      délègue au LSTM (ou au repli Markov) le choix de chaque pas.
    - Main gauche : Conservée STRICTEMENT via generate_accompaniment().
    """
    melody_notes = generate_melody(
        chords=chords_midi, 
        key_root=key, 
        mode=mode, 
        params=params,
        tempo_bpm=tempo_bpm, 
        beats_per_bar=beats_per_bar,
        use_lstm_steps=use_lstm_steps, 
        apply_blue_notes=apply_blue_notes
    )

    # melody_notes = generate_melody(
    #     chords=chords_midi,
    #     key_root=key,
    #     mode=mode,
    #     params=params,
    #     tempo_bpm=tempo_bpm,
    #     beats_per_bar=beats_per_bar,
    #     use_lstm_steps=use_lstm_steps,
    # )

    if is_chorus:
        for n in melody_notes:
            n['velocity'] = min(127, int(n['velocity'] * 1.12))

    # --- MAIN GAUCHE (Accompagnement - Intouché) ---
    min_vel, max_vel = params['velocity']
    base_left_vel = int(min_vel + (0.2 if not is_chorus else 0.5) * (max_vel - min_vel))

    accompaniment_notes = generate_accompaniment(
        chords=chords_midi, 
        tempo_bpm=tempo_bpm, 
        pattern_name=pattern_name,
        beats_per_bar=beats_per_bar, 
        base_velocity=base_left_vel,
        use_passing_chords=use_passing_chords
    )

    # accompaniment_notes = generate_accompaniment(
    #     chords=chords_midi,
    #     tempo_bpm=tempo_bpm,
    #     pattern_name=pattern_name,
    #     beats_per_bar=beats_per_bar,
    #     base_velocity=base_left_vel
    # )

    section_notes = melody_notes + accompaniment_notes
    section_duration = beats_to_seconds(len(chords_midi) * beats_per_bar, tempo_bpm)

    return section_notes, section_duration


def apply_variation(notes: list[dict]) -> list[dict]:
    varied_notes = []
    for n in notes:
        new_n = n.copy()
        if new_n['hand'] == 'right':
            new_n['pitch'] += 12
            new_n['velocity'] = min(127, new_n['velocity'] + 10)
        varied_notes.append(new_n)
    return varied_notes


# --- NOUVEAU MOTEUR DE TRANSITIONS ET PRÉ-REFRAINS ---

def generate_transition(key: str, mode: str, genre: str, emotion: str,
                        tempo_bpm: float, beats_per_bar: int = 4) -> tuple[list[dict], float, list[str], list[list[int]]]:
    """
    Génère une transition dynamique et variée vers le refrain.
    Renvoie: (notes, dur_sec, romans_list, chords_midi_list)
    """
    from theory import roman_to_chord, scale_notes
    from genre_styles import get_genre_settings

    # Choix du type de transition
    types_possibles = ['silence_break', 'pre_chorus_chords', 'melodic_pickup', 'pedal_crescendo', 'direct']
    
    # Biais par émotion / genre
    if emotion == 'calme':
        transition_type = random.choice(['direct', 'melodic_pickup', 'silence_break'])
    elif emotion in ('energique', 'joyeux'):
        transition_type = random.choice(['pedal_crescendo', 'pre_chorus_chords', 'silence_break'])
    else: # triste, etc.
        transition_type = random.choice(['pre_chorus_chords', 'melodic_pickup', 'direct'])

    notes = []
    duration_beats = 4.0 # 1 mesure
    
    # 1. SILENCE / BREAK (Coupure d'impact avant le refrain)
    if transition_type == 'silence_break':
        dominant_chord = roman_to_chord('V', key, mode)
        dur_sec = beats_to_seconds(1.5, tempo_bpm)
        # Un seul accord plaqué au début de la mesure, puis silence total
        for p in dominant_chord[:3]:
            notes.append({'pitch': p, 'start_time': 0.0, 'duration': dur_sec, 'velocity': 75, 'hand': 'right'})
            notes.append({'pitch': p - 12, 'start_time': 0.0, 'duration': dur_sec, 'velocity': 70, 'hand': 'left'})
        return notes, beats_to_seconds(duration_beats, tempo_bpm), ['V'], [dominant_chord]

    # 2. PRÉ-REFRAIN HARMONIQUE (Progression d'accords courte : IV -> V ou ii -> V)
    elif transition_type == 'pre_chorus_chords':
        romans = ['iv', 'V'] if mode == 'minor' else ['IV', 'V']
        chords_midi = [roman_to_chord(r, key, mode) for r in romans]
        
        for i, chord in enumerate(chords_midi):
            start_beat = i * 2.0
            start_sec = beats_to_seconds(start_beat, tempo_bpm)
            dur_sec = beats_to_seconds(1.8, tempo_bpm)
            
            # Main droite
            for p in chord:
                notes.append({'pitch': p, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3), 'velocity': 75 + i*10, 'hand': 'right'})
            # Main gauche (Basse)
            notes.append({'pitch': chord[0] - 12, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3), 'velocity': 70 + i*10, 'hand': 'left'})
            
        return notes, beats_to_seconds(duration_beats, tempo_bpm), romans, chords_midi

    # 3. ANACROUSE / PICKUP MÉLODIQUE (Ligne montante vers la note du refrain)
    elif transition_type == 'melodic_pickup':
        scale_type = 'major' if mode == 'major' else 'natural_minor'
        scale = scale_notes(key, scale_type, 5)
        dominant_chord = roman_to_chord('V', key, mode)
        
        # Basse tenue à la main gauche
        notes.append({'pitch': dominant_chord[0] - 12, 'start_time': 0.0, 'duration': beats_to_seconds(4.0, tempo_bpm), 'velocity': 65, 'hand': 'left'})
        
        # 4 croches montantes sur les temps 3 et 4
        pickup_pitches = scale[2:6] # ex: D, E, F, G vers C
        for idx, pitch in enumerate(pickup_pitches):
            start_beat = 2.0 + (idx * 0.5)
            start_sec = beats_to_seconds(start_beat, tempo_bpm)
            dur_sec = beats_to_seconds(0.45, tempo_bpm)
            notes.append({'pitch': pitch, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3), 'velocity': 70 + idx*8, 'hand': 'right'})
            
        return notes, beats_to_seconds(duration_beats, tempo_bpm), ['V'], [dominant_chord]

    # 4. PEDAL CRESCENDO (Accords répétés en build-up)
    elif transition_type == 'pedal_crescendo':
        dominant_chord = roman_to_chord('V', key, mode)
        for beat in range(4):
            start_sec = beats_to_seconds(float(beat), tempo_bpm)
            dur_sec = beats_to_seconds(0.8, tempo_bpm)
            vel = 65 + beat * 12
            for p in dominant_chord:
                notes.append({'pitch': p, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3), 'velocity': vel, 'hand': 'right'})
            notes.append({'pitch': dominant_chord[0] - 12, 'start_time': round(start_sec, 3), 'duration': round(dur_sec, 3), 'velocity': vel - 5, 'hand': 'left'})
            
        return notes, beats_to_seconds(duration_beats, tempo_bpm), ['V'], [dominant_chord]

    # 5. DIRECT / SANS COUTURE (Pas de section de transition)
    else:
        return [], 0.0, [], []


# --- ORCHESTRATEUR PRINCIPAL ---

def compose(genre: str, emotion: str, key: str = 'C', mode: str = 'minor',
            measures: int = 8, tempo_bpm: int | None = None,
            beats_per_bar: int = 4, seed: int | None = None,
            use_lstm_steps: bool = True) -> dict:

    if seed is not None:
        random.seed(seed)

    params = get_params(emotion)
    genre_settings = get_genre_settings(genre)
    if tempo_bpm is None:
        tempo_bpm = random.randint(*params['tempo'])

    # verse_pattern = params['accompaniment_pattern']
    # chorus_pattern = CHORUS_PATTERNS.get(verse_pattern, verse_pattern)

    verse_pattern = genre_settings['pattern']
    chorus_pattern = genre_settings['chorus_pattern']

    progression_romans = get_progression(genre, emotion, mode)
    base_romans = (progression_romans * 4)[:4]

    chords_midi = [roman_to_chord(r, key, mode) for r in base_romans]
    chords_midi = apply_voice_leading(chords_midi)

    trans_roman = 'V'
    trans_chord_midi = roman_to_chord(trans_roman, key, mode)

    # Transmission des drapeaux de théorie musicale
    flags = {
        'use_passing_chords': genre_settings['passing_chords'],
        'apply_blue_notes': genre_settings['blue_notes']
    }

    raw_verse_notes, verse_dur = generate_section(
        chords_midi, key, mode, params, tempo_bpm, pattern_name=verse_pattern,
        is_chorus=False, use_lstm_steps=use_lstm_steps, **flags
    )

    raw_chorus_notes, chorus_dur = generate_section(
        chords_midi, key, mode, params, tempo_bpm, pattern_name=chorus_pattern,
        is_chorus=True, use_lstm_steps=use_lstm_steps, **flags
    )

    # --- NOUVEAU : Génération dynamique de la transition ---
    trans_notes, trans_dur, trans_romans, trans_chords_midi = generate_transition(
        key=key, mode=mode, genre=genre, emotion=emotion, tempo_bpm=tempo_bpm, beats_per_bar=beats_per_bar
    )

    # Construction de la structure globale
    structure = [
        ("VERSE", raw_verse_notes, verse_dur, base_romans, chords_midi),
    ]

    if trans_notes:
        structure.append(("TRANSITION", trans_notes, trans_dur, trans_romans, trans_chords_midi))

    structure.extend([
        ("CHORUS", raw_chorus_notes, chorus_dur, base_romans, chords_midi),
        ("VERSE_VAR", apply_variation(raw_verse_notes), verse_dur, base_romans, chords_midi),
        ("CHORUS", raw_chorus_notes, chorus_dur, base_romans, chords_midi)
    ])
    
    # transition_notes, transition_dur = generate_transition(trans_chord_midi, tempo_bpm)
    # structure = [
    #     ("VERSE", raw_verse_notes, verse_dur, base_romans, chords_midi),
    #     ("TRANSITION", transition_notes, transition_dur, [trans_roman], [trans_chord_midi]),
    #     ("CHORUS", raw_chorus_notes, chorus_dur, base_romans, chords_midi),
    #     ("VERSE_VAR", apply_variation(raw_verse_notes), verse_dur, base_romans, chords_midi),
    #     ("CHORUS", raw_chorus_notes, chorus_dur, base_romans, chords_midi)
    # ]

    final_notes = []
    final_chords_info = []
    global_time = 0.0
    total_measures = 0

    for section_name, notes, section_duration, section_romans, section_chords_midi in structure:

        if genre_settings['swing_ratio'] > 0.5:
            notes = apply_swing(notes, genre_settings['swing_ratio'], tempo_bpm)
            
        final_notes.extend(shift_notes_time(notes, global_time))

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
    final_notes = apply_humanization(final_notes)
    sustain_events = generate_sustain_events(final_chords_info)

    return {
        'metadata': {
            'genre': genre,
            'emotion': emotion,
            'key': key,
            'mode': mode,
            'tempo_bpm': tempo_bpm,
            'measures': total_measures,
            'time_signature': f"{beats_per_bar}/4",
            'total_duration_seconds': round(global_time, 3),
            'humanized': True,
            'ai_melody': use_lstm_steps
        },
        'chords': final_chords_info,
        'sustain_events': sustain_events,
        'notes': final_notes,
    }

def apply_swing(notes: list[dict], swing_ratio: float, tempo_bpm: float) -> list[dict]:
    if swing_ratio <= 0.5:
        return notes
        
    beat_duration_sec = 60.0 / tempo_bpm
    swing_delay_sec = (swing_ratio - 0.5) * beat_duration_sec * 2 
    
    for n in notes:
        beat_pos = n['start_time'] / beat_duration_sec
        fraction = beat_pos % 1.0
        # Si la note tombe sur une croche "en l'air"
        if 0.45 < fraction < 0.55: 
            n['start_time'] = round(n['start_time'] + swing_delay_sec, 3)
            n['duration'] = round(n['duration'] * 0.8, 3) # Empêche le chevauchement
    return notes