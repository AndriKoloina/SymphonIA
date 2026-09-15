# Piano Génératif — Prototype hybride théorie musicale + génération contrôlée

## Comment le faire tourner

```bash
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Puis ouvre `frontend_demo.html` dans ton navigateur (double-clic, ou via un
serveur local type `python3 -m http.server` si ton navigateur bloque les
requêtes locales). Choisis genre/émotion/tonalité, clique "Générer et jouer" :
le son sort via Tone.js, l'animation waterfall se dessine sur le canvas —
les deux sont synchronisés car ils lisent la **même source de vérité**
(le JSON renvoyé par le backend), sans fichier audio séparé à resynchroniser.

## Structure du projet

| Fichier                 | Rôle                                                              |
|--------------------------|--------------------------------------------------------------------|
| `theory.py`              | Gammes, tonalités, construction d'accords à partir de chiffrages romains |
| `chord_library.py`       | Progressions d'accords par (genre, émotion) — **à enrichir en priorité** |
| `emotion_params.py`      | Mapping émotion → tempo / vélocité / densité de notes             |
| `melody_generator.py`    | Génération de la mélodie contrainte par les accords (v1 = marche aléatoire) |
| `composer.py`            | Orchestrateur : assemble tout, produit le JSON final               |
| `api.py`                 | API FastAPI (`/generate`, `/options`)                              |
| `frontend_demo.html`     | Démo minimale : appel API + son Tone.js + animation waterfall canvas |

## Prochaines étapes, dans l'ordre où je te conseille de les faire

1. **Enrichis `chord_library.py`** — c'est le levier le plus rentable pour
   la qualité perçue. Plus tu as de variantes de progressions par
   genre/émotion, moins ce sera répétitif. Zéro ML requis pour ça.

2. **Améliore le rythme d'accompagnement** — actuellement la main gauche
   joue un accord plaqué par mesure. Ajoute des patterns rythmiques
   (arpèges, walking bass pour le jazz, valse pour le classique) dans
   `generate_accompaniment()`.

3. **Remplace la marche aléatoire par une chaîne de Markov** entraînée sur
   quelques fichiers MIDI libres (Nottingham Dataset, JSB Chorales,
   POP909) : ça te fait gagner en cohérence mélodique sans avoir besoin
   de deep learning ni de gros datasets.

4. **Plus tard, transformer** — une fois que tu as assez de données ou de
   temps, remplace `generate_melody()` par un vrai modèle, en gardant la
   contrainte harmonique via masquage des logits (constrained decoding) à
   chaque étape de génération, plutôt qu'en laissant le modèle tout
   apprendre seul.

5. **Ajoute la pédale de sustain** dans le JSON (`sustain: true/false` par
   note ou événements séparés) si tu veux un rendu piano plus réaliste
   côté synthèse frontend.

## Schéma du JSON produit

```json
{
  "metadata": { "genre": "...", "emotion": "...", "tempo_bpm": 70, "total_duration_seconds": 13.7, ... },
  "chords": [ { "roman": "i", "start_time": 0.0, "duration": 3.4, "notes": [60, 63, 67] }, ... ],
  "notes": [ { "pitch": 79, "start_time": 0.0, "duration": 0.88, "velocity": 38, "hand": "right" }, ... ]
}
```

`start_time` et `duration` sont en secondes (déjà convertis depuis le
tempo) — directement exploitables par le frontend pour l'animation et la
programmation audio (Tone.Transport.schedule).
