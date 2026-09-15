"""
Prédicteur de pas mélodiques (intervalles diatoniques) via LSTM.

Contrairement à la v1, le modèle ne prédit plus une note MIDI absolue
(0-127) mais un INTERVALLE DIATONIQUE relatif (-3..+3 pas de gamme). Cette
représentation est intrinsèquement indépendante de la tonalité : le même
modèle fonctionne correctement dans n'importe quelle tonalité, sans
transposition bricolée en entrée/sortie (c'était la source de la
dissonance observée précédemment).

Ce module est utilisé par melody_generator.py comme "moteur de décision"
optionnel : à chaque pas, generate_melody() lui demande "je monte, je
descends, ou je reste ?", exactement comme il le ferait avec la chaîne de
Markov, mais avec un modèle appris sur un corpus bien plus large.
"""
import numpy as np
from tensorflow.keras.models import load_model

INTERVAL_CLASSES = [-3, -2, -1, 0, 1, 2, 3]  # doit rester synchro avec dataset_generator.py
SEQ_LEN = 8
NUM_FEATURES = len(INTERVAL_CLASSES) + 2  # one-hot intervalle + is_chord_tone + is_strong_beat

try:
    model = load_model("lstm_melody_model.h5")
except Exception:
    model = None
    print("Attention: Modèle LSTM non trouvé ou incompatible. Lancez train_model.py d'abord.")


def _encode_frame(interval: int, is_chord_tone: bool, is_strong_beat: bool) -> list[float]:
    one_hot = [0.0] * len(INTERVAL_CLASSES)
    one_hot[INTERVAL_CLASSES.index(interval)] = 1.0
    one_hot += [1.0 if is_chord_tone else 0.0, 1.0 if is_strong_beat else 0.0]
    return one_hot


class MelodyStepPredictor:
    """
    Maintient une fenêtre de contexte glissante pour la génération pas à
    pas d'une mélodie. Un objet = une "ligne mélodique" en cours de
    composition (typiquement une section : couplet, refrain...).
    """

    def __init__(self):
        self.window = [_encode_frame(0, False, False) for _ in range(SEQ_LEN)]

    @property
    def is_available(self) -> bool:
        return model is not None

    def push(self, interval: int, is_chord_tone: bool, is_strong_beat: bool) -> None:
        self.window.append(_encode_frame(interval, is_chord_tone, is_strong_beat))
        self.window = self.window[-SEQ_LEN:]

    def predict_next_interval(self, temperature: float = 1.0) -> int:
        """Échantillonne le prochain intervalle avec une température
        (1.0 = distribution du modèle telle quelle, >1 = plus surprenant,
        <1 = plus prévisible). Remplace l'argmax figé de la v1."""
        if model is None:
            return 0

        x_input = np.array([self.window], dtype=np.float32)
        probs = model.predict(x_input, verbose=0)[0]

        probs = np.clip(probs, 1e-9, None)
        logits = np.log(probs) / max(temperature, 1e-3)
        exp_logits = np.exp(logits - np.max(logits))
        sampling_probs = exp_logits / np.sum(exp_logits)

        class_idx = int(np.random.choice(len(sampling_probs), p=sampling_probs))
        return INTERVAL_CLASSES[class_idx]