"""
Génération de la mélodie, contrainte par la progression d'accords.

APPROCHE HYBRIDE :
- Toute la logique musicale (phrasé sur 4 mesures, climax, respirations,
  rythmes variés) reste procédurale (règles écrites à la main) : elle
  fonctionne déjà bien et donne son "squelette" à la mélodie.
- Seule la décision "je monte / je descends / je reste" à chaque pas est
  déléguée à un modèle appris (custom_dl_melody.MelodyStepPredictor),
  avec repli automatique sur la chaîne de Markov si le modèle n'est pas
  disponible.

La chaîne de Markov (MARKOV_TRANSITIONS / predict_next_interval) sert
maintenant à deux choses : (1) repli si le modèle LSTM n'est pas chargé,
et (2) "professeur" utilisé par dataset_generator.py pour fabriquer le
corpus d'entraînement du LSTM.
"""
import random
from theory import scale_for_melody
from custom_dl_melody import MelodyStepPredictor


def beats_to_seconds(beats: float, tempo_bpm: float) -> float:
    return beats * 60.0 / tempo_bpm

# ---------------------------------------------------------------------------
# CHAÎNE DE MARKOV D'INTERVALLES (repli si pas de modèle + "professeur" pour
# générer le corpus d'entraînement dans dataset_generator.py)
# ---------------------------------------------------------------------------
MARKOV_TRANSITIONS = {
    1:  {1: 40, 0: 10, -1: 30, 2: 10, -2: 10},
    -1: {-1: 40, 0: 10, 1: 30, -2: 10, 2: 10},
    0:  {1: 25, -1: 25, 2: 15, -2: 15, 0: 20},
    2:  {-1: 50, -2: 20, 0: 10, 1: 10, 2: 10},
    3:  {-1: 60, -2: 20, 0: 10, 1: 10},
    -2: {1: 50, 2: 20, 0: 10, -1: 10, -2: 10},
    -3: {1: 60, 2: 20, 0: 10, -1: 10},
}
DEFAULT_TRANSITION = {1: 30, -1: 30, 0: 10, 2: 15, -2: 15}


def predict_next_interval(prev_interval: int) -> int:
    """Prédit le prochain saut mélodique via la chaîne de Markov (repli)."""
    transitions = MARKOV_TRANSITIONS.get(prev_interval, DEFAULT_TRANSITION)
    intervals = list(transitions.keys())
    weights = list(transitions.values())
    return random.choices(intervals, weights=weights, k=1)[0]


# ---------------------------------------------------------------------------
# MOTIFS D'ACCOMPAGNEMENT (MAIN GAUCHE) — inchangés
# ---------------------------------------------------------------------------
ACCOMPANIMENT_PATTERNS = {
    'block': [
        (0.0, [0, 1, 2], 4.0, 1.0),
    ],
    'arpeggio_8th': [
        (0.0, [0], 1.0, 1.1),
        (0.5, [1], 0.5, 0.85),
        (1.0, [2], 0.5, 0.95),
        (1.5, [1], 0.5, 0.85),
        (2.0, [0], 1.0, 1.0),
        (2.5, [1], 0.5, 0.85),
        (3.0, [2], 0.5, 0.95),
        (3.5, [1], 0.5, 0.85),
    ],
    'alberti_bass': [
        (0.0, [0], 0.5, 1.1),
        (0.5, [2], 0.5, 0.8),
        (1.0, [1], 0.5, 0.95),
        (1.5, [2], 0.5, 0.8),
        (2.0, [0], 0.5, 1.0),
        (2.5, [2], 0.5, 0.8),
        (3.0, [1], 0.5, 0.95),
        (3.5, [2], 0.5, 0.8),
    ],
    'bass_chord': [
        (0.0, [0],    1.0, 1.15),
        (1.0, [1, 2], 0.75, 0.90),
        (2.0, [1, 2], 0.75, 1.00),
        (3.0, [1, 2], 0.75, 0.85),
    ],
    'pop_ballad': [
        (0.0, [0], 2.0, 1.1),
        (0.5, [1], 1.5, 0.85),
        (1.0, [2], 1.0, 0.9),
        (2.0, [0], 2.0, 1.0),
        (2.5, [1], 1.5, 0.85),
        (3.0, [2], 1.0, 0.9),
    ],
}


def generate_melody(chords: list[list[int]], key_root: str, mode: str,
                    params: dict, tempo_bpm: float, beats_per_bar: int = 4,
                    use_lstm_steps: bool = True, temperature: float = 1.05) -> list[dict]:

    from theory import scale_notes
    scale_type = 'major' if mode == 'major' else 'natural_minor'
    scale = (scale_notes(key_root, scale_type, 4) +
             scale_notes(key_root, scale_type, 5) +
             scale_notes(key_root, scale_type, 6))

    notes = []

    RHYTHMS = [
        [1.5, 0.5, 1.0, 1.0],
        [1.0, 0.5, 0.5, 2.0],
        [0.5, 0.5, 1.0, 0.5, 1.5],
        [2.0, 1.0, 1.0],
    ]

    base_idx = len(scale) // 2

    # --- Moteur de décision hybride : LSTM si dispo, sinon Markov ---
    predictor = MelodyStepPredictor()
    use_lstm = use_lstm_steps and predictor.is_available
    prev_interval = 0  # état pour le repli Markov

    # --- État d'harmonisation (voice-leading de la voix secondaire) ---
    last_harmony_pitch: int | None = None

    for phrase_start in range(0, len(chords), 4):
        phrase_chords = chords[phrase_start:phrase_start + 4]
        climax_target_idx = min(len(scale) - 2, base_idx + random.randint(3, 6))
        climax_direction = 1 if climax_target_idx >= base_idx else -1

        for bar_offset, chord_tones in enumerate(phrase_chords):
            bar_index = phrase_start + bar_offset
            bar_start_beats = bar_index * beats_per_bar
            beat_cursor = 0.0

            is_last_bar_of_phrase = (bar_offset == 3) or (bar_index == len(chords) - 1)
            is_climax_bar = (bar_offset == 2)

            pattern = [2.0, 2.0] if is_last_bar_of_phrase else random.choice(RHYTHMS)
            pattern_idx = 0
            current_idx = base_idx
            chord_pitch_classes = {p % 12 for p in chord_tones}

            while beat_cursor < beats_per_bar:
                duration = pattern[pattern_idx % len(pattern)]
                duration = min(duration, beats_per_bar - beat_cursor)

                is_strong = (beat_cursor % 2.0 == 0.0)
                if not is_strong and not is_last_bar_of_phrase and random.random() < 0.20:
                    beat_cursor += duration
                    pattern_idx += 1
                    continue

                # --- DIRECTION MÉLODIQUE (Arc de phrase) ---
                if is_climax_bar and beat_cursor == 0.0:
                    current_idx = climax_target_idx
                    is_climax_note = True
                    interval = current_idx - base_idx
                else:
                    is_climax_note = False
                    if use_lstm:
                        interval = predictor.predict_next_interval(temperature=temperature)
                    else:
                        # Chaîne de Markov réellement utilisée (repli), avec un
                        # léger coup de pouce vers le climax pour garder une
                        # trajectoire musicale cohérente.
                        interval = predict_next_interval(prev_interval)
                        if random.random() < 0.35 and abs(interval) <= 1:
                            interval = climax_direction if current_idx != climax_target_idx else 0

                    current_idx = max(0, min(len(scale) - 1, current_idx + interval))

                melody_pitch = scale[current_idx]
                is_long_note = duration >= 1.5
                is_chord_tone_now = (melody_pitch % 12) in chord_pitch_classes

                # Mise à jour du contexte pour le prochain pas (LSTM ou Markov).
                # Le saut de climax peut dépasser +/-3 pas de gamme (jusqu'à +/-6) :
                # on borne uniquement la valeur transmise au contexte (l'encodage
                # ne connaît que les classes -3..+3), le déplacement réel de la
                # mélodie (current_idx) n'est lui jamais tronqué.
                context_interval = max(-3, min(3, interval))
                if use_lstm:
                    predictor.push(context_interval, is_chord_tone_now, is_strong)
                else:
                    prev_interval = context_interval

                # --- HARMONISATION (notes réelles de l'accord + voice-leading) ---
                rh_pitches, last_harmony_pitch = get_harmonized_notes(
                    melody_pitch=melody_pitch,
                    chord_tones=chord_tones,
                    is_climax=is_climax_note,
                    is_long_note=is_long_note,
                    is_strong_beat=is_strong,
                    harmony_density=params.get('note_density', 0.6),
                    prev_harmony_pitch=last_harmony_pitch,
                )

                # --- EXPRESSIVITÉ DE LA VÉLOCITÉ ---
                height_bonus = (current_idx - base_idx) * 2
                base_vel = 85 + height_bonus if is_strong else 70 + height_bonus
                if is_climax_note: base_vel += 15
                if is_last_bar_of_phrase: base_vel -= 20

                final_vel = int(max(40, min(120, base_vel)))

                start_sec = round(beats_to_seconds(bar_start_beats + beat_cursor, tempo_bpm), 3)
                dur_sec = round(beats_to_seconds(duration * 0.90, tempo_bpm), 3)

                for pitch in rh_pitches:
                    notes.append({
                        'pitch': pitch,
                        'start_time': start_sec,
                        'duration': dur_sec,
                        'velocity': final_vel if pitch == melody_pitch else int(final_vel * 0.82),
                        'hand': 'right',
                    })

                beat_cursor += duration
                pattern_idx += 1

            base_idx = current_idx

    return notes


def generate_accompaniment(chords: list[list[int]], tempo_bpm: float,
                          pattern_name: str = 'arpeggio_8th',
                          beats_per_bar: int = 4,
                          base_velocity: int = 50) -> list[dict]:
    """Génère la partie main gauche (inchangé)."""
    notes = []
    pattern = ACCOMPANIMENT_PATTERNS.get(pattern_name, ACCOMPANIMENT_PATTERNS['block'])

    for bar_index, chord_tones in enumerate(chords):
        bar_start_beat = bar_index * beats_per_bar

        for beat_offset, note_indices, duration_beats, vel_mult in pattern:
            if beat_offset >= beats_per_bar:
                continue

            start_beat = bar_start_beat + beat_offset
            start_time = round(beats_to_seconds(start_beat, tempo_bpm), 3)
            duration = round(beats_to_seconds(duration_beats, tempo_bpm), 3)
            velocity = int(min(127, max(1, base_velocity * vel_mult)))

            for idx in note_indices:
                pitch = chord_tones[idx % len(chord_tones)] - 12

                notes.append({
                    'pitch': pitch,
                    'start_time': start_time,
                    'duration': duration,
                    'velocity': velocity,
                    'hand': 'left',
                })

    return notes


def is_strong_beat_func(beat_cursor: float) -> bool:
    beat_in_bar = beat_cursor % 4.0
    return abs(beat_in_bar - 0.0) < 0.05 or abs(beat_in_bar - 2.0) < 0.05


def get_harmonized_notes(melody_pitch: int, chord_tones: list[int], is_climax: bool,
                          is_long_note: bool, is_strong_beat: bool,
                          harmony_density: float,
                          prev_harmony_pitch: int | None) -> tuple[list[int], int | None]:
    """
    Harmonise la mélodie avec une deuxième voix issue des VRAIES notes de
    l'accord en cours (et non plus un décalage générique dans la gamme
    comme dans la v1).

    - On ne considère que les notes de l'accord (harmonie juste, pas
      seulement diatonique).
    - On cherche, parmi les octaves possibles de ces notes, celles qui
      forment une tierce, sixte ou octave EN DESSOUS de la mélodie (les
      intervalles les plus naturels à l'oreille pour une voix
      d'accompagnement).
    - Voice-leading : on choisit le candidat le plus proche de la
      précédente note d'harmonie, pour un mouvement fluide entre les
      notes d'accompagnement plutôt que des sauts disgracieux.
    - On harmonise plus souvent qu'avant (pas seulement climax/notes
      longues), avec une fréquence pilotée par la densité de notes de
      l'émotion en cours.
    """
    pitches = [melody_pitch]

    should_harmonize = (
        is_climax
        or (is_long_note and random.random() < 0.7)
        or (is_strong_beat and random.random() < harmony_density * 0.35)
    )
    if not should_harmonize:
        return pitches, prev_harmony_pitch

    chord_pitch_classes = sorted({p % 12 for p in chord_tones})

    candidates = []
    for pc in chord_pitch_classes:
        for octave_shift in (-24, -12, 0):
            candidate = melody_pitch - ((melody_pitch - pc) % 12) + octave_shift
            interval = melody_pitch - candidate
            # Tierce (3,4), sixte (8,9) ou octave (12) en dessous : les plus consonants
            if interval in (3, 4, 8, 9, 12, 15, 16):
                candidates.append(candidate)

    if not candidates:
        return pitches, prev_harmony_pitch

    if prev_harmony_pitch is not None:
        chosen = min(candidates, key=lambda c: abs(c - prev_harmony_pitch))
    else:
        preferred = [c for c in candidates if melody_pitch - c in (3, 4, 8, 9)]
        chosen = preferred[0] if preferred else candidates[0]

    pitches.append(chosen)
    return pitches, chosen