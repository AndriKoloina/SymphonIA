"""
Moteur de théorie musicale : gammes, tonalités, et construction d'accords
à partir de chiffrages romains (I, ii, V7, i, iv...).

C'est le socle "règles" du système hybride : pas de ML ici, uniquement
de la théorie musicale encodée en dur.
"""

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
    'm7b5':  [0, 3, 6, 10],  # Demi-diminué
    'dim7':  [0, 3, 6, 9],
}

# chiffrage romain -> (degré de la gamme (0-indexé), qualité de l'accord)
ROMAN_MAJOR = {
    'I': (0, 'maj'), 'ii': (1, 'min'), 'iii': (2, 'min'), 'IV': (3, 'maj'),
    'V': (4, 'maj'), 'V7': (4, 'dom7'), 'vi': (5, 'min'), 'vii°': (6, 'dim'),
    'ii7': (1, 'min7'), 'IV7': (3, 'maj7'), 'I7': (0, 'maj7'),
    # Accords empruntés au mode mineur
    'i': (0, 'min'), 'iv': (3, 'min'), 'VI': (5, 'maj'), 'VII': (6, 'maj'), 'i7': (0, 'min7'),
}

ROMAN_MINOR = {
    'i': (0, 'min'), 'ii°': (1, 'dim'), 'III': (2, 'maj'), 'iv': (3, 'min'),
    'v': (4, 'min'), 'V': (4, 'maj'), 'V7': (4, 'dom7'), 'VI': (5, 'maj'),
    'VII': (6, 'maj'), 'i7': (0, 'min7'), 'iv7': (3, 'min7'), 'ii°7': (1, 'm7b5'),
    # Accords empruntés au mode majeur (Tierce picarde, IV majeur, etc.)
    'I': (0, 'maj'), 'IV': (3, 'maj'), 'ii': (1, 'min'), 'vi': (5, 'min'), 'I7': (0, 'maj7'),
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


def roman_to_chord(roman: str, key_root: str, mode: str, octave: int = 4) -> list[int]:
    """Convertit un chiffrage romain en liste de notes MIDI (l'accord empilé)."""
    table = ROMAN_MAJOR if mode == 'major' else ROMAN_MINOR
    
    # Repli intelligent : si l'accord n'est pas dans la table du mode, on cherche dans l'autre
    if roman not in table:
        fallback_table = ROMAN_MINOR if mode == 'major' else ROMAN_MAJOR
        if roman in fallback_table:
            table = fallback_table
        else:
            raise ValueError(f"Chiffrage romain inconnu : {roman}")

    degree, quality = table[roman]

    # En mineur, on utilise la gamme mineure harmonique pour avoir un V majeur juste
    scale_type = 'major' if mode == 'major' else 'harmonic_minor'
    scale = scale_notes(key_root, scale_type, octave)

    root = scale[degree % 7]
    return [root + interval for interval in CHORD_INTERVALS[quality]]


def scale_for_melody(key_root: str, mode: str, octave: int = 5) -> list[int]:
    scale_type = 'major' if mode == 'major' else 'natural_minor'
    return scale_notes(key_root, scale_type, octave)
