"""
Bibliothèque de progressions d'accords, indexée par (genre, emotion, mode).

En séparant explicitement les modes 'major' et 'minor', on évite les
aberrations harmoniques et les dissonances mélodiques.
"""
import random

PROGRESSIONS = {
    # --- CLASSIQUE ---
    ('classique', 'triste', 'minor'): [
        ['i', 'iv', 'V', 'i'], 
        ['i', 'VI', 'III', 'VII']
    ],
    ('classique', 'triste', 'major'): [
        ['vi', 'iii', 'IV', 'V']
    ], # Tristesse relative en majeur
    ('classique', 'joyeux', 'major'): [
        ['I', 'IV', 'V', 'I'], 
        ['I', 'vi', 'IV', 'V']
    ],
    ('classique', 'calme', 'major'): [
        ['I', 'iii', 'IV', 'I'], 
        ['I', 'vi', 'ii', 'V']
    ],
    # --- POP ---
    ('pop', 'joyeux', 'major'): [
        ['I', 'V', 'vi', 'IV'], 
        ['I', 'IV', 'V', 'I']
    ],
    ('pop', 'triste', 'minor'): [
        ['i', 'VI', 'III', 'VII'], 
        ['vi', 'IV', 'I', 'V']
    ], # vi est traité comme i en mineur relatif
    # --- JAZZ ---
    ('jazz', 'calme', 'major'): [
        ['ii7', 'V7', 'I7', 'I7'], 
        ['I7', 'vi', 'ii7', 'V7']
    ],
    ('jazz', 'triste', 'minor'): [
        ['ii°7', 'V7', 'i7', 'i7'], 
        ['i7', 'iv7', 'V7', 'i7']
    ],
    # --- BLUES ---
    ('blues', 'triste', 'minor'): [
        ['i', 'iv', 'i', 'V7'], 
        ['i7', 'iv7', 'v7', 'i7']
    ],
    ('blues', 'joyeux', 'major'): [
        ['I', 'IV', 'I', 'V'], 
        ['I7', 'IV7', 'I7', 'V7']
    ],
    # --- ROCK ---
    ('rock', 'energique', 'major'): [
        ['I', 'IV', 'vi', 'V']
    ],
    ('rock', 'energique', 'minor'): [
        ['i', 'VI', 'III', 'VII']
    ],
    # --- CINÉMATIQUE ---
    ('cinematique', 'energique', 'minor'): [
        ['i', 'VI', 'III', 'VII'], 
        ['i', 'iv', 'VII', 'III']
    ],
    # L'équivalent majeur de l'épique, souvent utilisé dans les thèmes de triomphe (ex: Avengers)
    ('cinematique', 'energique', 'major'): [
        ['I', 'V', 'vi', 'IV'], 
        ['I', 'bVII', 'IV', 'I']
    ], 
    ('cinematique', 'triste', 'minor'): [
        ['i', 'VI', 'iv', 'V']
    ],
    ('cinematique', 'calme', 'major'): [
        ['I', 'IV', 'I', 'IV']
    ],
}

def get_progression(genre: str, emotion: str, mode: str) -> list[str]:
    key = (genre, emotion, mode)
    if key in PROGRESSIONS:
        return random.choice(PROGRESSIONS[key])

    # Repli 1 : Rechercher une progression du même genre et même mode
    same_genre_mode = [k for k in PROGRESSIONS if k[0] == genre and k[2] == mode]
    if same_genre_mode:
        return random.choice(PROGRESSIONS[random.choice(same_genre_mode)])

    # Repli 2 : Par mode uniquement
    fallback_key = ('classique', 'triste', 'minor') if mode == 'minor' else ('classique', 'joyeux', 'major')
    return random.choice(PROGRESSIONS[fallback_key])