import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, Header, UploadFile, File
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os


secret_key = "votre_clé_secrète_pour_jwt"


app = FastAPI()

#Configurattion cors pour autoriser les requêtes du frontend

origins = [
    "http://localhost:3000",
    "http://desktop-9tf6lvh.local:3000",
    "http://172.20.10.2:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
        # Autoriser toutes les origines (à restreindre en production)
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

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    new_password: Optional[str] = None


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
    return encoded_jwt

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
                "email": user.email
            }}
    
    raise HTTPException(status_code=401, detail="Identifiants incorrects")

def get_current_user_email(authorization: str = Header(None)):
    print("\n--- TENTATIVE D'AUTHENTIFICATION ---")
    print(f"Header Authorization complet : {authorization}")
    
    if not authorization:
        print("ÉCHEC : Aucun header trouvé.")
        raise HTTPException(status_code=401, detail="Header manquant")

    try:
        # 1. Vérification du split
        scheme, token = authorization.split()
        print(f"Schéma : {scheme} | Token : {token[:10]}...")
        
        # 2. Tentative de décodage manuel pour voir l'erreur
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        print(f"SUCCÈS : Payload décodé -> {payload}")
        return payload.get("sub")
        
    except Exception as e:
        print(f"ÉCHEC FINAL : {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))
    
@app.put("/update-profile")
async def update_profile(
    user_update: UserUpdate, 
    current_email: str = Depends(get_current_user_email)
):
    conn = connect_db()
    cur = conn.cursor()

    try:
        # On prépare la construction dynamique de la requête
        updates = []
        params = []

        if user_update.username:
            updates.append("username = %s")
            params.append(user_update.username)
        
        if user_update.email:
            updates.append("email = %s")
            params.append(user_update.email)

        if user_update.new_password:
            new_mdp_hash = bcrypt.hashpw(user_update.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            updates.append("mdp = %s")
            params.append(new_mdp_hash)

        if not updates:
            raise HTTPException(status_code=400, detail="Aucune donnée à modifier")

        # On ajoute l'email actuel pour la clause WHERE
        sql = f"UPDATE utilisateurs SET {', '.join(updates)} WHERE email = %s"
        params.append(current_email)

        cur.execute(sql, tuple(params))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        conn.commit()
        return {"status": "success", "message": "Profil mis à jour"}

    except Exception as e:
        conn.rollback()
        print(f"Erreur SQL détaillée : {e}") # Pour voir l'erreur précise dans votre console
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")
    finally:
        cur.close()
        conn.close()
#route de déconnexion
@app.post("/logout")
async def logout():
    # Ici, on peut simplement retourner un message de succès. 
    # Côté client, il faudra supprimer le token stocké pour "déconnecter" l'utilisateur.
    return {"status": "success", "message": "Déconnecté"}


# Lancer avec : uvicorn nom_du_fichier:app --reload

