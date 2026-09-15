import subprocess
import sys
from pathlib import Path
from pdf2image import convert_from_path
from music21 import converter
import tkinter as tk
from tkinter import filedialog, scrolledtext
import tkinter.font as tkfont

# --- Correspondance note anglais → français ---
NOTES_FR = {
    'C': 'Do', 'D': 'Ré', 'E': 'Mi', 'F': 'Fa',
    'G': 'Sol', 'A': 'La', 'B': 'Si'
}

DUREES_FR = {
    'whole': 'ronde',
    'half': 'blanche',
    'quarter': 'noire',
    'eighth': 'croche',
    '16th': 'double-croche',
    '32nd': 'triple-croche',
    'complex': 'complex',
}

ALTERATIONS_FR = {
    '#': '♯',
    '-': '♭',
    '~': '½',
}

def note_vers_francais(pitch, duree_type):
    """Convertit une note music21 en notation française lisible."""
    nom = pitch.step                        # ex: 'C', 'D'...
    alteration = pitch.accidental

    nom_fr = NOTES_FR.get(nom, nom)

    if alteration:
        signe = ALTERATIONS_FR.get(alteration.modifier, alteration.modifier)
        nom_fr = f"{nom_fr}{signe}"

    octave = pitch.octave
    duree_fr = DUREES_FR.get(duree_type, duree_type)

    return nom_fr, octave, duree_fr

# --- ÉTAPE 0 : CHOISIR LE FICHIER ---
def choisir_fichier():
    root = tk.Tk()
    root.withdraw()
    return filedialog.askopenfilename(
        title="Choisir une partition",
        filetypes=[("Images & PDF", "*.pdf *.png *.jpg *.jpeg")]
    )

# --- ÉTAPE 1 : OMR avec oemer ---
def image_vers_musicxml(chemin_entree: str) -> Path:
    chemin = Path(chemin_entree)
    dossier_sortie = chemin.parent / "output_oemer"
    dossier_sortie.mkdir(exist_ok=True)

    if chemin.suffix.lower() == ".pdf":
        print("📄 Conversion PDF → PNG...")
        pages = convert_from_path(str(chemin), dpi=300)
        chemin_img = chemin.parent / (chemin.stem + "_page1.png")
        pages[0].save(str(chemin_img), "PNG")
        print(f"   Image sauvegardée : {chemin_img.name}")
    else:
        chemin_img = chemin

    print(f"🎵 Analyse OMR en cours : {chemin_img.name} ...")
    subprocess.run(
        ["oemer", str(chemin_img), "-o", str(dossier_sortie)],
        check=True
    )

    resultats = list(dossier_sortie.glob("*.musicxml"))
    if not resultats:
        raise FileNotFoundError("oemer n'a pas généré de MusicXML.")

    return resultats[0]

# --- ÉTAPE 2 : Extraire et formater les notes ---
def extraire_notes(chemin_xml: Path) -> list:
    """
    Retourne une liste de dicts :
    { partie, mesure, offset, nom, octave, duree, est_accord, notes_accord }
    """
    partition = converter.parse(str(chemin_xml))
    resultats = []

    for i, partie in enumerate(partition.parts):
        nom_partie = partie.partName or f"Partie {i+1}"

        for mesure in partie.getElementsByClass('Measure'):
            num_mesure = mesure.number

            for element in mesure.flat.notes:
                offset = float(element.offset)

                if hasattr(element, 'pitch'):
                    # Note simple
                    nom_fr, octave, duree_fr = note_vers_francais(
                        element.pitch, element.duration.type
                    )
                    resultats.append({
                        'partie': nom_partie,
                        'mesure': num_mesure,
                        'offset': offset,
                        'nom': nom_fr,
                        'octave': octave,
                        'duree': duree_fr,
                        'est_accord': False,
                        'notes_accord': [],
                    })
                else:
                    # Accord
                    notes_accord = []
                    for pitch in element.pitches:
                        nom_fr, octave, duree_fr = note_vers_francais(
                            pitch, element.duration.type
                        )
                        notes_accord.append((nom_fr, octave))
                    resultats.append({
                        'partie': nom_partie,
                        'mesure': num_mesure,
                        'offset': offset,
                        'nom': None,
                        'octave': None,
                        'duree': duree_fr,
                        'est_accord': True,
                        'notes_accord': notes_accord,
                    })

    return resultats

# --- ÉTAPE 3 : Affichage dans une fenêtre tkinter ---
def afficher_notes(notes: list, nom_fichier: str):
    fenetre = tk.Tk()
    fenetre.title(f"SymphonAi — {nom_fichier}")
    fenetre.geometry("800x600")
    fenetre.configure(bg="#1e1e2e")

    # En-tête
    titre = tk.Label(
        fenetre,
        text=f"🎵 {nom_fichier}",
        font=("Helvetica", 16, "bold"),
        bg="#1e1e2e", fg="#cdd6f4"
    )
    titre.pack(pady=(16, 4))

    sous_titre = tk.Label(
        fenetre,
        text=f"{len(notes)} notes détectées",
        font=("Helvetica", 11),
        bg="#1e1e2e", fg="#6c7086"
    )
    sous_titre.pack(pady=(0, 12))

    # Zone de texte scrollable
    zone = scrolledtext.ScrolledText(
        fenetre,
        wrap=tk.WORD,
        font=("Courier", 12),
        bg="#181825",
        fg="#cdd6f4",
        insertbackground="#cdd6f4",
        relief=tk.FLAT,
        padx=16, pady=12,
        spacing2=4,
    )
    zone.pack(fill=tk.BOTH, expand=True, padx=16, pady=(0, 16))

    # Tags de couleur
    zone.tag_config("partie",  foreground="#89b4fa", font=("Courier", 13, "bold"))
    zone.tag_config("mesure",  foreground="#a6e3a1", font=("Courier", 11, "bold"))
    zone.tag_config("note",    foreground="#cdd6f4")
    zone.tag_config("accord",  foreground="#f9e2af")
    zone.tag_config("duree",   foreground="#6c7086")
    zone.tag_config("octave",  foreground="#89dceb")

    # Remplissage
    partie_courante = None
    mesure_courante = None

    for n in notes:
        # Séparateur de partie
        if n['partie'] != partie_courante:
            partie_courante = n['partie']
            mesure_courante = None
            zone.insert(tk.END, f"\n══ {partie_courante} ══\n", "partie")

        # Séparateur de mesure
        if n['mesure'] != mesure_courante:
            mesure_courante = n['mesure']
            zone.insert(tk.END, f"\n  ┌─ Mesure {mesure_courante}\n", "mesure")

        if not n['est_accord']:
            zone.insert(tk.END, f"  │  {n['nom']:<5}", "note")
            zone.insert(tk.END, f"oct.{n['octave']}  ", "octave")
            zone.insert(tk.END, f"({n['duree']})\n", "duree")
        else:
            noms = " + ".join(f"{nom}(oct.{oct})" for nom, oct in n['notes_accord'])
            zone.insert(tk.END, f"  │  [{noms}]  ", "accord")
            zone.insert(tk.END, f"({n['duree']})\n", "duree")

    zone.configure(state=tk.DISABLED)  # lecture seule

    # Bouton export texte
    def exporter_txt():
        chemin_export = Path(nom_fichier).stem + "_notes.txt"
        with open(chemin_export, "w", encoding="utf-8") as f:
            partie_c = None
            mesure_c = None
            for n in notes:
                if n['partie'] != partie_c:
                    partie_c = n['partie']
                    mesure_c = None
                    f.write(f"\n══ {partie_c} ══\n")
                if n['mesure'] != mesure_c:
                    mesure_c = n['mesure']
                    f.write(f"\n  Mesure {mesure_c}\n")
                if not n['est_accord']:
                    f.write(f"    {n['nom']} oct.{n['octave']} ({n['duree']})\n")
                else:
                    noms = " + ".join(
                        f"{nom}(oct.{oct})" for nom, oct in n['notes_accord']
                    )
                    f.write(f"    [{noms}] ({n['duree']})\n")
        print(f"✅ Export : {chemin_export}")

    btn = tk.Button(
        fenetre,
        text="💾 Exporter en .txt",
        command=exporter_txt,
        bg="#313244", fg="#cdd6f4",
        relief=tk.FLAT,
        padx=12, pady=6,
        cursor="hand2",
        font=("Helvetica", 11),
    )
    btn.pack(pady=(0, 16))

    fenetre.mainloop()

# --- EXÉCUTION ---
if __name__ == "__main__":
    fichier = choisir_fichier()
    if not fichier:
        print("Aucun fichier sélectionné.")
        sys.exit(0)

    try:
        chemin_xml = image_vers_musicxml(fichier)
        notes = extraire_notes(chemin_xml)
        afficher_notes(notes, Path(fichier).name)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur oemer : {e}")
    except FileNotFoundError as e:
        print(f"❌ Fichier introuvable : {e}")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")