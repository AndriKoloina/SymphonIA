# test_pdf.py
# ============================================================
# Test de chargement PDF et détection de portées
# ============================================================

import sys
from pdf_loader import pdf_vers_images, binariser, sauvegarder_image
from portee_detector import (detecter_lignes_horizontales, regrouper_lignes,
                              grouper_en_portees, InfoPortee)
from music_model import position_vers_note_sol, position_vers_note_fa


def tester_pdf(chemin_pdf: str):
    print("=" * 50)
    print("ÉTAPE 1 : Chargement du PDF")
    print("=" * 50)
    images = pdf_vers_images(chemin_pdf)

    # On travaille sur la première page
    image = images[0]
    print(f"Image originale : {image.shape}")

    # Sauvegarder pour inspection
    sauvegarder_image(image, "debug_01_original.png")

    print("\n" + "=" * 50)
    print("ÉTAPE 2 : Binarisation")
    print("=" * 50)
    image_bin = binariser(image)
    sauvegarder_image(image_bin, "debug_02_binaire.png")
    print("✓ Image binarisée sauvegardée")

    print("\n" + "=" * 50)
    print("ÉTAPE 3 : Détection des lignes")
    print("=" * 50)
    lignes_brutes = detecter_lignes_horizontales(image_bin)
    print(f"  Lignes brutes détectées : {len(lignes_brutes)}")

    lignes = regrouper_lignes(lignes_brutes)
    print(f"  Après regroupement     : {len(lignes)} lignes")
    print(f"  Positions y            : {lignes}")

    print("\n" + "=" * 50)
    print("ÉTAPE 4 : Groupement en portées")
    print("=" * 50)
    portees_y = grouper_en_portees(lignes)
    print(f"  Portées détectées : {len(portees_y)}")

    portees = []
    for i, p_y in enumerate(portees_y):
        info = InfoPortee(p_y, cle='sol')
        portees.append(info)
        print(f"\n  Portée {i+1} : {info}")

        print("  Test de mapping position → note :")
        for pos in range(0, 7):
            note, octave = position_vers_note_sol(pos)
            print(f"    Position {pos} → {note}{octave}")

    return portees


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_pdf.py ma_partition.pdf")
        print("\n💡 Tu n'as pas encore de partition PDF ?")
        print("   Télécharge une partition simple sur :")
        print("   https://www.mutopiaproject.org/")
        print("   (partitions libres de droits)")
    else:
        tester_pdf(sys.argv[1])