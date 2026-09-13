import argparse
import json
import os
import sys
import cv2
import fitz  # PyMuPDF
from PIL import Image
import numpy as np
from ultralytics import YOLO

# ==========================================
# 1. CONFIGURATION DES CHEMINS ET MODÈLE
# ==========================================
script_dir = os.path.dirname(os.path.abspath(__file__))
os.makedirs("temp_data", exist_ok=True)

model_path = os.path.join(script_dir, "best.pt")

if not os.path.exists(model_path):
  print(f"❌ Erreur : Le fichier 'best.pt' est introuvable à côté du script : {model_path}")
  sys.exit(1)

model = YOLO(model_path)

# ==========================================
# 2. RÉCUPÉRATION DU FICHIER SAISI PAR L'UTILISATEUR
# ==========================================
SUPPORTED_IMAGE_EXT = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"}
SUPPORTED_PDF_EXT = {".pdf"}

# Fenêtre de résolution "confortable" pour le modèle YOLO et pour que
# les seuils dynamiques du script (calculés plus bas) restent stables.
# Si l'image fournie est trop petite ou trop grande, on la redimensionne
# vers TARGET_WIDTH tout en gardant le ratio d'aspect. Cela permet au
# script de fonctionner pareil sur un rendu PDF 200 DPI, un scan 300 DPI
# ou une photo de téléphone haute résolution.
MIN_WIDTH = 1400
MAX_WIDTH = 2600
TARGET_WIDTH = 2000


def ask_file_path():
  """Demande le chemin du fichier à l'utilisateur en ligne de commande."""
  parser = argparse.ArgumentParser(
      description="Scanner une partition (PDF ou image) avec YOLO."
  )
  parser.add_argument(
      "file",
      nargs="?",
      default=None,
      help="Chemin vers le fichier de partition (.pdf, .png, .jpg, ...)",
  )
  parser.add_argument(
      "--page",
      type=int,
      default=1,
      help="Numéro de la page à analyser si le fichier est un PDF (1 = première page).",
  )
  parser.add_argument(
      "--key",
      type=int,
      default=None,
      help=(
          "Armure de la partition, en nombre d'altérations : "
          "positif = nombre de dièses (ex: 2 = Ré majeur), "
          "négatif = nombre de bémols (ex: -2 = Si♭ majeur), "
          "0 = Do majeur / La mineur (aucune altération)."
      ),
  )
  args = parser.parse_args()

  file_path = args.file
  if not file_path:
    file_path = input(
        "📄 Chemin du fichier à scanner (PDF, PNG, JPG, ...) : "
    ).strip().strip('"').strip("'")

  key_signature = args.key
  if key_signature is None:
    raw_key = input(
        "🎼 Armure de la partition (nombre de dièses positif, "
        "de bémols négatif, 0 si aucune altération) [0] : "
    ).strip()
    try:
      key_signature = int(raw_key) if raw_key else 0
    except ValueError:
      print("⚠️ Valeur non reconnue, armure considérée comme 0 (Do majeur).")
      key_signature = 0

  return file_path, args.page, key_signature


def normalize_image_resolution(image_path):
  """
  Redimensionne l'image sauvegardée sur disque si sa largeur sort de la
  fenêtre [MIN_WIDTH, MAX_WIDTH]. Ceci garantit que la détection YOLO et
  tous les seuils géométriques du script opèrent sur une échelle de
  pixels cohérente, quelle que soit la résolution d'origine du fichier
  fourni par l'utilisateur (scan, capture d'écran, photo téléphone...).
  """
  img = cv2.imread(image_path, cv2.IMREAD_COLOR)
  if img is None:
    return
  h, w = img.shape[:2]
  if w < MIN_WIDTH or w > MAX_WIDTH:
    scale = TARGET_WIDTH / float(w)
    new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))
    interp = cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA
    resized = cv2.resize(img, (new_w, new_h), interpolation=interp)
    cv2.imwrite(image_path, resized)
    print(f"↔️  Image redimensionnée : {w}x{h}px -> {new_w}x{new_h}px")


def load_page_as_grayscale(file_path, page_number=1, dpi=200):
  """
  Charge le fichier fourni par l'utilisateur, quel que soit son format
  (PDF ou image), normalise sa résolution, et retourne :
    - le chemin de l'image PNG générée (utilisée pour l'inférence YOLO)
    - l'image en niveaux de gris (numpy array) pour l'analyse des portées
  """
  if not os.path.exists(file_path):
    print(f"❌ Fichier introuvable : {file_path}")
    sys.exit(1)

  ext = os.path.splitext(file_path)[1].lower()
  image_path = os.path.join("temp_data", "page_1.png")

  if ext in SUPPORTED_PDF_EXT:
    doc = fitz.open(file_path)
    if not (1 <= page_number <= len(doc)):
      print(
          f"⚠️ Le PDF contient {len(doc)} page(s), "
          f"page {page_number} invalide -> utilisation de la page 1."
      )
      page_number = 1
    page = doc[page_number - 1]
    pix = page.get_pixmap(dpi=dpi)
    pix.save(image_path)
    doc.close()

  elif ext in SUPPORTED_IMAGE_EXT:
    try:
      img = Image.open(file_path)
      if img.mode != "RGB":
        img = img.convert("RGB")
      img.save(image_path)
    except Exception as e:
      print(f"❌ Impossible de lire l'image '{file_path}' : {e}")
      sys.exit(1)

  else:
    print(
        f"❌ Format non supporté : '{ext}'. "
        f"Formats acceptés : PDF ({', '.join(sorted(SUPPORTED_PDF_EXT))}) "
        f"ou image ({', '.join(sorted(SUPPORTED_IMAGE_EXT))})."
    )
    sys.exit(1)

  # Normalisation de résolution AVANT toute détection, pour que YOLO et
  # les seuils géométriques travaillent sur une échelle stable.
  normalize_image_resolution(image_path)

  cv_img_local = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
  if cv_img_local is None:
    print(f"❌ Impossible de charger l'image générée : {image_path}")
    sys.exit(1)

  return image_path, cv_img_local


file_path, page_number, key_signature = ask_file_path()
image_path, cv_img = load_page_as_grayscale(file_path, page_number=page_number)
h_img, w_img = cv_img.shape
print(f"✅ Fichier chargé : {file_path} ({w_img}x{h_img}px)")

# Seuil noir/blanc adaptatif (Otsu) calculé une fois sur toute l'image,
# utilisé plus bas pour distinguer tête de note pleine (Noire/Croche) vs
# tête de note évidée (Blanche), quel que soit le contraste/l'exposition
# du scan ou de la photo fournie (remplace l'ancien seuil fixe de 180).
otsu_thresh_val, _ = cv2.threshold(
    cv_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
)

# ==========================================
# 3. INFÉRENCE YOLO & DÉTECTION DES NOTES
# ==========================================
results = model.predict(source=image_path, conf=0.4, iou=0.4, save=False)
result = results[0]

raw_notes = []
for box in result.boxes:
  cls_id = int(box.cls[0])
  class_name = result.names[cls_id]
  if class_name == "notehead":
    xyxy = box.xyxy[0].cpu().numpy()
    conf = float(box.conf[0])
    x1, y1, x2, y2 = map(int, xyxy)
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w_img, x2), min(h_img, y2)

    x_center = (x1 + x2) / 2
    y_center = (y1 + y2) / 2

    note_crop = cv_img[y1:y2, x1:x2]
    duration = "Noire"
    if note_crop.size > 0:
      h_c, w_c = note_crop.shape
      center_patch = note_crop[
          int(h_c * 0.3) : int(h_c * 0.7), int(w_c * 0.3) : int(w_c * 0.7)
      ]
      if center_patch.size > 0:
        mean_val = np.mean(center_patch)
        if mean_val >= otsu_thresh_val:
          duration = "Blanche"
        else:
          box_ratio = (y2 - y1) / max(1, (x2 - x1))
          duration = "Croche" if box_ratio > 1.3 else "Noire"

    raw_notes.append({
        "x": x_center,
        "y": y_center,
        "duration": duration,
        "conf": conf,
        "w": x2 - x1,
        "h": y2 - y1,
    })

# Taille "typique" d'une tête de note, mesurée directement sur les
# détections YOLO de CETTE image. Sert d'unité de référence pour les
# seuils de fusion/regroupement horizontaux ci-dessous, au lieu de
# valeurs fixes en pixels (8px, 12px) qui ne collaient qu'au rendu PDF
# 200 DPI d'origine.
if raw_notes:
  notehead_w = float(np.median([n["w"] for n in raw_notes]))
  notehead_h = float(np.median([n["h"] for n in raw_notes]))
else:
  notehead_w, notehead_h = 14.0, 10.0  # valeur de repli si aucune note détectée

DEDUPE_X = max(notehead_w * 0.6, 3.0)
DEDUPE_Y = max(notehead_h * 0.6, 3.0)
CLUSTER_X = max(notehead_w * 0.9, 4.0)

# Suppression des doublons proches (seuils désormais adaptatifs)
noteheads = []
raw_notes.sort(key=lambda n: n["conf"], reverse=True)
for note in raw_notes:
  if not any(
      abs(note["x"] - kept["x"]) < DEDUPE_X and abs(note["y"] - kept["y"]) < DEDUPE_Y
      for kept in noteheads
  ):
    noteheads.append(note)

# ==========================================
# 4. DÉTECTION DES LIGNES DE PORTÉES
# ==========================================
_, thresh_img = cv2.threshold(cv_img, 200, 255, cv2.THRESH_BINARY_INV)
row_sums = np.sum(thresh_img, axis=1)
threshold_sum = np.max(row_sums) * 0.3 if np.max(row_sums) > 0 else 1
line_candidates = np.where(row_sums > threshold_sum)[0]

all_lines = []
if len(line_candidates) > 0:
  curr_g = [line_candidates[0]]
  for val in line_candidates[1:]:
    if val - curr_g[-1] <= 3:
      curr_g.append(val)
    else:
      all_lines.append(int(np.mean(curr_g)))
      curr_g = [val]
  all_lines.append(int(np.mean(curr_g)))


def estimate_line_spacing(lines):
  """
  Estime l'espacement typique (en pixels) entre deux lignes adjacentes
  d'UNE MÊME portée, à partir de toutes les lignes détectées sur la page.
  Sert d'unité de référence universelle pour regrouper les lignes en
  portées et pour définir la marge d'assignation des notes, à la place
  des constantes fixes (25px, 35px, 8px) qui ne valaient que pour un
  rendu PDF à 200 DPI.

  Principe : sur une page normale, il y a beaucoup plus d'écarts
  INTRA-portée (4 par portée de 5 lignes) que d'écarts INTER-portées ou
  INTER-systèmes (qui sont eux beaucoup plus grands) -> la médiane de
  tous les écarts approxime bien l'espacement intra-portée.
  """
  if len(lines) < 2:
    return 8.0
  gaps = np.diff(lines)
  gaps = gaps[gaps > 0]
  if len(gaps) == 0:
    return 8.0
  return float(np.median(gaps))


line_spacing_unit = estimate_line_spacing(all_lines)
STAFF_GROUP_THRESHOLD = max(line_spacing_unit * 2.2, 6.0)

staves = []
curr_staff = []
for l in all_lines:
  if not curr_staff or (l - curr_staff[-1]) < STAFF_GROUP_THRESHOLD:
    curr_staff.append(l)
  else:
    if len(curr_staff) >= 3:
      staves.append(curr_staff)
    curr_staff = [l]
if len(curr_staff) >= 3:
  staves.append(curr_staff)

selected_staves = staves


def compute_staff_margins(staves_list, unit, factor=3.5):
  """
  Calcule, pour chaque portée détectée, la marge verticale (en pixels)
  utilisée pour lui assigner des notes (têtes de note situées un peu
  au-dessus/en-dessous des 5 lignes, ex: lignes supplémentaires).

  La marge est toujours plafonnée à la moitié de la distance à la portée
  voisine la plus proche -> une portée ne peut jamais "voler" les notes
  de la portée d'à côté, même si l'image a une résolution différente de
  celle utilisée lors du calibrage initial. C'est ce qui corrige le bug
  où des notes de plusieurs systèmes se retrouvaient mélangées dans un
  seul cluster.
  """
  margins = []
  for i, staff in enumerate(staves_list):
    margin = unit * factor
    if i > 0:
      gap_above = staff[0] - staves_list[i - 1][-1]
      margin = min(margin, gap_above / 2.0)
    if i < len(staves_list) - 1:
      gap_below = staves_list[i + 1][0] - staff[-1]
      margin = min(margin, gap_below / 2.0)
    margins.append(max(margin, unit))  # jamais en dessous d'1 unité de ligne
  return margins


staff_margins = compute_staff_margins(selected_staves, line_spacing_unit)

print(
    f"\n--- 🎹 ANALYSE DE LA STRUCTURE (PIANO SOLO -"
    f" {len(selected_staves)} portées détectées,"
    f" espacement de ligne ≈{line_spacing_unit:.1f}px) ---"
)

# ==========================================
# 5. MAPPING GÉOMÉTRIQUE ET STRUCTURATION JSON
# ==========================================
LETTERS = ["C", "D", "E", "F", "G", "A", "B"]
SEMITONE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}

# Armure générique (remplace l'ancienne valeur figée "Ré majeur").
# L'utilisateur indique le nombre d'altérations au lancement (--key ou
# saisie interactive) : positif = dièses, négatif = bémols, 0 = aucune.
# On suit l'ordre standard du cycle des quintes pour savoir QUELLES
# lettres sont altérées selon le nombre d'altérations fourni.
SHARP_ORDER = ["F", "C", "G", "D", "A", "E", "B"]  # ordre d'apparition des dièses
FLAT_ORDER = ["B", "E", "A", "D", "G", "C", "F"]   # ordre d'apparition des bémols

if key_signature > 0:
  n = min(key_signature, 7)
  ALTERED_LETTERS = set(SHARP_ORDER[:n])
  KEY_SIGN = 1  # +1 demi-ton
  armure_desc = f"{n} dièse(s) : {', '.join(SHARP_ORDER[:n])}"
elif key_signature < 0:
  n = min(-key_signature, 7)
  ALTERED_LETTERS = set(FLAT_ORDER[:n])
  KEY_SIGN = -1  # -1 demi-ton
  armure_desc = f"{n} bémol(s) : {', '.join(FLAT_ORDER[:n])}"
else:
  ALTERED_LETTERS = set()
  KEY_SIGN = 0
  armure_desc = "aucune altération (Do majeur / La mineur)"

print(f"🎼 Armure appliquée : {armure_desc}")


def y_to_midi_pitch(y_note, staff_lines, is_bass_clef=False):
  if len(staff_lines) < 5:
    base_y = staff_lines[0] if len(staff_lines) > 0 else y_note
    # Repli sur l'espacement RÉEL mesuré sur cette image (et non plus
    # une constante fixe de 8px) si certaines lignes de la portée n'ont
    # pas été détectées.
    staff_lines = [base_y + i * line_spacing_unit for i in range(5)]

  line_spacing = np.mean(np.diff(staff_lines))
  if line_spacing <= 0:
    line_spacing = line_spacing_unit
  half_space = line_spacing / 2.0
  bottom_line = staff_lines[-1]

  diff_pixels = bottom_line - y_note
  steps_from_bottom = round(diff_pixels / half_space)

  if is_bass_clef:
    bottom_letter, bottom_octave = "G", 2
  else:
    bottom_letter, bottom_octave = "E", 4

  start_idx = LETTERS.index(bottom_letter)
  idx = start_idx + steps_from_bottom  # pas de clamp, volontairement

  letter = LETTERS[idx % 7]
  octave = bottom_octave + (idx // 7)

  midi = 12 * (octave + 1) + SEMITONE[letter]

  if letter in ALTERED_LETTERS:
    midi += KEY_SIGN

  return midi


note_names_map = {
    0: "C", 1: "C#", 2: "D", 3: "D#", 4: "E", 5: "F", 6: "F#",
    7: "G", 8: "G#", 9: "A", 10: "A#", 11: "B",
}

partition_data = []

for idx, staff in enumerate(selected_staves):
  is_bass = idx % 2 != 0
  margin = staff_margins[idx]
  y_top = staff[0] - margin
  y_bottom = staff[-1] + margin

  staff_notes = [n for n in noteheads if y_top <= n["y"] <= y_bottom]
  staff_notes.sort(key=lambda n: n["x"])

  if not staff_notes:
    continue

  time_clusters = []
  curr_c = []
  for note in staff_notes:
    if not curr_c or abs(note["x"] - curr_c[-1]["x"]) < CLUSTER_X:
      curr_c.append(note)
    else:
      time_clusters.append(curr_c)
      curr_c = [note]
  if curr_c:
    time_clusters.append(curr_c)

  system_notes = []
  for cluster_idx, cluster in enumerate(time_clusters):
    cluster_data = {"cluster_index": cluster_idx, "notes": []}

    for note in cluster:
      duration = note["duration"]
      midi_pitch = y_to_midi_pitch(note["y"], staff, is_bass_clef=is_bass)

      note_name = note_names_map[midi_pitch % 12]
      octave = (midi_pitch // 12) - 1
      readable_note = f"{note_name}{octave}"

      cluster_data["notes"].append({
          "pitch": int(midi_pitch),
          "note_name": readable_note,
          "duration": duration,
          "x_position": note["x"],
          "y_position": note["y"],
      })

    system_notes.append(cluster_data)

  cle_label = "Clé de Fa (Bass)" if is_bass else "Clé de Sol (Treble)"
  partition_data.append(
      {"staff_index": idx + 1, "clef": cle_label, "elements": system_notes}
  )

# ==========================================
# 6. AFFICHAGE ET EXPORT JSON
# ==========================================
print("\n================ RAPPORT D'EXTRACTION DES NOTES ================")
for staff_info in partition_data:
  print(f"\n🎼 Portée {staff_info['staff_index']} ({staff_info['clef']}) :")
  seq_str = []
  for cluster in staff_info["elements"]:
    notes_in_cluster = [
        f"{n['note_name']}({n['duration'][0]})" for n in cluster["notes"]
    ]
    seq_str.append(
        "[" + ",".join(notes_in_cluster) + "]"
        if len(notes_in_cluster) > 1
        else notes_in_cluster[0]
    )
  print(" - ".join(seq_str))

json_output_path = os.path.join("temp_data", "partition_structure.json")
with open(json_output_path, "w", encoding="utf-8") as f:
  json.dump(partition_data, f, ensure_ascii=False, indent=4)

print(
    f"\n✅ Données textuelles et JSON prêtes : "
    f"{os.path.abspath(json_output_path)}"
)