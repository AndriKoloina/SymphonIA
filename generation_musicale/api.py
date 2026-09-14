"""
API FastAPI : reçoit les choix utilisateur, renvoie le JSON de la musique générée.

Lancer avec : uvicorn api:app --reload --port 8000
Puis tester : http://localhost:8000/docs (interface Swagger auto-générée)
"""
from typing import Optional, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from composer import compose
from chord_library import PROGRESSIONS
from emotion_params import EMOTION_PARAMS

app = FastAPI(title="Piano Generator API - Structured Mode")

# Permet au frontend (autre origine/port) d'appeler l'API depuis le navigateur
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre à ton domaine frontend en production
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    genre: str
    emotion: str
    key: str = "C"
    mode: Literal["major", "minor"] = "minor"
    measures: int = 8  # Conservé pour la compatibilité front-end, mais géré par le backend
    tempo_bpm: Optional[int] = None


@app.post("/generate")
def generate(req: GenerateRequest):
    if req.emotion not in EMOTION_PARAMS:
        raise HTTPException(400, f"Émotion invalide. Choix: {list(EMOTION_PARAMS)}")

    # L'appel à compose gère désormais la structure complète du morceau automatiquement
    return compose(
        genre=req.genre,
        emotion=req.emotion,
        key=req.key,
        mode=req.mode,
        measures=req.measures,
        tempo_bpm=req.tempo_bpm,
    )


@app.get("/options")
def options():
    """Permet au frontend de construire dynamiquement les cases à cocher
    à partir de ce que le backend sait réellement générer."""
    genres_emotions = sorted({g for g, e in PROGRESSIONS})
    return {
        "genres": genres_emotions,
        "emotions": list(EMOTION_PARAMS.keys()),
        "modes": ["major", "minor"],
    }
