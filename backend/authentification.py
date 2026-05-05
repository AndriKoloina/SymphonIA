import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

secret_key = "votre_clé_secrète_pour_jwt"


app = FastAPI()

#Configurattion cors pour autoriser les requêtes du frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Autoriser toutes les origines (à restreindre en production)
    allow_methods=["*"],  # Autoriser toutes les méthodes HTTP  
    allow_headers=["*"],  # Autoriser tous les headers
    allow_credentials=True,  # Autoriser les cookies et les credentials
)

db_configs = {
    "host" : "localhost",
    "database": "symphoniaDb",
    "user": "postgres",
    "password": "0000"
}

class UserAuth(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


def connect_db():
    try:
        conn = psycopg2.connect(
            host="127.0.0.1",
            database="symphoniaDb",
            user="postgres",
            password="0000",
            port="5432" # Port par défaut de Postgres
        )
        return conn
    except Exception as e:
        print("\n" + "="*50)
        print("PROBLÈME DE CONNEXION DETECTÉ :")
        print(e)
        print("="*50 + "\n")
        raise e

@app.on_event("startup")
def startup_event():
    # Crée la table au démarrage
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            mdp TEXT NOT NULL
        );
    """)
    conn.commit()
    cur.close()
    conn.close()


def create_access_token(data:dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")

# ROUTE INSCRIPTION
@app.post("/register")
async def register(user: UserAuth):
    mdp_hashe = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("INSERT INTO utilisateurs (email, mdp, username) VALUES (%s, %s, %s)", (user.email, mdp_hashe, user.username))
        conn.commit()
        return {"status": "success", "message": "Compte créé !"}
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    finally:
        cur.close()
        conn.close()

# ROUTE CONNEXION
@app.post("/login")
async def login(user: UserLogin):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT mdp, username FROM utilisateurs WHERE email = %s", (user.email,))
    resultat = cur.fetchone()

    cur.close()
    conn.close()

    if resultat and bcrypt.checkpw(user.password.encode('utf-8'), resultat[0].encode('utf-8')):
        token = create_access_token({"sub": user.email})
        return {
            "status": "success",
            "message": "Connecté",
            "token": token,
            "user": {
                "username": resultat[1],
            }}
    
    raise HTTPException(status_code=401, detail="Identifiants incorrects")

#route de déconnexion
@app.post("/logout")
async def logout():
    # Ici, on peut simplement retourner un message de succès. 
    # Côté client, il faudra supprimer le token stocké pour "déconnecter" l'utilisateur.
    return {"status": "success", "message": "Déconnecté"}

# Lancer avec : uvicorn nom_du_fichier:app --reload

