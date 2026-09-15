"""
Entraîne le prédicteur de pas mélodiques.

Changement majeur par rapport à la v1 : le modèle ne prédit plus une note
MIDI absolue (128 classes, ancré sur Do) mais un INTERVALLE DIATONIQUE
relatif (-3 à +3 pas de gamme, 7 classes), conditionné par le contexte
harmonique (note d'accord ou non, temps fort ou faible). Cette
représentation est indépendante de la tonalité : plus besoin de bricoler
une transposition à la génération, et le problème à 7 classes s'apprend
bien mieux que celui à 128 classes avec un jeu de données de cette taille.
"""
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.utils import to_categorical

from dataset_generator import generate_examples, INTERVAL_CLASSES, SEQ_LEN

NUM_CLASSES = len(INTERVAL_CLASSES)   # 7
NUM_FEATURES = NUM_CLASSES + 2        # one-hot intervalle + is_chord_tone + is_strong_beat

print("Génération du corpus d'entraînement synthétique (12 tonalités x tous les genres/émotions)...")
X_list, y_list = generate_examples(num_walks_per_combo=6, walk_length=48, seed=42)
print(f"{len(X_list)} exemples générés.")

X = np.array(X_list, dtype=np.float32)          # (N, SEQ_LEN, NUM_FEATURES)
y = to_categorical(y_list, num_classes=NUM_CLASSES)

model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, NUM_FEATURES)),
    Dropout(0.2),
    LSTM(48, return_sequences=False),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(NUM_CLASSES, activation='softmax'),  # prédit un INTERVALLE, pas une note MIDI absolue
])

model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

print("Entraînement...")
model.fit(X, y, epochs=40, batch_size=64, validation_split=0.1, verbose=1)

model.save("lstm_melody_model.h5")
print("Modèle sauvegardé sous 'lstm_melody_model.h5'.")
print("ATTENTION : ce fichier remplace l'ancien modèle (architecture différente,")
print("il n'est PAS compatible avec l'ancienne version de custom_dl_melody.py).")