"""
Mapping émotion -> paramètres musicaux concrets.

Basé sur les corrélations connues en littérature (ex. EMOPIA) :
arousal élevé = tempo rapide, densité et vélocité fortes ;
arousal faible = tempo lent, notes plus longues, vélocité plus faible.
"""

EMOTION_PARAMS = {
    'triste': {
        'tempo': (50, 70),
        'velocity': (35, 55),
        'note_density': 0.55,
        'note_length_beats': (1.0, 2.0),
        'accompaniment_pattern': 'pop_ballad',     # Arpège doux et mélancolique
    },
    'joyeux': {
        'tempo': (112, 140),
        'velocity': (70, 100),
        'note_density': 0.85,
        'note_length_beats': (0.25, 0.5),
        'accompaniment_pattern': 'bass_chord',     # Pulsion rythmique dynamique
    },
    'calme': {
        'tempo': (60, 80),
        'velocity': (40, 60),
        'note_density': 0.40,
        'note_length_beats': (1.0, 2.0),
        'accompaniment_pattern': 'alberti_bass',   # Motif classique très stable
    },
    'energique': {
        'tempo': (130, 160),
        'velocity': (85, 120),
        'note_density': 0.90,
        'note_length_beats': (0.25, 0.5),
        'accompaniment_pattern': 'bass_chord',
    },
}


def get_params(emotion: str) -> dict:
    if emotion not in EMOTION_PARAMS:
        raise ValueError(f"Émotion inconnue: {emotion}. Choix possibles: {list(EMOTION_PARAMS)}")
    return EMOTION_PARAMS[emotion]
