"""
Génère un corpus d'entraînement synthétique pour le prédicteur de pas mélodiques.

Au lieu d'un petit jeu de motifs écrits à la main et transposés (v1), on
fait tourner un "professeur" (teacher policy) qui combine :
  - la chaîne de Markov d'intervalles déjà présente dans melody_generator.py
    (loi de compensation des sauts) — jusqu'ici jamais réellement utilisée
    dans la génération de mélodie !
  - une préférence pour les notes de l'accord en cours sur les temps forts
  - une légère dérive dirigée vers un "climax" de phrase

...et ce sur TOUTES les combinaisons (12 tonalités x 2 modes x tous les
genres/émotions x toutes les progressions déjà définies dans
chord_library.py). Le corpus obtenu est donc bien plus large et bien plus
diversifié qu'un jeu de motifs fixes, sans qu'on ait à en écrire un seul
à la main.

Représentation clé : on travaille en INTERVALLES DIATONIQUES relatifs
(pas de gamme, pas des notes MIDI absolues). C'est ce qui rend le modèle
entraîné ensuite indépendant de la tonalité.
"""
import random
from theory import roman_to_chord, scale_notes
from chord_library import PROGRESSIONS, get_progression
from melody_generator import MARKOV_TRANSITIONS, DEFAULT_TRANSITION

KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
MODES = ['major', 'minor']
INTERVAL_CLASSES = [-3, -2, -1, 0, 1, 2, 3]  # doit rester synchro avec custom_dl_melody.py
SEQ_LEN = 8


def _build_scale(key: str, mode: str) -> list[int]:
    scale_type = 'major' if mode == 'major' else 'natural_minor'
    return (scale_notes(key, scale_type, 4) +
            scale_notes(key, scale_type, 5) +
            scale_notes(key, scale_type, 6))


def _chord_tone_indices(scale: list[int], chord_tones: list[int]) -> set[int]:
    """Indices dans `scale` qui tombent sur une note de l'accord (classe de hauteur)."""
    chord_pcs = {p % 12 for p in chord_tones}
    return {i for i, p in enumerate(scale) if p % 12 in chord_pcs}


def _teacher_next_interval(prev_interval: int, is_strong_beat: bool, chord_tone_idx_set: set[int],
                            current_idx: int, scale_len: int, climax_direction: int) -> int:
    """Politique 'professeur' : Markov existant + biais accord + biais climax."""
    base_weights = dict(MARKOV_TRANSITIONS.get(prev_interval, DEFAULT_TRANSITION))

    weighted = {}
    for interval, w in base_weights.items():
        target_idx = current_idx + interval
        weight = float(w)

        # Légère préférence pour continuer vers le climax de la phrase
        if climax_direction != 0 and (interval == 0 or (interval > 0) == (climax_direction > 0)):
            weight *= 1.15

        # Sur un temps fort : bonus si la cible tombe sur une note de l'accord
        if is_strong_beat and 0 <= target_idx < scale_len and target_idx in chord_tone_idx_set:
            weight *= 2.2

        # Pénalité si on sort de la tessiture utilisable
        if not (0 <= target_idx < scale_len):
            weight *= 0.05

        weighted[interval] = weight

    intervals = list(weighted.keys())
    weights = list(weighted.values())
    return random.choices(intervals, weights=weights, k=1)[0]


def generate_examples(num_walks_per_combo: int = 6, walk_length: int = 48,
                       seed: int | None = None) -> tuple[list, list]:
    """
    Renvoie (X, y) :
      X : fenêtres de SEQ_LEN pas de temps, chaque pas =
          [one-hot(intervalle, 7), is_chord_tone(0/1), is_strong_beat(0/1)] -> 9 features
      y : indice de classe (0..6) de l'intervalle suivant (mappé sur INTERVAL_CLASSES)
    """
    if seed is not None:
        random.seed(seed)

    X, y = [], []
    combos = list(PROGRESSIONS.keys())  # (genre, emotion)

    for key in KEYS:
        for mode in MODES:
            for genre, emotion in combos:
                progression = get_progression(genre, emotion, mode)
                scale = _build_scale(key, mode)
                chords_midi = [roman_to_chord(r, key, mode) for r in progression]

                for _walk in range(num_walks_per_combo):
                    current_idx = len(scale) // 2
                    climax_direction = random.choice([-1, 1])
                    prev_interval = 0
                    history = []  # (interval, is_chord_tone, is_strong_beat)

                    for step in range(walk_length):
                        bar_idx = step // 4
                        beat_in_bar = step % 4
                        is_strong_beat = beat_in_bar in (0, 2)

                        chord_tones = chords_midi[bar_idx % len(chords_midi)]
                        chord_idx_set = _chord_tone_indices(scale, chord_tones)

                        interval = _teacher_next_interval(
                            prev_interval, is_strong_beat, chord_idx_set,
                            current_idx, len(scale), climax_direction
                        )
                        target_idx = max(0, min(len(scale) - 1, current_idx + interval))
                        is_chord_tone_now = target_idx in chord_idx_set

                        history.append((interval, is_chord_tone_now, is_strong_beat))

                        if len(history) > SEQ_LEN:
                            window = history[-(SEQ_LEN + 1):-1]
                            target_interval = history[-1][0]

                            features = []
                            for (iv, is_ct, is_sb) in window:
                                one_hot = [0.0] * len(INTERVAL_CLASSES)
                                one_hot[INTERVAL_CLASSES.index(iv)] = 1.0
                                one_hot += [1.0 if is_ct else 0.0, 1.0 if is_sb else 0.0]
                                features.append(one_hot)

                            X.append(features)
                            y.append(INTERVAL_CLASSES.index(target_interval))

                        current_idx = target_idx
                        prev_interval = interval

    return X, y