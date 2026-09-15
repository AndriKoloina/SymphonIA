# pdf_loader.py
# ============================================================
# Convertit un PDF de partition en images exploitables
# Bibliothèque : PyMuPDF (fitz)
# ============================================================
import os
import fitz  # PyMuPDF
import numpy as np
from PIL import Image

# Résolution de rendu — 300 DPI est le standard pour les partitions
# Plus c'est élevé, plus les détails sont nets (mais plus lourd)
DPI = 300
ZOOM = DPI / 72  # 72 DPI est la base de PyMuPDF


def pdf_vers_images(chemin_pdf: str) -> list[np.ndarray]:
    """
    Charge un PDF et convertit chaque page en image numpy (niveaux de gris).

    Retourne: liste d'images numpy shape (hauteur, largeur) uint8
    """
    document = fitz.open(chemin_pdf)
    images = []

    print(f"📄 PDF chargé : {document.page_count} page(s)")

    for numero_page in range(document.page_count):
        page = document[numero_page]

        # Matrice de zoom pour augmenter la résolution
        matrice = fitz.Matrix(ZOOM, ZOOM)

        # Rendu de la page en pixels (RGB)
        pixmap = page.get_pixmap(matrix=matrice)

        # Conversion en tableau numpy
        img_array = np.frombuffer(pixmap.samples, dtype=np.uint8)
        img_array = img_array.reshape(pixmap.height, pixmap.width, pixmap.n)

        # Convertir en niveaux de gris si nécessaire
        if pixmap.n == 4:  # RGBA
            img_pil = Image.fromarray(img_array, 'RGBA').convert('L')
        elif pixmap.n == 3:  # RGB
            img_pil = Image.fromarray(img_array, 'RGB').convert('L')
        else:
            img_pil = Image.fromarray(img_array)

        img_gris = np.array(img_pil)
        images.append(img_gris)
        print(f"  ✓ Page {numero_page + 1} : {img_gris.shape[1]}×{img_gris.shape[0]} pixels")

    document.close()
    return images


def binariser(image: np.ndarray, seuil: int = 128) -> np.ndarray:
    """
    Convertit l'image en noir et blanc pur (binarisation).
    Pixels < seuil → 0 (noir)
    Pixels ≥ seuil → 255 (blanc)

    C'est crucial pour la détection des lignes :
    les portées sont des lignes noires sur fond blanc.
    """
    binaire = np.where(image < seuil, 0, 255).astype(np.uint8)
    return binaire


# def sauvegarder_image(image: np.ndarray, chemin: str):
#     """Sauvegarde une image numpy en fichier PNG pour inspection visuelle."""
#     Image.fromarray(image).save(chemin)
#     print(f"🖼️  Image sauvegardée : {chemin}")

def sauvegarder_image(image: np.ndarray, chemin: str):
    """Sauvegarde une image numpy en créant le dossier si nécessaire."""
    # Extraire le dossier du chemin (ex: 'debug' de 'debug/image.png')
    dossier = os.path.dirname(chemin)
    
    # Si un dossier est spécifié et qu'il n'existe pas, on le crée
    if dossier and not os.path.exists(dossier):
        os.makedirs(dossier)
        print(f"📁 Dossier créé : {dossier}")

    # Sauvegarde
    Image.fromarray(image).save(chemin)
    print(f"🖼️  Image sauvegardée : {chemin}")