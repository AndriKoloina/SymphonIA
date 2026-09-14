"""
Génération de la mélodie, contrainte par la progression d'accords.

v1 : marche aléatoire pondérée (pas de deep learning).
- Sur les temps forts : forte chance de jouer une note de l'accord en cours.
- Sur les temps faibles : note de passage, proche (par degré de gamme) de la
  note précédente, pour garder une ligne mélodique cohérente.

C'est volontairement remplaçable : plus tard, tu peux substituer cette
fonction par un appel à un transformer entraîné, tant qu'il respecte la
même interface (retourne une liste de notes datées). Le "contrôle par
l'accord" peut alors devenir un masquage des logits (constrained decoding)
plutôt qu'un choix aléatoire pondéré.
"""
import random
from theory import scale_for_melody


def beats_to_seconds(beats: float, tempo_bpm: float) -> float:
    return beats * 60.0 / tempo_bpm

# ---------------------------------------------------------------------------
# MODÈLE D'IA : MATRICE DE TRANSITION DE MARKOV
# Dictionnaire des probabilités : { Intervalle_Precedent : { Prochain_Intervalle : Poids } }
# Les valeurs sont des poids relatifs (pas besoin que la somme fasse 1.0).
# ---------------------------------------------------------------------------
MARKOV_TRANSITIONS = {
    # Mouvement conjoint ascendant (+1) : tendance à continuer ou redescendre
    1:  {1: 40, 0: 10, -1: 30, 2: 10, -2: 10},
    
    # Mouvement conjoint descendant (-1) : tendance à continuer ou remonter
    -1: {-1: 40, 0: 10, 1: 30, -2: 10, 2: 10},
    
    # Stagnation (0) : on va probablement bouger pour éviter l'ennui
    0:  {1: 25, -1: 25, 2: 15, -2: 15, 0: 20},
    
    # Sauts (+2, +3) -> Loi de compensation : on redescend presque toujours
    2:  {-1: 50, -2: 20, 0: 10, 1: 10, 2: 10},
    3:  {-1: 60, -2: 20, 0: 10, 1: 10},
    
    # Sauts vers le grave (-2, -3) -> Loi de compensation : on remonte
    -2: {1: 50, 2: 20, 0: 10, -1: 10, -2: 10},
    -3: {1: 60, 2: 20, 0: 10, -1: 10},
}

DEFAULT_TRANSITION = {1: 30, -1: 30, 0: 10, 2: 15, -2: 15}

# ---------------------------------------------------------------------------
# MOTIFS D'ACCOMPAGNEMENT (MAIN GAUCHE)
# Format par événement : (beat_offset, indices_notes, dur_beats, vel_mult)
# - beat_offset  : moment où la note est jouée dans la mesure (0.0 à 3.5 en 4/4)
# - indices_notes: liste des notes de l'accord à jouer (0=fondamentale, 1=tierce, 2=quinte)
# - dur_beats    : durée de tenue de la note en temps
# - vel_mult     : multiplicateur de vélocité (pour créer des nuances d'accentuation)
# ---------------------------------------------------------------------------

ACCOMPANIMENT_PATTERNS = {
    # 1. Accord plaqué (v1 basique)
    'block': [
        (0.0, [0, 1, 2], 4.0, 1.0),
    ],

    # 2. Arpège montant/descendant fluide en croches (Triste / Calme)
    'arpeggio_8th': [
        (0.0, [0], 1.0, 1.1),  # Basse appuyée
        (0.5, [1], 0.5, 0.85),
        (1.0, [2], 0.5, 0.95),
        (1.5, [1], 0.5, 0.85),
        (2.0, [0], 1.0, 1.0),
        (2.5, [1], 0.5, 0.85),
        (3.0, [2], 0.5, 0.95),
        (3.5, [1], 0.5, 0.85),
    ],

    # 3. Basse d'Alberti (Classique / Calme) : Basse -> Aiguë -> Médiane -> Aiguë
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

    # 4. Basse + Accord (Pop / Joyeux / Énergique) : Note basse sur temps 1, accord sur 2, 3, 4
    'bass_chord': [
        (0.0, [0],    1.0, 1.15), # Note basse octave grave sur le temps 1
        (1.0, [1, 2], 0.75, 0.90), # Accord plaqué
        (2.0, [1, 2], 0.75, 1.00),
        (3.0, [1, 2], 0.75, 0.85),
    ],

    # 5. Ballade Pop / Vague fluide (Arpège décalé)
    'pop_ballad': [
        (0.0, [0], 2.0, 1.1),
        (0.5, [1], 1.5, 0.85),
        (1.0, [2], 1.0, 0.9),
        (2.0, [0], 2.0, 1.0),
        (2.5, [1], 1.5, 0.85),
        (3.0, [2], 1.0, 0.9),
    ],
}

def predict_next_interval(prev_interval: int) -> int:
    """Prédit le prochain saut mélodique en utilisant la chaîne de Markov."""
    transitions = MARKOV_TRANSITIONS.get(prev_interval, DEFAULT_TRANSITION)
    intervals = list(transitions.keys())
    weights = list(transitions.values())
    
    # random.choices utilise les poids pour le tirage (échantillonnage de la distribution)
    return random.choices(intervals, weights=weights, k=1)[0]

def generate_melody(chords: list[list[int]], key_root: str, mode: str,
                    params: dict, tempo_bpm: float, beats_per_bar: int = 4) -> list[dict]:
    
    from theory import scale_notes
    scale_type = 'major' if mode == 'major' else 'natural_minor'
    scale = (scale_notes(key_root, scale_type, 4) + 
             scale_notes(key_root, scale_type, 5) + 
             scale_notes(key_root, scale_type, 6))
    
    notes = []
    
    # Motifs rythmiques plus naturels (incluant des croches et syncopes)
    RHYTHMS = [
        [1.5, 0.5, 1.0, 1.0],      # Syncope / Ballade
        [1.0, 0.5, 0.5, 2.0],      # Élan + note tenue
        [0.5, 0.5, 1.0, 0.5, 1.5], # Fluide
        [2.0, 1.0, 1.0],           # Pose
    ]

    base_idx = len(scale) // 2  # Registre médium au départ
    
    # Traitement par blocs de 4 mesures (Phrases musicales)
    for phrase_start in range(0, len(chords), 4):
        phrase_chords = chords[phrase_start:phrase_start + 4]
        
        # Définition du climax (la note la plus haute sera visée à la mesure 3 du bloc)
        climax_target_idx = min(len(scale) - 2, base_idx + random.randint(3, 6))
        
        for bar_offset, chord_tones in enumerate(phrase_chords):
            bar_index = phrase_start + bar_offset
            bar_start_beats = bar_index * beats_per_bar
            beat_cursor = 0.0
            
            is_last_bar_of_phrase = (bar_offset == 3) or (bar_index == len(chords) - 1)
            is_climax_bar = (bar_offset == 2)  # La mesure 3 est le sommet d'intensité
            
            # Choix du rythme pour la mesure
            pattern = [2.0, 2.0] if is_last_bar_of_phrase else random.choice(RHYTHMS)
            pattern_idx = 0
            
            # Position mélodique actuelle
            current_idx = base_idx
            
            while beat_cursor < beats_per_bar:
                duration = pattern[pattern_idx % len(pattern)]
                duration = min(duration, beats_per_bar - beat_cursor)
                
                # --- A) RESPIRATION / SILENCES (20% de chance de silence sur temps faible) ---
                is_strong = (beat_cursor % 2.0 == 0.0)
                if not is_strong and not is_last_bar_of_phrase and random.random() < 0.20:
                    beat_cursor += duration
                    pattern_idx += 1
                    continue
                
                # --- B) DIRECTION MÉLODIQUE (Arc) ---
                if is_climax_bar and beat_cursor == 0.0:
                    # On atteint le sommet d'intensité
                    current_idx = climax_target_idx
                    is_climax_note = True
                else:
                    is_climax_note = False
                    # Mouvement conjoint fluide (-1, 0, +1) avec légère tendance à monter vers le climax
                    direction = 1 if (bar_offset < 2 and current_idx < climax_target_idx) else -1
                    step = random.choices([direction, 0, -direction], weights=[50, 25, 25])[0]
                    current_idx = max(0, min(len(scale) - 1, current_idx + step))

                melody_pitch = scale[current_idx]
                is_long_note = duration >= 1.5
                
                # --- C) HARMONISATION SELECTIVE ---
                rh_pitches = get_harmonized_notes(
                    melody_pitch=melody_pitch, 
                    scale=scale, 
                    is_climax=is_climax_note, 
                    is_long_note=is_long_note
                )
                
                # --- D) EXPRESSIVITÉ DE LA VÉLOCITÉ ---
                # Plus la note est haute dans l'arc, plus la vélocité est forte
                height_bonus = (current_idx - base_idx) * 2
                base_vel = 85 + height_bonus if is_strong else 70 + height_bonus
                if is_climax_note: base_vel += 15
                if is_last_bar_of_phrase: base_vel -= 20 # Diminuendo de fin de phrase
                
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
                
            # Mise à jour de la position de référence pour la mesure suivante
            base_idx = current_idx

    return notes


def generate_accompaniment(chords: list[list[int]], tempo_bpm: float,
                          pattern_name: str = 'arpeggio_8th',
                          beats_per_bar: int = 4,
                          base_velocity: int = 50) -> list[dict]:
    """
    Génère la partie main gauche selon le motif d'accompagnement sélectionné.
    """
    notes = []
    pattern = ACCOMPANIMENT_PATTERNS.get(pattern_name, ACCOMPANIMENT_PATTERNS['block'])

    for bar_index, chord_tones in enumerate(chords):
        bar_start_beat = bar_index * beats_per_bar

        for beat_offset, note_indices, duration_beats, vel_mult in pattern:
            if beat_offset >= beats_per_bar:
                continue  # Évite les débordements de mesure

            start_beat = bar_start_beat + beat_offset
            start_time = round(beats_to_seconds(start_beat, tempo_bpm), 3)
            duration = round(beats_to_seconds(duration_beats, tempo_bpm), 3)
            velocity = int(min(127, max(1, base_velocity * vel_mult)))

            for idx in note_indices:
                # Utilise le modulo % pour s'adapter aux accords à 3 ou 4 notes (ex: septièmes)
                pitch = chord_tones[idx % len(chord_tones)] - 12  # Registre grave

                notes.append({
                    'pitch': pitch,
                    'start_time': start_time,
                    'duration': duration,
                    'velocity': velocity,
                    'hand': 'left',
                })

    return notes


def is_strong_beat_func(beat_cursor: float) -> bool:
    """Vérifie si on est sur un temps fort (1 ou 3 en 4/4) sans bug de float."""
    beat_in_bar = beat_cursor % 4.0
    # Temps 0 (début de mesure) ou Temps 2
    return abs(beat_in_bar - 0.0) < 0.05 or abs(beat_in_bar - 2.0) < 0.05

def get_harmonized_notes(melody_pitch: int, scale: list[int], is_climax: bool, is_long_note: bool) -> list[int]:
    """
    Harmonise uniquement les moments clés (notes longues ou climax de la phrase).
    """
    pitches = [melody_pitch]
    
    # On n'harmonise QUE les notes importantes pour créer un effet d'impact
    if not (is_climax or is_long_note):
        return pitches

    try:
        idx = scale.index(melody_pitch)
    except ValueError:
        return pitches

    # Pour un climax (point culminant de l'émotion) : Octave ou Sixte inférieure
    if is_climax:
        if idx >= 5:
            pitches.append(scale[idx - 5])  # Sixte inférieure (très épique)
        else:
            pitches.append(melody_pitch - 12) # Octave
            
    # Pour une note longue (tenue) : Tierce inférieure (très doux)
    elif is_long_note:
        if idx >= 2:
            pitches.append(scale[idx - 2])  # Tierce inférieure
            
    return pitches
