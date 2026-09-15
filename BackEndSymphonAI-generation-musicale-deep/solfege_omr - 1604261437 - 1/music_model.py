# music_model.py
# ============================================================
# Représentation des données musicales
# Basé sur notre conversation : portées, notes, octaves
# ============================================================

# ----------------------------
# MAPPING POSITIONNEL DES NOTES
# ----------------------------
# Position = numéro entier (peut être négatif ou > 5)
# La logique est continue et unifiée entre clé de Sol et clé de Fa
# Ligne 0 = Do du milieu (Do4) pour les deux clés

# Séquence des notes en solfège (Do=0, Ré=1, Mi=2...)
SEQUENCE_NOTES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']

# Demi-tons de chaque note par rapport au Do de la même octave
DEMI_TONS = {
    'Do':  0,
    'Re':  2,
    'Mi':  4,
    'Fa':  5,
    'Sol': 7,
    'La':  9,
    'Si':  11,
}

# Équivalences anglaises (pour lecture double notation)
NOTATION_FR_EN = {
    'Do': 'C', 'Re': 'D', 'Mi': 'E',
    'Fa': 'F', 'Sol': 'G', 'La': 'A', 'Si': 'B'
}
NOTATION_EN_FR = {v: k for k, v in NOTATION_FR_EN.items()}

# ----------------------------
# CLÉ DE SOL
# Ligne 0 = Do4 (ligne supplémentaire du bas)
# Ligne 1 = Mi4 (1ère ligne de la portée)
# ----------------------------

def position_vers_note_sol(position: int) -> tuple[str, int]:
    """
    Convertit une position verticale (ligne ou espace) en note + octave.
    Position 0 = Do4 (Do du milieu, ligne supplémentaire)
    Position 1 = Mi4 (1ère ligne portée clé de Sol)
    Fonctionne pour toute valeur : négative, ou > 5

    Retourne: (nom_note_fr, octave)
    Exemple: position_vers_note_sol(1) → ('Mi', 4)
             position_vers_note_sol(0) → ('Do', 4)
             position_vers_note_sol(-1) → ('Si', 3)
    """
    # La séquence part de Si3 en position -1, Do4 en position 0
    # Chaque position = une note dans la séquence SEQUENCE_NOTES
    # Position 0 = Do4 → index 0 dans SEQUENCE_NOTES, octave 4

    # On décale : position 0 = Do (index 0 de la séquence)
    index_total = position  # Do=0, Re=1, Mi=2, Fa=3, Sol=4, La=5, Si=6

    # Calcul de l'octave et de l'index dans la séquence
    octave_offset, index_note = divmod(index_total, 7)
    octave = 4 + octave_offset
    nom = SEQUENCE_NOTES[index_note]

    return (nom, octave)


def position_vers_note_fa(position: int) -> tuple[str, int]:
    """
    Convertit une position verticale en note + octave pour la clé de Fa.
    Position 6 = Do4 (Do du milieu, ligne supplémentaire du haut)
    Position 5 = La3 (5ème ligne portée clé de Fa)
    Position 1 = Sol2 (1ère ligne portée clé de Fa)

    Retourne: (nom_note_fr, octave)
    Exemple: position_vers_note_fa(1) → ('Sol', 2)
             position_vers_note_fa(6) → ('Do', 4)
    """
    # La clé de Fa : position 6 = Do4 (même Do du milieu)
    # Donc on ramène au système de la clé de Sol :
    # position_fa 6 = position_sol 0
    position_equivalente_sol = position - 6
    return position_vers_note_sol(position_equivalente_sol)


# ----------------------------
# FRÉQUENCES
# ----------------------------

LA4_HZ = 440.0  # Référence universelle du diapason

def note_vers_frequence(nom_note: str, octave: int,
                         alteration: int = 0) -> float:
    """
    Calcule la fréquence d'une note avec la formule du tempérament égal :
    F(n) = 440 × 2^(n/12)
    où n = distance en demi-tons depuis La4

    Arguments:
        nom_note   : nom français ('Do', 'Re', 'Mi'...)
        octave     : numéro d'octave (4 = octave du Do milieu)
        alteration : 0=naturel, 1=dièse, -1=bémol

    Retourne: fréquence en Hz (float)
    """
    # Demi-tons du La4 = référence zéro
    # La4 = octave 4, La = 9 demi-tons depuis Do
    demi_tons_la4 = 4 * 12 + 9  # = 57

    # Demi-tons de notre note depuis Do0
    demi_tons_note = octave * 12 + DEMI_TONS[nom_note] + alteration

    # Distance depuis La4
    n = demi_tons_note - demi_tons_la4

    frequence = LA4_HZ * (2 ** (n / 12))
    return frequence


# ----------------------------
# CLASSES DE DONNÉES
# ----------------------------

class Note:
    """Représente une note musicale complète."""

    def __init__(self, nom: str, octave: int,
                 duree: float, alteration: int = 0):
        """
        nom       : 'Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'
        octave    : 4 pour le Do milieu
        duree     : en secondes (ex: 0.5 pour une noire à 120 BPM)
        alteration: 0=naturel, 1=dièse, -1=bémol
        """
        self.nom = nom
        self.octave = octave
        self.duree = duree
        self.alteration = alteration
        self.frequence = note_vers_frequence(nom, octave, alteration)

    def nom_anglais(self) -> str:
        return NOTATION_FR_EN.get(self.nom, self.nom)

    def __repr__(self):
        alt = {1: '#', -1: 'b', 0: ''}[self.alteration]
        return f"Note({self.nom}{alt}{self.octave}, {self.frequence:.2f}Hz, {self.duree}s)"


class Silence:
    """Représente un silence (pause)."""

    def __init__(self, duree: float):
        self.duree = duree
        self.frequence = 0

    def __repr__(self):
        return f"Silence({self.duree}s)"


class Mesure:
    """Une mesure contient une liste de notes/silences."""

    def __init__(self, numerateur: int, denominateur: int):
        """
        numerateur   : chiffre du haut de la signature (ex: 4 dans 4/4)
        denominateur : chiffre du bas (ex: 4 dans 4/4)
        """
        self.numerateur = numerateur
        self.denominateur = denominateur
        self.elements = []  # Liste de Note ou Silence

    def ajouter(self, element):
        self.elements.append(element)

    def __repr__(self):
        return f"Mesure({self.numerateur}/{self.denominateur}, {len(self.elements)} éléments)"


class Partition:
    """La partition complète."""

    def __init__(self, tempo: int = 120, cle: str = 'sol'):
        """
        tempo : battements par minute (BPM)
        cle   : 'sol' ou 'fa'
        """
        self.tempo = tempo
        self.cle = cle
        self.mesures = []
        # Durée d'une noire en secondes
        self.duree_noire = 60.0 / tempo

    def ajouter_mesure(self, mesure: Mesure):
        self.mesures.append(mesure)

    def toutes_les_notes(self):
        """Retourne la liste de tous les éléments dans l'ordre."""
        elements = []
        for mesure in self.mesures:
            elements.extend(mesure.elements)
        return elements

    def __repr__(self):
        return (f"Partition(tempo={self.tempo}, clé={self.cle}, "
                f"{len(self.mesures)} mesures)")