# note_recognizer.py - Version 4 : Effacement intelligent + zones restreintes
# ============================================================
# Approche :
#   1. Travailler UNIQUEMENT dans les zones des portées (rapide)
#   2. Effacer les lignes de portée pixel par pixel (intelligent)
#   3. Détecter les blobs restants (notes isolées propres)
# ============================================================

import numpy as np
from portee_detector import InfoPortee
from music_model import position_vers_note_sol, position_vers_note_fa


# ─────────────────────────────────────────────────────────
# ÉTAPE 1 : Extraire la zone d'une portée
# ─────────────────────────────────────────────────────────

def extraire_zone_portee(image_bin: np.ndarray,
                          portee: InfoPortee,
                          nb_lignes_supp: int = 4) -> tuple[np.ndarray, int]:
    """
    Extrait la sous-image correspondant à une portée + marges.

    On ne travaille que sur cette zone — pas sur toute la page.
    Cela élimine d'office les titres, textes, et autres portées.

    Arguments:
        image_bin      : image binarisée complète
        portee         : portée dont on veut la zone
        nb_lignes_supp : nombre de lignes supplémentaires à inclure
                         au-dessus et en-dessous (défaut 4)

    Retourne:
        (sous_image, y_offset) où y_offset est le y du bord haut
        dans l'image originale (pour recalculer les coordonnées)
    """
    marge = int(portee.espacement * nb_lignes_supp)

    y_haut = max(0, portee.lignes_y[0] - marge)
    y_bas  = min(image_bin.shape[0], portee.lignes_y[4] + marge)

    sous_image = image_bin[y_haut:y_bas, :].copy()
    return sous_image, y_haut


# ─────────────────────────────────────────────────────────
# ÉTAPE 2 : Effacement intelligent des lignes de portée
# ─────────────────────────────────────────────────────────

def supprimer_lignes_intelligente(image_bin: np.ndarray,
                                   lignes_y_locales: list[int],
                                   epaisseur: int = 3) -> np.ndarray:
    """
    Supprime les lignes de portée en préservant les pixels des notes.

    Règle pixel par pixel sur chaque ligne de portée :
    - Pixel noir dont les voisins haut ET bas sont blancs
      → appartient uniquement à la ligne → EFFACER (mettre à 255)
    - Pixel noir avec au moins un voisin vertical noir
      → fait partie d'une note ou d'un symbole → GARDER

    Arguments:
        image_bin      : sous-image binarisée (zone d'une portée)
        lignes_y_locales : positions y des lignes DANS la sous-image
        epaisseur      : rayon de recherche autour de chaque ligne (pixels)

    Retourne: image nettoyée (copie)
    """
    resultat = image_bin.copy()
    h, w = resultat.shape

    for y_ligne in lignes_y_locales:
        # Traiter les pixels dans l'épaisseur de la ligne
        for y in range(max(0, y_ligne - epaisseur),
                       min(h, y_ligne + epaisseur + 1)):
            for x in range(w):
                if resultat[y, x] != 0:
                    continue  # Déjà blanc → ignorer

                # Vérifier les voisins verticaux
                voisin_haut = resultat[y - 1, x] if y > 0 else 255
                voisin_bas  = resultat[y + 1, x] if y < h - 1 else 255

                # Si les deux voisins verticaux sont blancs
                # → ce pixel n'est là qu'à cause de la ligne → effacer
                if voisin_haut == 255 and voisin_bas == 255:
                    resultat[y, x] = 255

    return resultat


def supprimer_lignes_intelligente_rapide(image_bin: np.ndarray,
                                         lignes_y_locales: list[int],
                                         epaisseur: int = 3) -> np.ndarray:
    """
    Supprime les lignes en utilisant un seuil de hauteur vertical.
    On efface les segments noirs qui sont plus courts que le seuil,
    mais UNIQUEMET autour des lignes de portée détectées.
    """
    resultat = image_bin.copy()
    h, w = resultat.shape
    
    # Ton idée : le seuil de hauteur (ex: 0.3 fois l'épaisseur/espacement)
    # Si le segment noir vertical est plus petit que ce seuil, c'est une ligne.
    seuil_hauteur = epaisseur 

    for y_ligne in lignes_y_locales:
        # On définit une zone de travail autour de la ligne
        y1 = max(0, y_ligne - 2)
        y2 = min(h, y_ligne + 3)
        
        for x in range(w):
            # On ne regarde que si le pixel est noir sur la ligne détectée
            if resultat[y_ligne, x] == 0:
                # On mesure la hauteur du segment noir vertical à cet endroit précis (x)
                # On regarde un peu au-dessus et en-dessous
                segment = resultat[y_ligne - seuil_hauteur : y_ligne + seuil_hauteur + 1, x]
                nb_pixels_noirs = np.sum(segment == 0)
                
                # SI le segment noir est trop court (inférieur au seuil)
                # ALORS c'est probablement juste la ligne de portée isolée.
                if nb_pixels_noirs <= seuil_hauteur:
                    resultat[y_ligne, x] = 255
                    # On nettoie aussi les pixels adjacents si la ligne est épaisse
                    if y_ligne + 1 < h: resultat[y_ligne + 1, x] = 255
                    if y_ligne - 1 >= 0: resultat[y_ligne - 1, x] = 255

    return resultat


# def supprimer_lignes_intelligente_rapide(image_bin: np.ndarray,
#                                           lignes_y_locales: list[int],
#                                           epaisseur: int = 3) -> np.ndarray:
#     """
#     Version vectorisée (numpy) de l'effacement intelligent.
#     Beaucoup plus rapide que la version avec double boucle Python.

#     Même logique : effacer les pixels noirs dont les voisins
#     haut ET bas sont blancs.
#     """
#     resultat = image_bin.copy()
#     h, w = resultat.shape

#     for y_ligne in lignes_y_locales:
#         y1 = max(1, y_ligne - epaisseur)
#         y2 = min(h - 1, y_ligne + epaisseur + 1)

#         # Extraire la bande + voisins
#         bande      = resultat[y1:y2, :]          # pixels à traiter
#         voisin_haut = resultat[y1 - 1:y2 - 1, :] # ligne au-dessus
#         voisin_bas  = resultat[y1 + 1:y2 + 1, :] # ligne en-dessous

#         # Masque : pixel noir ET voisins haut+bas blancs → à effacer
#         masque_effacer = (
#             (bande == 0) &
#             (voisin_haut == 255) &
#             (voisin_bas  == 255)
#         )

#         resultat[y1:y2, :][masque_effacer] = 255

#     return resultat


# ─────────────────────────────────────────────────────────
# ÉTAPE 3 : Détection des blobs (composantes connexes)
# ─────────────────────────────────────────────────────────

def trouver_composantes(image_bin: np.ndarray) -> list[dict]:
    """
    Trouve toutes les îles de pixels noirs connectés.
    Algorithme flood fill itératif (sans récursion).

    Retourne: liste de dicts avec cx, cy, largeur, hauteur, surface
    """
    travail = image_bin.copy().astype(np.int32)
    h, w = travail.shape
    composantes = []

    for y in range(h):
        for x in range(w):
            if travail[y, x] != 0:
                continue

            pixels = []
            pile = [(y, x)]
            travail[y, x] = -1

            while pile:
                cy, cx = pile.pop()
                pixels.append((cy, cx))
                for ny, nx in [(cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)]:
                    if 0 <= ny < h and 0 <= nx < w and travail[ny,nx] == 0:
                        travail[ny, nx] = -1
                        pile.append((ny, nx))

            if len(pixels) < 3:
                continue

            ys = [p[0] for p in pixels]
            xs = [p[1] for p in pixels]
            y_min, y_max = min(ys), max(ys)
            x_min, x_max = min(xs), max(xs)

            composantes.append({
                'cx':      (x_min + x_max) / 2,
                'cy':      (y_min + y_max) / 2,
                'largeur': x_max - x_min + 1,
                'hauteur': y_max - y_min + 1,
                'surface': len(pixels),
                'x_min': x_min, 'x_max': x_max,
                'y_min': y_min, 'y_max': y_max,
            })

    return composantes


# ─────────────────────────────────────────────────────────
# ÉTAPE 4 : Filtrer les têtes de notes
# ─────────────────────────────────────────────────────────

def filtrer_tetes_notes(composantes: list[dict],
                         espacement: float) -> list[dict]:
    """
    Garde uniquement les blobs qui ressemblent à des têtes de notes.

    Après effacement intelligent des lignes et des hampes,
    les blobs restants sont soit des têtes de notes, soit
    des symboles (clé, chiffres, altérations...).

    Critères de filtrage :
    1. Taille : entre 35% et 130% de l'espacement
       → élimine bruit (trop petit) et gros symboles (trop grand)

    2. Forme ovale : ratio largeur/hauteur entre 0.5 et 2.2
       → une tête est à peu près ronde

    3. Compacité > 45% : surface / boîte englobante
       → élimine les formes creuses et les fragments de lignes

    4. Anti-dot : les deux dimensions > 30% de l'espacement
       → les points (noires pointées) sont trop petits
    """
    taille_min = espacement * 0.35
    taille_max = espacement * 1.30
    seuil_dot  = espacement * 0.30

    tetes = []
    for c in composantes:
        larg = c['largeur']
        haut = c['hauteur']

        # Critère 1 : taille raisonnable
        if not (taille_min <= larg <= taille_max):
            continue
        if not (taille_min <= haut <= taille_max):
            continue

        # Critère 4 : anti-dot
        if larg < seuil_dot or haut < seuil_dot:
            continue

        # Critère 2 : forme ovale
        ratio = larg / max(haut, 1)
        if not (0.5 <= ratio <= 2.2):
            continue

        # Critère 3 : compacité
        compacite = c['surface'] / max(larg * haut, 1)
        if compacite < 0.45:
            continue

        tetes.append(c)

    return tetes


# ─────────────────────────────────────────────────────────
# ÉTAPE 5 : Pipeline complet par portée
# ─────────────────────────────────────────────────────────

def detecter_notes_dans_portee(image_bin: np.ndarray,
                                portee: InfoPortee,
                                debug: bool = False) -> list[dict]:
    """
    Pipeline complet de détection pour UNE portée.

    1. Extraire la zone de la portée (élimine les titres/textes)
    2. Effacer les lignes intelligemment (préserve les notes)
    3. Supprimer les hampes (traits verticaux fins)
    4. Détecter les blobs restants
    5. Filtrer pour garder les têtes de notes
    6. Convertir les coordonnées locales → globales

    Arguments:
        image_bin : image binarisée complète de la page
        portee    : portée à analyser
        debug     : si True, sauvegarde les images intermédiaires

    Retourne: liste de dicts avec cx, cy (coordonnées globales),
              largeur, hauteur, surface
    """
    from pdf_loader import sauvegarder_image

    # ── Extraire la zone ────────────────────────────────
    zone, y_offset = extraire_zone_portee(image_bin, portee)

    # Coordonnées y des lignes dans la zone locale
    lignes_locales = [y - y_offset for y in portee.lignes_y]

    if debug:
        sauvegarder_image(zone, f"debug_zone_portee_{y_offset}.png")

    # ── Effacement intelligent des lignes ───────────────
    zone_propre = supprimer_lignes_intelligente_rapide(
        zone, lignes_locales, epaisseur=3
    )
    sauvegarder_image(zone_propre, f"debug_zone_suppr_portee_{y_offset}.png")

    # ── Supprimer les hampes (traits verticaux fins) ────
    zone_propre = supprimer_hampes(zone_propre, portee.espacement)
    sauvegarder_image(zone_propre, f"debug_zone_suppr_hampe_{y_offset}.png")

    if debug:
        sauvegarder_image(zone_propre, f"debug_zone_nettoyee_{y_offset}.png")

    # ── Détecter les blobs ──────────────────────────────
    composantes = trouver_composantes(zone_propre)

    # ── Filtrer les têtes de notes ──────────────────────
    # tetes_locales = filtrer_tetes_notes(composantes, portee.espacement)

    # ── Convertir en coordonnées globales ───────────────
    tetes_globales = []
    # for t in tetes_locales:
    for t in composantes: # Debug
        tete = t.copy()
        tete['cy']    += y_offset
        tete['y_min'] += y_offset
        tete['y_max'] += y_offset
        tetes_globales.append(tete)

    return tetes_globales


def supprimer_hampes(image_bin: np.ndarray,
                      espacement: float) -> np.ndarray:
    """
    Supprime les hampes (traits verticaux fins) colonne par colonne.

    Une hampe = run noir très fin horizontalement (1-3 pixels).
    On efface les runs noirs plus étroits que le seuil minimum
    d'une tête de note.
    """
    largeur_min = max(3, int(espacement * 0.35 * 0.8))
    resultat = image_bin.copy()
    h, w = resultat.shape

    for y in range(h):
        rangee = image_bin[y, :]
        noir = (rangee == 0).astype(np.int32)

        transitions = np.diff(np.concatenate([[0], noir, [0]]))
        debuts = np.where(transitions == 1)[0]
        fins   = np.where(transitions == -1)[0]

        for debut, fin in zip(debuts, fins):
            if (fin - debut) < largeur_min:
                resultat[y, debut:fin] = 255

    return resultat


# ─────────────────────────────────────────────────────────
# ÉTAPE 6 : Position → Note musicale
# ─────────────────────────────────────────────────────────

def associer_notes_portees(tetes: list[dict],
                            portees: list[InfoPortee]) -> list[dict]:
    """
    Pour chaque tête détectée, trouve sa portée et calcule la note.
    Trie le résultat de gauche à droite (ordre de lecture).
    """
    notes_detectees = []

    for tete in tetes:
        cy = tete['cy']
        cx = tete['cx']

        portee = trouver_portee_proche(float(cy), portees)
        if portee is None:
            continue

        position = portee.y_vers_position(float(cy))

        if portee.cle == 'sol':
            nom, octave = position_vers_note_sol(position)
        else:
            nom, octave = position_vers_note_fa(position)

        notes_detectees.append({
            'nom':      nom,
            'octave':   octave,
            'position': position,
            'cx':       float(cx),
            'cy':       float(cy),
            'portee':   portee,
        })

    notes_detectees.sort(key=lambda n: n['cx'])
    return notes_detectees


def trouver_portee_proche(y: float,
                           portees: list[InfoPortee],
                           marge: float = 2.5):
    """
    Trouve la portée dont la zone verticale couvre le y donné.
    """
    meilleure = None
    dist_min  = float('inf')

    for portee in portees:
        y_centre = (portee.lignes_y[0] + portee.lignes_y[4]) / 2
        distance = abs(y - y_centre)
        zone     = (portee.lignes_y[4] - portee.lignes_y[0]) / 2
        zone_ext = zone + marge * portee.espacement

        if distance <= zone_ext and distance < dist_min:
            dist_min  = distance
            meilleure = portee

    return meilleure


# ─────────────────────────────────────────────────────────
# VISUALISATION DEBUG
# ─────────────────────────────────────────────────────────

def dessiner_detection(image_gris: np.ndarray,
                        tetes: list[dict],
                        portees: list[InfoPortee],
                        notes: list[dict]) -> np.ndarray:
    """
    Image debug en couleur :
    - Bleu  : lignes de portée détectées
    - Vert  : têtes de notes candidates (avant association)
    - Rouge : notes reconnues (après association portée + nom)
    """
    h, w = image_gris.shape
    debug = np.stack([image_gris] * 3, axis=-1).copy()

    # Portées en bleu
    for portee in portees:
        for y_ligne in portee.lignes_y:
            y1 = max(0, y_ligne - 1)
            y2 = min(h, y_ligne + 2)
            debug[y1:y2, :] = [100, 100, 255]

    # Candidats en vert
    for t in tetes:
        y1 = max(0, int(t['y_min']))
        y2 = min(h, int(t['y_max']))
        x1 = max(0, int(t['x_min']))
        x2 = min(w, int(t['x_max']))
        debug[y1:y2, x1:x1+2]   = [0, 200, 0]
        debug[y1:y2, x2-1:x2+1] = [0, 200, 0]
        debug[y1:y1+2, x1:x2]   = [0, 200, 0]
        debug[y2-1:y2+1, x1:x2] = [0, 200, 0]

    # Notes reconnues en rouge
    for note in notes:
        cx = int(note['cx'])
        cy = int(note['cy'])
        r = 10
        for angle in range(0, 360, 5):
            rad = angle * np.pi / 180
            px = int(cx + r * np.cos(rad))
            py = int(cy + r * np.sin(rad))
            if 0 <= py < h and 0 <= px < w:
                debug[py, px] = [255, 0, 0]

    return debug