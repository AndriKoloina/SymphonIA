"""
Bibliothèque de progressions d'accords, indexée par (genre, émotion).

C'est le coeur de la connaissance "théorie musicale" du système.
Ajoute autant de variantes que tu veux ici : plus il y en a par catégorie,
plus la génération sera variée d'un appel à l'autre.
"""
import random

PROGRESSIONS = {
    ('classique', 'triste'): [
        ['i', 'iv', 'V', 'i'],
        ['i', 'VI', 'III', 'VII'],
        ['i', 'iv', 'VII', 'III'],
        ['i', 'V', 'iv', 'i'],
    ],
    ('classique', 'joyeux'): [
        ['I', 'IV', 'V', 'I'],
        ['I', 'vi', 'IV', 'V'],
        ['I', 'V', 'vi', 'IV'],
    ],
    ('classique', 'calme'): [
        ['I', 'iii', 'IV', 'I'],
        ['I', 'vi', 'ii', 'V'],
    ],
    ('pop', 'joyeux'): [
        ['I', 'V', 'vi', 'IV'],
        ['I', 'IV', 'V', 'I'],
        ['vi', 'IV', 'I', 'V'],
    ],
    ('pop', 'triste'): [
        ['vi', 'IV', 'I', 'V'],
        ['i', 'VI', 'III', 'VII'],
    ],
    ('jazz', 'calme'): [
        ['ii7', 'V7', 'I7', 'I7'],
        ['I7', 'vi', 'ii7', 'V7'],
    ],
    ('jazz', 'triste'): [
        ['ii°7', 'V7', 'i7', 'i7'],
        ['i7', 'iv7', 'V7', 'i7'],
    ],
}


def get_progression(genre: str, emotion: str, mode: str) -> list[str]:
    key = (genre, emotion)
    if key in PROGRESSIONS:
        return random.choice(PROGRESSIONS[key])

    # Repli 1 : Rechercher une progression du même genre
    same_genre_keys = [k for k in PROGRESSIONS if k[0] == genre]
    if same_genre_keys:
        return random.choice(PROGRESSIONS[random.choice(same_genre_keys)])

    # Repli 2 : Par mode
    fallback_key = ('classique', 'triste') if mode == 'minor' else ('classique', 'joyeux')
    return random.choice(PROGRESSIONS[fallback_key])
