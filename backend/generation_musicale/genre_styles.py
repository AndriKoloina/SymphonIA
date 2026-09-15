"""
Moteur stylistique : gère les motifs d'accompagnement, le swing, et les règles
harmoniques spécifiques (blue notes, dominantes secondaires) par genre.
"""

ACCOMPANIMENT_PATTERNS = {
    # --- MOTIFS EXISTANTS ---
    'block': [(0.0, [0, 1, 2], 4.0, 1.0)],
    'arpeggio_8th': [(0.0, [0], 1.0, 1.1), (0.5, [1], 0.5, 0.85), (1.0, [2], 0.5, 0.95), (1.5, [1], 0.5, 0.85), (2.0, [0], 1.0, 1.0), (2.5, [1], 0.5, 0.85), (3.0, [2], 0.5, 0.95), (3.5, [1], 0.5, 0.85)],
    'alberti_bass': [(0.0, [0], 0.5, 1.1), (0.5, [2], 0.5, 0.8), (1.0, [1], 0.5, 0.95), (1.5, [2], 0.5, 0.8), (2.0, [0], 0.5, 1.0), (2.5, [2], 0.5, 0.8), (3.0, [1], 0.5, 0.95), (3.5, [2], 0.5, 0.8)],
    'bass_chord': [(0.0, [0], 1.0, 1.15), (1.0, [1, 2], 0.75, 0.90), (2.0, [1, 2], 0.75, 1.00), (3.0, [1, 2], 0.75, 0.85)],
    'pop_ballad': [(0.0, [0], 2.0, 1.1), (0.5, [1], 1.5, 0.85), (1.0, [2], 1.0, 0.9), (2.0, [0], 2.0, 1.0), (2.5, [1], 1.5, 0.85), (3.0, [2], 1.0, 0.9)],
    
    # --- NOUVEAUX MOTIFS ---
    'walking_bass': [(0.0, [0], 1.0, 1.1), (1.0, [1], 1.0, 0.9), (2.0, [2], 1.0, 1.0), (3.0, [1], 1.0, 0.9)],
    'swing_comping': [(0.0, [0], 1.5, 1.0), (1.5, [1, 2, 3], 1.0, 0.8), (2.5, [1, 2, 3], 1.5, 0.9)],
    'blues_shuffle': [(0.0, [0, 1], 0.66, 1.1), (0.66, [0, 1], 0.34, 0.8), (1.0, [0, 2], 0.66, 1.0), (1.66, [0, 2], 0.34, 0.8), (2.0, [0, 1], 0.66, 1.0), (2.66, [0, 1], 0.34, 0.8), (3.0, [0, 2], 0.66, 1.0), (3.66, [0, 2], 0.34, 0.8)],
    'latin_clave': [(0.0, [0], 1.5, 1.1), (1.5, [1, 2], 1.0, 0.9), (2.5, [1, 2], 1.5, 1.0)],
    'power_chords': [(0.0, [0, 1], 0.5, 1.2), (0.5, [0, 1], 0.5, 0.9), (1.0, [0, 1], 0.5, 1.0), (1.5, [0, 1], 0.5, 0.9), (2.0, [0, 1], 0.5, 1.1), (2.5, [0, 1], 0.5, 0.9), (3.0, [0, 1], 0.5, 1.0), (3.5, [0, 1], 0.5, 0.9)],
    'gospel_block': [(0.0, [0, 1, 2], 1.5, 1.1), (1.5, [0, 1, 2], 0.5, 0.9), (2.0, [0, 1, 2], 2.0, 1.0)],
}

GENRE_SETTINGS = {
    'classique': {'pattern': 'alberti_bass', 'chorus_pattern': 'arpeggio_8th', 'swing_ratio': 0.5, 'passing_chords': False, 'blue_notes': False},
    'pop': {'pattern': 'pop_ballad', 'chorus_pattern': 'bass_chord', 'swing_ratio': 0.5, 'passing_chords': False, 'blue_notes': False},
    'jazz': {'pattern': 'swing_comping', 'chorus_pattern': 'walking_bass', 'swing_ratio': 0.66, 'passing_chords': True, 'blue_notes': True},
    'blues': {'pattern': 'blues_shuffle', 'chorus_pattern': 'blues_shuffle', 'swing_ratio': 0.66, 'passing_chords': True, 'blue_notes': True},
    'latin': {'pattern': 'latin_clave', 'chorus_pattern': 'latin_clave', 'swing_ratio': 0.5, 'passing_chords': True, 'blue_notes': False},
    'rock': {'pattern': 'power_chords', 'chorus_pattern': 'power_chords', 'swing_ratio': 0.5, 'passing_chords': False, 'blue_notes': True},
    'gospel': {'pattern': 'gospel_block', 'chorus_pattern': 'walking_bass', 'swing_ratio': 0.6, 'passing_chords': True, 'blue_notes': True},
    'cinematique': {'pattern': 'arpeggio_8th', 'chorus_pattern': 'block', 'swing_ratio': 0.5, 'passing_chords': False, 'blue_notes': False},
}

def get_genre_settings(genre: str) -> dict:
    return GENRE_SETTINGS.get(genre.lower(), GENRE_SETTINGS['pop'])