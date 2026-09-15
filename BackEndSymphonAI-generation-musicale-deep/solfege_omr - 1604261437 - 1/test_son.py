# test_son.py
# Lance ce fichier pour tester le son piano avant tout le reste

from music_model import Note, Silence, Mesure, Partition, position_vers_note_sol
from audio_synthesizer import partition_vers_audio, jouer_audio, sauvegarder_wav

# --- Test 1 : Vérifier le mapping des positions ---
print("=== TEST POSITIONS ===")
for pos in range(-2, 8):
    note, octave = position_vers_note_sol(pos)
    print(f"  Position {pos:+d} → {note}{octave}")

# --- Test 2 : Jouer Do-Ré-Mi-Fa-Sol ---
print("\n=== TEST AUDIO : Do-Ré-Mi-Fa-Sol ===")

partition = Partition(tempo=90, cle='sol')
mesure = Mesure(4, 4)

notes_test = [
    ('Mi', 4), ('Mi', 4), ('Mi', 4), ('Mi', 4), ('Mi', 4),
    ('Mi', 4), ('Sol', 4), ('Sol', 4), ('Fa', 4),
    ('Mi', 4), ('Mi', 4), ('Mi', 4), ('Do', 4), ('Do', 4),
    ('Si', 3), ('Do', 4), ('Re', 4),
    ('Mi', 4), ('Re', 4), ('Re', 4), ('Do', 4),
    ('Re', 4), ('Re', 4), ('Re', 4), ('Mi', 4), ('Mi', 4),
    ('Mi', 4), ('Mi', 4), ('Mi', 4), ('Mi', 4),
    ('La', 4), ('La', 4), ('Sol', 4), ('Fa', 4), ('Fa', 4), ('Fa', 4),
    ('Re', 4), ('Sol', 4), ('Fa', 4),
    ('Mi', 4), ('Mi', 4), ('Do', 4), ('Do', 4), ('Do', 4),
    ('Si', 3), ('Do', 4)
]

for nom, octave in notes_test:
    mesure.ajouter(Note(nom, octave, duree=0.5))

partition.ajouter_mesure(mesure)

# Afficher les fréquences calculées
for el in partition.toutes_les_notes():
    print(f"  {el}")

# Générer et jouer
audio = partition_vers_audio(partition)
jouer_audio(audio)
sauvegarder_wav(audio, "test_do_re_mi.wav")