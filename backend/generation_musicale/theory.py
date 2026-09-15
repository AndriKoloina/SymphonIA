"""
Moteur de théorie musicale : gammes, tonalités, et construction d'accords
à partir de chiffrages romains (I, ii, V7, i, iv...).

C'est le socle "règles" du système hybride : pas de ML ici, uniquement
de la théorie musicale encodée en dur.
"""
import random

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

NOTE_ALIASES = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#'
}

SCALES = {
    'major':          [0, 2, 4, 5, 7, 9, 11],
    'natural_minor':  [0, 2, 3, 5, 7, 8, 10],
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],  # utile pour le V majeur en mineur
}

CHORD_INTERVALS = {
    'maj':   [0, 4, 7],
    'min':   [0, 3, 7],
    'dim':   [0, 3, 6],
    'dom7':  [0, 4, 7, 10],
    'maj7':  [0, 4, 7, 11],
    'min7':  [0, 3, 7, 10],
    'm7b5':  [0, 3, 6, 10],
    'dim7':  [0, 3, 6, 9],
    # --- NOUVELLES EXTENSIONS (Jazz/Blues) ---
    'dom9':  [0, 4, 7, 10, 14],
    'maj9':  [0, 4, 7, 11, 14],
    'min9':  [0, 3, 7, 10, 14],
    'six':   [0, 4, 7, 9],
    'm6':    [0, 3, 7, 9],
    'sus4':  [0, 5, 7],
}

# --- NOUVEAU : Dictionnaire pour transformer les accords simples en accords riches ---
EXTENSION_UPGRADES = {
    'dom7': 'dom9',
    'maj7': 'maj9',
    'min7': 'min9',
    'maj':  'six',
    'min':  'm6',
}

# chiffrage romain -> (degré de la gamme (0-indexé), qualité de l'accord)
ROMAN_MAJOR = {
    'I': (0, 'maj'), 'ii': (1, 'min'), 'iii': (2, 'min'), 'IV': (3, 'maj'),
    'V': (4, 'maj'), 'V7': (4, 'dom7'), 'vi': (5, 'min'), 'vii°': (6, 'dim'),
    'ii7': (1, 'min7'), 'IV7': (3, 'maj7'), 'I7': (0, 'maj7'),
    'i': (0, 'min'), 'iv': (3, 'min'), 'VI': (5, 'maj'), 'VII': (6, 'maj'), 'i7': (0, 'min7'),
    # --- NOUVEAUX : Dominantes secondaires et blues ---
    'VI7': (5, 'dom7'), 'III7': (2, 'dom7'), 'II7': (1, 'dom7'), 'VII7': (6, 'dom7'), 'vii°7': (6, 'dim7'),
    'Iblues7': (0, 'dom7'), 'IVblues7': (3, 'dom7'),
}

ROMAN_MINOR = {
    'i': (0, 'min'), 'ii°': (1, 'dim'), 'III': (2, 'maj'), 'iv': (3, 'min'),
    'v': (4, 'min'), 'V': (4, 'maj'), 'V7': (4, 'dom7'), 'VI': (5, 'maj'),
    'VII': (6, 'maj'), 'i7': (0, 'min7'), 'iv7': (3, 'min7'), 'ii°7': (1, 'm7b5'),
    'I': (0, 'maj'), 'IV': (3, 'maj'), 'ii': (1, 'min'), 'vi': (5, 'min'), 'I7': (0, 'maj7'),
    # --- NOUVEAUX : Dominantes secondaires et blues ---
    'VI7': (5, 'dom7'), 'III7': (2, 'dom7'), 'II7': (1, 'dom7'), 'VII7': (6, 'dom7'), 'vii°7': (6, 'dim7'),
    'Iblues7': (0, 'dom7'), 'IVblues7': (3, 'dom7'),
}


def note_to_midi(note_name: str, octave: int = 4) -> int:
    clean_note = NOTE_ALIASES.get(note_name, note_name)
    if clean_note not in NOTE_NAMES:
        raise ValueError(f"Note invalide: {note_name}")
    idx = NOTE_NAMES.index(clean_note)
    return 12 * (octave + 1) + idx


def scale_notes(root_note: str, scale_type: str, octave: int = 4) -> list[int]:
    root_midi = note_to_midi(root_note, octave)
    return [root_midi + interval for interval in SCALES[scale_type]]


def roman_to_chord(roman: str, key_root: str, mode: str, octave: int = 4, extension_prob: float = 0.0) -> list[int]:
    """Convertit un chiffrage romain en liste de notes MIDI avec enrichissement probabiliste."""
    table = ROMAN_MAJOR if mode == 'major' else ROMAN_MINOR
    
    # Repli intelligent
    if roman not in table:
        fallback_table = ROMAN_MINOR if mode == 'major' else ROMAN_MAJOR
        if roman in fallback_table:
            table = fallback_table
        else:
            raise ValueError(f"Chiffrage romain inconnu : {roman}")

    degree, quality = table[roman]

    # --- NOUVEAU : Application des extensions (ex: dom7 devient dom9) ---
    if quality in EXTENSION_UPGRADES and random.random() < extension_prob:
        quality = EXTENSION_UPGRADES[quality]

    scale_type = 'major' if mode == 'major' else 'harmonic_minor'
    scale = scale_notes(key_root, scale_type, octave)

    root = scale[degree % 7]
    return [root + interval for interval in CHORD_INTERVALS[quality]]


def scale_for_melody(key_root: str, mode: str, octave: int = 5) -> list[int]:
    scale_type = 'major' if mode == 'major' else 'natural_minor'
    return scale_notes(key_root, scale_type, octave)

def apply_voice_leading(chords_midi: list[list[int]]) -> list[list[int]]:
    """
    Minimise le déplacement des voix supérieures.
    Maintient la fondamentale à la basse pour la stabilité harmonique.
    """
    if not chords_midi: return []
    voiced = [chords_midi[0]]
    
    for i in range(1, len(chords_midi)):
        prev_chord = voiced[-1]
        raw_target = chords_midi[i]
        
        # 1. Gestion de la Basse
        bass_pc = raw_target[0] % 12
        bass_octave = (prev_chord[0] // 12)
        new_bass = bass_octave * 12 + bass_pc
        if abs(new_bass - prev_chord[0]) > 6:
            new_bass += 12 if new_bass < prev_chord[0] else -12
            
        new_chord = [new_bass]
        
        # 2. Voice leading des voix supérieures
        target_pcs = [n % 12 for n in raw_target[1:]]
        for p_note in prev_chord[1:]:
            best_note = None
            best_dist = float('inf')
            
            for pc in target_pcs:
                octave = p_note // 12
                candidate = octave * 12 + pc
                if candidate - p_note > 6: candidate -= 12
                elif candidate - p_note < -6: candidate += 12
                    
                dist = abs(candidate - p_note)
                if dist < best_dist and candidate not in new_chord:
                    best_dist = dist
                    best_note = candidate
                    
            if best_note is not None:
                new_chord.append(best_note)
                target_pcs.remove(best_note % 12)
        
        # 3. Traitement des voix restantes (ex: accord de 4 notes suivant un accord de 3 notes)
        for pc in target_pcs:
            ref_note = new_chord[-1]
            octave = ref_note // 12
            candidate = octave * 12 + pc
            if candidate - ref_note > 6: candidate -= 12
            elif candidate - ref_note < -6: candidate += 12
            new_chord.append(candidate)
            
        voiced.append(sorted(new_chord))
        
    return voiced

def apply_voicing_style(chords_midi: list[list[int]], style: str = 'closed') -> list[list[int]]:
    """Applique une texture spatiale (Drop 2, Spread) après le voice leading."""
    styled_chords = []
    for chord in chords_midi:
        chord_sorted = sorted(chord)
        if style == 'drop2' and len(chord_sorted) >= 3:
            # Descend la 2ème note la plus haute d'une octave (typique Jazz)
            dropped = chord_sorted.copy()
            dropped[-2] -= 12
            styled_chords.append(sorted(dropped))
        elif style == 'spread' and len(chord_sorted) >= 3:
            # Ecarte les voix supérieures (typique Classique/Cinématique)
            root = chord_sorted[0]
            upper = [p + 12 for p in chord_sorted[1:]]
            styled_chords.append(sorted([root] + upper))
        else:
            styled_chords.append(chord_sorted) # 'closed' par défaut
            
    return styled_chords
