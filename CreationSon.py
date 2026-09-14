import argparse
import json
import os
import random

# ==========================================
# SCHÉMA DE SORTIE
# ==========================================
# Ce générateur produit EXACTEMENT le même schéma JSON que le vrai
# script d'extraction OMR (scan_partition_universel.py) :
#
# [
#   {
#     "staff_index": 1,
#     "clef": "Clé de Sol (Treble)" | "Clé de Fa (Bass)",
#     "elements": [
#       {
#         "cluster_index": 0,
#         "notes": [
#           {
#             "pitch": 60,
#             "note_name": "C4",
#             "duration": "Noire" | "Blanche" | "Croche",
#             "x_position": 123.0,
#             "y_position": 456.0
#           }
#         ]
#       }
#     ]
#   }
# ]
#
# Objectif : que l'équipe front puisse brancher indifféremment ce
# générateur (données factices, pour développer/tester sans dépendre du
# pipeline YOLO) ou le vrai script OMR, sans jamais avoir à distinguer
# les deux formats côté consommation.

NOMS_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

DURATIONS = ["Noire", "Blanche", "Croche"]

# Espacement horizontal (en "pixels" simulés) attribué à chaque type de
# durée, pour que x_position avance de façon cohérente avec le rythme
# -- comme le ferait un vrai rendu de partition.
DURATION_X_STEP = {"Noire": 40, "Blanche": 70, "Croche": 22}

STYLES = {
    "1": {
        "label": "Lo-Fi / Ambiant",
        "emoji": "🎧",
        "scale": [48, 51, 53, 55, 58, 60, 63, 65, 67, 70, 72],
        "nb_clusters_per_staff": 10,
        "nb_staves": 4,  # 2 systèmes (Sol+Fa)
        "chord_chance": 0.25,
        "bass_offset": -24,  # transpose la même gamme 2 octaves plus bas
    },
    "2": {
        "label": "Pop / Variété",
        "emoji": "🎤",
        "scale": [60, 62, 64, 65, 67, 69, 71, 72],
        "nb_clusters_per_staff": 14,
        "nb_staves": 4,
        "chord_chance": 0.15,
        "bass_offset": -24,
    },
    "3": {
        "label": "Électro / Chiptune",
        "emoji": "⚡",
        "scale": [60, 63, 67, 70, 72, 75, 79],
        "nb_clusters_per_staff": 18,
        "nb_staves": 4,
        "chord_chance": 0.10,
        "bass_offset": -24,
    },
}

# Profil rythmique différent selon le rôle : la mélodie (Sol) peut être
# agitée, la basse (Fa) doit rester plus posée pour "porter" l'harmonie
# au lieu de rivaliser avec la mélodie -> sinon les deux portées sonnent
# comme deux mélodies indépendantes qui se marchent dessus.
DURATION_WEIGHTS_TREBLE = [0.55, 0.15, 0.30]  # Noire, Blanche, Croche
DURATION_WEIGHTS_BASS = [0.45, 0.45, 0.10]    # beaucoup moins de croches

# ==========================================
# PROGRESSION D'ACCORDS PARTAGÉE
# ==========================================
# Jusqu'ici, la mélodie (Sol) et la basse (Fa) faisaient chacune leur
# propre marche aléatoire, totalement indépendante l'une de l'autre :
# rien ne garantissait que les deux mains jouent des notes compatibles
# au même instant. Ici, les deux portées d'un même système piochent
# maintenant dans la MÊME grille d'accords, mesure par mesure.
#
# I - V - vi - IV : progression pop/lofi très courante (do-sol-lam-fa
# en do majeur, par exemple), exprimée en degrés de gamme 0-indexés.
CHORD_PROGRESSION_DEGREES = [0, 4, 5, 3]
MEASURE_SIZE = 4  # nombre de clusters regroupés par "mesure" harmonique


def compute_period(scale):
  """
  Nombre d'indices avant que la gamme ne se répète à l'octave supérieure
  (ex: 7 pour une gamme diatonique de 7 notes, 5 pour une pentatonique).
  """
  base = scale[0] % 12
  for i in range(1, len(scale)):
    if scale[i] % 12 == base:
      return i
  return len(scale)


def build_progression(nb_measures, period):
  """
  Construit la séquence d'accords (un degré racine par mesure), partagée
  par les deux mains d'un même système. Seulement utile si la gamme est
  assez riche pour contenir de vraies dissonances entre ses degrés
  (période >= 6, typiquement une gamme diatonique à 7 notes) : les
  gammes pentatoniques ou arpégées (période plus courte) sont déjà
  consonantes dans toutes les combinaisons, donc aucune restriction
  n'est nécessaire -> on retourne None dans ce cas.
  """
  if period < 6:
    return None
  return [
      CHORD_PROGRESSION_DEGREES[m % len(CHORD_PROGRESSION_DEGREES)]
      for m in range(nb_measures)
  ]


def chord_allowed_indices(scale, period, root_degree):
  """Indices de la gamme correspondant aux notes de l'accord (fondamentale, tierce, quinte)."""
  degrees = {
      root_degree % period,
      (root_degree + 2) % period,
      (root_degree + 4) % period,
  }
  allowed = [i for i in range(len(scale)) if i % period in degrees]
  return allowed or list(range(len(scale)))


def convertir_midi_en_nom(note_midi):
  """Convertit un pitch MIDI en nom lisible (ex: C4, F#5...)."""
  octave = (note_midi // 12) - 1
  nom = NOMS_NOTES[note_midi % 12]
  return f"{nom}{octave}"


def pitch_to_y_position(pitch, is_bass_clef, staff_baseline_y=400):
  """
  Simule une position verticale plausible sur la portée, cohérente avec
  le sens réel (pitch plus aigu -> y plus petit, comme en coordonnées
  image). Ce n'est pas un mapping diatonique exact comme dans le vrai
  script OMR (y_to_midi_pitch), juste une approximation linéaire
  suffisante pour des données de test -- le front n'a pas besoin de la
  précision géométrique réelle, seulement d'un champ y_position présent
  et cohérent en ordre de grandeur.
  """
  reference_pitch = 43 if is_bass_clef else 64  # G2 / E4 : ligne du bas
  px_per_semitone = 4.2
  return round(staff_baseline_y - (pitch - reference_pitch) * px_per_semitone, 1)


def build_cluster(scale, current_idx, chord_chance, x_position, is_bass_clef,
                   duration_weights, chord_pool):
  """Construit un cluster (accord ou note seule) à partir de la gamme.

  Les notes supplémentaires d'un accord sont désormais piochées dans
  `chord_pool` (les indices harmoniquement valides pour la mesure en
  cours) plutôt qu'à des offsets fixes (+2/+4) dans la gamme -> les
  accords générés restent cohérents avec la progression partagée.
  """
  duration = random.choices(DURATIONS, weights=duration_weights, k=1)[0]

  note_indices = {current_idx}
  if random.random() < chord_chance:
    candidates = [i for i in chord_pool if i != current_idx]
    if candidates:
      extra_count = min(len(candidates), random.choice([1, 2]))
      note_indices.update(random.sample(candidates, k=extra_count))

  notes = []
  for idx in sorted(note_indices):
    pitch = scale[idx]
    notes.append({
        "pitch": pitch,
        "note_name": convertir_midi_en_nom(pitch),
        "duration": duration,
        "x_position": float(x_position),
        "y_position": pitch_to_y_position(pitch, is_bass_clef),
    })

  return notes, duration


def generer_staff(staff_index, scale, nb_clusters, chord_chance, is_bass_clef,
                   period, progression):
  clef_label = "Clé de Fa (Bass)" if is_bass_clef else "Clé de Sol (Treble)"

  # La basse (accompagnement) bouge par petits pas et reste posée
  # rythmiquement ; la mélodie (Sol) peut être plus mobile et agitée.
  # C'est ce qui différencie audiblement les deux rôles au lieu d'avoir
  # deux marches aléatoires identiques qui se concurrencent.
  step_choices = [-1, 0, 0, 1] if is_bass_clef else [-2, -1, -1, 0, 1, 1, 2]
  duration_weights = DURATION_WEIGHTS_BASS if is_bass_clef else DURATION_WEIGHTS_TREBLE

  current_idx = random.randrange(len(scale))
  x_position = 60.0
  elements = []

  for cluster_idx in range(nb_clusters):
    if progression is not None:
      # Restreint le choix de note aux tons de l'accord en cours,
      # PARTAGÉ avec l'autre main du même système -> les deux portées
      # jouent désormais dans la même harmonie au même instant, au lieu
      # de deux marches aléatoires indépendantes.
      measure_idx = cluster_idx // MEASURE_SIZE
      root_degree = progression[measure_idx]
      chord_pool = chord_allowed_indices(scale, period, root_degree)

      if current_idx not in chord_pool:
        current_idx = min(chord_pool, key=lambda i: abs(i - current_idx))
      pos = chord_pool.index(current_idx)
      step = random.choice(step_choices)
      new_pos = max(0, min(len(chord_pool) - 1, pos + step))
      current_idx = chord_pool[new_pos]
    else:
      # Gamme déjà intrinsèquement consonante (pentatonique/arpège) :
      # pas de restriction harmonique, juste une fenêtre locale pour
      # limiter l'étendue des accords générés.
      step = random.choice(step_choices)
      current_idx = max(0, min(len(scale) - 1, current_idx + step))
      lo, hi = max(0, current_idx - 4), min(len(scale), current_idx + 5)
      chord_pool = list(range(lo, hi))

    notes, duration = build_cluster(
        scale, current_idx, chord_chance, x_position, is_bass_clef,
        duration_weights, chord_pool,
    )
    elements.append({"cluster_index": cluster_idx, "notes": notes})

    x_position += DURATION_X_STEP[duration]

  return {"staff_index": staff_index, "clef": clef_label, "elements": elements}


def generer_partition_data(style_conf, seed=None):
  if seed is not None:
    random.seed(seed)

  scale_treble = style_conf["scale"]
  # Gamme de la clé de Fa transposée plus bas (mêmes classes de hauteur,
  # registre différent) -> la basse ne joue plus dans le même espace que
  # la mélodie, ce qui évite que les deux mains se marchent dessus.
  scale_bass = [p + style_conf["bass_offset"] for p in style_conf["scale"]]

  nb_staves = style_conf["nb_staves"]
  nb_clusters = style_conf["nb_clusters_per_staff"]
  chord_chance = style_conf["chord_chance"]

  period = compute_period(scale_treble)
  nb_measures = (nb_clusters + MEASURE_SIZE - 1) // MEASURE_SIZE
  # Une seule progression, calculée une fois, PARTAGÉE par tous les
  # systèmes (chaque paire Sol+Fa) -> les deux mains sont toujours
  # d'accord sur l'harmonie du moment.
  progression = build_progression(nb_measures, period)

  partition_data = []
  for i in range(nb_staves):
    is_bass = i % 2 != 0  # alterne Sol / Fa, comme le vrai script OMR
    scale = scale_bass if is_bass else scale_treble
    staff = generer_staff(
        i + 1, scale, nb_clusters, chord_chance, is_bass, period, progression
    )
    partition_data.append(staff)

  return partition_data


def main():
  parser = argparse.ArgumentParser(
      description=(
          "Génère une structure de notes factice, au même format JSON "
          "que le vrai script OMR, pour que le front-end puisse "
          "développer/tester sans dépendre du pipeline YOLO."
      )
  )
  parser.add_argument(
      "--style", choices=["1", "2", "3"], default=None,
      help="1=Lo-Fi, 2=Pop, 3=Électro. Si omis, demandé interactivement.",
  )
  parser.add_argument(
      "--seed", type=int, default=None,
      help="Graine aléatoire, pour rejouer exactement le même résultat.",
  )
  parser.add_argument(
      "--output", default=None,
      help=(
          "Nom du fichier de sortie dans temp_data/. Par défaut : "
          "partition_structure.json (identique au vrai script OMR, "
          "pour que le front lise toujours le même chemin)."
      ),
  )
  args = parser.parse_args()

  print("=== GÉNÉRATEUR DE STRUCTURE DE NOTES (OMR-COMPATIBLE) ===")
  print("1. Lo-Fi / Ambiant")
  print("2. Pop / Variété")
  print("3. Électro / Chiptune")

  choix = args.style
  if choix not in ("1", "2", "3"):
    choix = input("Choisis un style (1, 2 ou 3) [1] : ").strip()
    if choix not in ("1", "2", "3"):
      choix = "1"

  style_conf = STYLES[choix]
  print(f"\n{style_conf['emoji']} Génération de la structure {style_conf['label']}...")

  partition_data = generer_partition_data(style_conf, seed=args.seed)

  os.makedirs("temp_data", exist_ok=True)
  # Même nom de fichier que le vrai script OMR par défaut, pour que le
  # front n'ait jamais à changer de chemin selon la source des données.
  output_name = args.output or "partition_structure.json"
  output_path = os.path.join("temp_data", output_name)

  with open(output_path, "w", encoding="utf-8") as f:
    json.dump(partition_data, f, indent=4, ensure_ascii=False)

  # ==========================================
  # RAPPORT TEXTE -- IDENTIQUE à celui du vrai script OMR
  # (scan_partition_universel.py, section 6), pour que la sortie
  # console soit indiscernable, que les données viennent du vrai
  # pipeline YOLO ou de ce générateur.
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

  print(
      f"\n✅ Données textuelles et JSON prêtes : "
      f"{os.path.abspath(output_path)}"
  )


if __name__ == "__main__":
  main()