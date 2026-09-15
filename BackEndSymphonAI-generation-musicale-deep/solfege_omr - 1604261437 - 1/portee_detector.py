# portee_detector.py
# ============================================================
# Détecte les lignes de portée dans une image de partition
# Bibliothèque : numpy uniquement (pas d'OpenCV pour l'instant)
# ============================================================

import numpy as np


def detecter_lignes_horizontales(image_binaire: np.ndarray,
                                  seuil_noir: float = 0.4) -> list[int]:
    """
    Détecte toutes les lignes horizontales noires dans l'image.

    Principe : une ligne de portée = une rangée de pixels
    où la majorité des pixels sont noirs (valeur 0).

    On calcule pour chaque rangée (row) la proportion de pixels noirs.
    Si cette proportion dépasse le seuil → c'est une ligne.

    Arguments:
        image_binaire : image noir/blanc numpy (0 ou 255)
        seuil_noir    : proportion minimale de pixels noirs (0.0 à 1.0)

    Retourne: liste des numéros de rangées (y) qui sont des lignes
    """
    largeur = image_binaire.shape[1]
    lignes = []

    for y in range(image_binaire.shape[0]):
        rangee = image_binaire[y, :]
        proportion_noire = np.sum(rangee == 0) / largeur

        if proportion_noire >= seuil_noir:
            lignes.append(y)

    return lignes


def regrouper_lignes(positions_y: list[int],
                     ecart_max: int = 4) -> list[int]:
    """
    Regroupe les rangées consécutives en une seule ligne centrale.

    Problème : une ligne de portée fait 2-3 pixels d'épaisseur,
    donc on détecte plusieurs y consécutifs pour la même ligne.
    On les fusionne en gardant le y du milieu.

    Arguments:
        positions_y : liste brute des y détectés
        ecart_max   : distance max entre deux y pour les considérer
                      comme la même ligne

    Retourne: liste des y centraux (une valeur par ligne)
    """
    if not positions_y:
        return []

    groupes = []
    groupe_courant = [positions_y[0]]

    for y in positions_y[1:]:
        if y - groupe_courant[-1] <= ecart_max:
            groupe_courant.append(y)
        else:
            groupes.append(groupe_courant)
            groupe_courant = [y]
    groupes.append(groupe_courant)

    # Garder le y du milieu de chaque groupe
    return [int(np.mean(groupe)) for groupe in groupes]


def grouper_en_portees(lignes_y: list[int],
                        nb_lignes_portee: int = 5) -> list[list[int]]:
    """
    Regroupe les lignes détectées en portées de 5 lignes.

    Une portée = exactement 5 lignes espacées de façon régulière.
    On détecte les "sauts" importants entre lignes pour
    séparer une portée de la suivante.

    Arguments:
        lignes_y         : liste des y centraux des lignes
        nb_lignes_portee : toujours 5 pour une partition standard

    Retourne: liste de portées, chaque portée = liste de 5 y
    """
    if len(lignes_y) < nb_lignes_portee:
        print(f"⚠️  Seulement {len(lignes_y)} ligne(s) détectée(s)")
        return []

    # Calculer les écarts entre lignes consécutives
    ecarts = [lignes_y[i+1] - lignes_y[i]
              for i in range(len(lignes_y) - 1)]

    # L'écart moyen INTERNE à une portée
    ecart_moyen = np.median(ecarts)

    # Un écart > 3× la médiane signale une nouvelle portée
    seuil_separation = ecart_moyen * 3

    portees = []
    portee_courante = [lignes_y[0]]

    for i, ecart in enumerate(ecarts):
        if ecart > seuil_separation:
            # Fin d'une portée
            if len(portee_courante) == nb_lignes_portee:
                portees.append(portee_courante)
            else:
                print(f"⚠️  Portée incomplète ignorée ({len(portee_courante)} lignes)")
            portee_courante = [lignes_y[i+1]]
        else:
            portee_courante.append(lignes_y[i+1])

    # Ne pas oublier la dernière portée
    if len(portee_courante) == nb_lignes_portee:
        portees.append(portee_courante)

    return portees


def calculer_espacement(portee: list[int]) -> float:
    """
    Calcule l'espacement moyen entre les lignes d'une portée.
    Cet espacement est crucial : il définit l'unité de mesure
    pour déterminer sur quelle ligne/espace se trouve une note.

    Une portée a 5 lignes → 4 intervalles.
    """
    ecarts = [portee[i+1] - portee[i] for i in range(len(portee) - 1)]
    return np.mean(ecarts)


class InfoPortee:
    """
    Contient toutes les informations géométriques d'une portée détectée.
    C'est la "règle graduée" qu'on utilisera pour lire les notes.
    """

    def __init__(self, lignes_y: list[int], cle: str = 'sol'):
        """
        lignes_y : les 5 coordonnées y des lignes (de haut en bas)
        cle      : 'sol' ou 'fa'
        """
        self.lignes_y = lignes_y          # [y1, y2, y3, y4, y5] haut→bas
        self.cle = cle
        self.espacement = calculer_espacement(lignes_y)
        self.y_min = lignes_y[0] - 4 * self.espacement  # Zone au-dessus
        self.y_max = lignes_y[4] + 4 * self.espacement  # Zone en-dessous

    def y_vers_position(self, y: float) -> int:
        """
        Convertit une coordonnée y (pixel) en position musicale.

        Rappel de notre convention :
        - Clé de Sol : ligne 1 = Mi4 (y le plus bas des 5 lignes)
        - Position augmente vers le HAUT (les notes montent)
        - Mais en pixels, y augmente vers le BAS !
        → Il faut inverser.

        Retourne un entier (peut être 0, négatif, ou > 5)
        Demi-positions = espaces entre lignes
        On arrondit à la position entière la plus proche.
        """
        # y de référence = ligne 1 (bas de la portée, 5ème dans la liste)
        y_ligne_1 = self.lignes_y[4]  # index 4 = 5ème ligne (la plus basse)

        # Distance vers le haut en unités d'espacement
        # (négatif si on est en dessous de la ligne 1)
        demi_positions = (y_ligne_1 - y) / (self.espacement / 2)

        # Arrondir à l'entier le plus proche
        # Position 1 = ligne 1, position 2 = espace 1, etc.
        position = round(demi_positions) + 1  # +1 car ligne 1 = position 1

        return int(position)

    def __repr__(self):
        return (f"Portée({self.cle}, "
                f"lignes={self.lignes_y}, "
                f"espacement={self.espacement:.1f}px)")