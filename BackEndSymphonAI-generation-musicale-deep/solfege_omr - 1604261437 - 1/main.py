# main.py
import sys
import numpy as np

from pdf_loader import pdf_vers_images, binariser, sauvegarder_image
from portee_detector import (detecter_lignes_horizontales, regrouper_lignes,
                              grouper_en_portees, InfoPortee)
from note_recognizer import (detecter_notes_dans_portee,
                              associer_notes_portees,
                              dessiner_detection)
from music_model import Note, Mesure, Partition
from audio_synthesizer import partition_vers_audio, jouer_audio, sauvegarder_wav


def traiter_partition(chemin_pdf: str):

    # ══ ÉTAPE 1 : PDF → Image ══════════════════════════════
    print("\n═══ ÉTAPE 1 : Chargement du PDF ═══")
    images    = pdf_vers_images(chemin_pdf)
    image     = images[0]
    image_bin = binariser(image)
    sauvegarder_image(image,     "debug_01_original.png")
    sauvegarder_image(image_bin, "debug_02_binaire.png")
    print(f"  Image : {image.shape[1]}×{image.shape[0]}px")

    # ══ ÉTAPE 2 : Portées ══════════════════════════════════
    print("\n═══ ÉTAPE 2 : Détection des portées ═══")
    lignes   = regrouper_lignes(detecter_lignes_horizontales(image_bin))
    portees_y = grouper_en_portees(lignes)

    if not portees_y:
        print("  ❌ Aucune portée détectée.")
        return

    portees = [InfoPortee(p, cle='sol') for p in portees_y]
    print(f"  ✓ {len(portees)} portée(s)")
    for i, p in enumerate(portees):
        print(f"    Portée {i+1} : espacement={p.espacement:.1f}px")

    # ══ ÉTAPE 3 : Détection des notes ══════════════════════
    print("\n═══ ÉTAPE 3 : Détection des notes ═══")
    print("  (traitement zone par zone — rapide)")

    toutes_tetes = []
    for i, portee in enumerate(portees):
        print(f"  Portée {i+1}...", end=' ')
        tetes = detecter_notes_dans_portee(image_bin, portee)
        print(f"{len(tetes)} candidat(s)")
        toutes_tetes.extend(tetes)

    print(f"\n  Total candidats : {len(toutes_tetes)}")

    # ══ ÉTAPE 4 : Position → Note ══════════════════════════
    print("\n═══ ÉTAPE 4 : Reconnaissance ═══")
    notes = associer_notes_portees(toutes_tetes, portees)
    print(f"  Notes reconnues : {len(notes)}")
    for i, n in enumerate(notes):
        print(f"    {i+1:3}. {n['nom']}{n['octave']}"
              f"  pos={n['position']:+d}"
              f"  x={n['cx']:.0f}px")

    # ══ ÉTAPE 5 : Image debug ══════════════════════════════
    debug = dessiner_detection(image, toutes_tetes, portees, notes)
    sauvegarder_image(debug, "debug_03_detection.png")
    print("\n  🖼️  debug_03_detection.png")
    print("      Bleu=portées  Vert=candidats  Rouge=notes reconnues")

    # ══ ÉTAPE 6 : Audio ════════════════════════════════════
    if not notes:
        print("\n  ❌ Pas de notes à jouer.")
        return

    print("\n═══ ÉTAPE 6 : Audio ═══")
    partition = Partition(tempo=90, cle='sol')
    mesure    = Mesure(4, 4)
    for n in notes:
        mesure.ajouter(Note(n['nom'], n['octave'], duree=0.4))
    partition.ajouter_mesure(mesure)

    audio = partition_vers_audio(partition)
    sauvegarder_wav(audio, "partition_detectee.wav")
    jouer_audio(audio)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage : python main.py ma_partition.pdf")
    else:
        traiter_partition(sys.argv[1])