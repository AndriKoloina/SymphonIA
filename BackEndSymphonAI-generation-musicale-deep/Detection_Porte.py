import subprocess
import sys
import time
import threading
from pathlib import Path
from pdf2image import convert_from_path
from music21 import converter, midi, tempo as m21tempo
import fluidsynth
import tkinter as tk
from tkinter import filedialog

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

# --- ÉTAPE 2 : MusicXML → MIDI via music21 ---
def musicxml_vers_midi(chemin_xml: Path) -> Path:
    print(f"📄 Lecture du MusicXML : {chemin_xml.name}")
    partition = converter.parse(str(chemin_xml))

    print("\n--- NOTES DÉTECTÉES ---")
    for element in partition.flat.notes:
        if hasattr(element, 'pitch'):
            print(f"  {element.pitch.nameWithOctave:<6}  durée: {element.duration.type}")
        else:
            noms = [p.nameWithOctave for p in element.pitches]
            print(f"  [{', '.join(noms)}]  durée: {element.duration.type}")

    chemin_midi = chemin_xml.with_suffix(".mid")
    mf = midi.translate.music21ObjectToMidiFile(partition)
    mf.open(str(chemin_midi), 'wb')
    mf.write()
    mf.close()
    print(f"\n✅ MIDI exporté : {chemin_midi}")
    return chemin_midi

# --- LECTURE D'UNE VOIX SEULE (appelée dans un thread) ---
def jouer_voix(fs, canal, notes, secondes_par_beat, debut):
    """Joue une liste de notes avec timing absolu pour éviter la dérive."""
    for element in notes:
        # Timing ABSOLU par rapport au début — les erreurs ne s'accumulent plus
        temps_cible = debut + (float(element.offset) * secondes_par_beat)
        
        # Attente active (busy-wait) sur les dernières millisecondes
        # pour une précision maximale
        attente = temps_cible - time.time()
        if attente > 0.01:
            time.sleep(attente - 0.01)  # sleep grossier
        while time.time() < temps_cible:  # ajustement fin sans sleep
            pass

        duree = float(element.duration.quarterLength) * secondes_par_beat
        duree_reelle = duree * 0.95

        if hasattr(element, 'pitch'):
            fs.noteon(canal, element.pitch.midi, 100)
            # Même principe pour le noteoff : timing absolu
            fin = temps_cible + duree_reelle
            attente_fin = fin - time.time()
            if attente_fin > 0.01:
                time.sleep(attente_fin - 0.01)
            while time.time() < fin:
                pass
            fs.noteoff(canal, element.pitch.midi)
        else:
            midis = [p.midi for p in element.pitches]
            for m in midis:
                fs.noteon(canal, m, 100)
            fin = temps_cible + duree_reelle
            attente_fin = fin - time.time()
            if attente_fin > 0.01:
                time.sleep(attente_fin - 0.01)
            while time.time() < fin:
                pass
            for m in midis:
                fs.noteoff(canal, m)

# --- ÉTAPE 3 : Lecture audio avec FluidSynth ---
def jouer_midi(chemin_midi: Path):
    chemins_soundfont = [
        "/usr/share/sounds/sf2/FluidR3_GM.sf2",
        "/usr/share/soundfonts/FluidR3_GM.sf2",
        "/usr/share/sounds/sf2/TimGM6mb.sf2",
    ]

    soundfont = None
    for chemin in chemins_soundfont:
        if Path(chemin).exists():
            soundfont = chemin
            break

    if soundfont is None:
        print("⚠️  Aucune soundfont trouvée.")
        print("   sudo apt install fluid-soundfont-gm")
        print(f"   MIDI disponible ici : {chemin_midi}")
        return

    print(f"🔊 Chargement : {soundfont}")

    fs = fluidsynth.Synth(gain=0.7)
    fs.start(driver="alsa")  # "coreaudio" sur macOS
    sfid = fs.sfload(soundfont)

    # Un preset piano sur chaque canal
    for canal in range(16):
        fs.program_select(canal, sfid, 0, 0)

    # Parser la partition
    partition = converter.parse(str(chemin_midi))

    # Récupérer le tempo
    tempos = partition.flat.getElementsByClass(m21tempo.MetronomeMark)
    bpm = float(tempos[0].number) if tempos else 120.0
    secondes_par_beat = 60.0 / bpm
    print(f"🎼 Tempo : {bpm} BPM")

    # --- SÉPARATION PAR PARTIES / VOIX ---
    # On récupère toutes les parties (Part) de la partition
    parties = partition.parts
    print(f"🎹 Parties détectées : {len(parties)}")

    threads = []
    debut = time.time() + 0.3  # petit délai pour que tous les threads démarrent ensemble

    for i, partie in enumerate(parties):
        canal = i % 16  # max 16 canaux MIDI
        notes = sorted(partie.flat.notes, key=lambda n: n.offset)
        if not notes:
            continue
        print(f"   → Partie {i+1} : {len(notes)} notes sur canal {canal}")
        t = threading.Thread(
            target=jouer_voix,
            args=(fs, canal, notes, secondes_par_beat, debut)
        )
        threads.append(t)

    print("▶️  Lecture...")
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print("✅ Lecture terminée.")
    time.sleep(0.5)
    fs.delete()

# --- EXÉCUTION ---
if __name__ == "__main__":
    fichier = choisir_fichier()
    if not fichier:
        print("Aucun fichier sélectionné.")
        sys.exit(0)

    try:
        chemin_xml = image_vers_musicxml(fichier)
        chemin_midi = musicxml_vers_midi(chemin_xml)
        jouer_midi(chemin_midi)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur oemer : {e}")
    except FileNotFoundError as e:
        print(f"❌ Fichier introuvable : {e}")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")