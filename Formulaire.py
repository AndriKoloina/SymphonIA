import psycopg2
import bcrypt

# 1. Configuration de ta base Symphonai
DB_CONFIG = {
    "host": "localhost",
    "database": "symphonai",
    "user": "manana",
    "password": "Die Freiheit"
}

def connect_db():
    return psycopg2.connect(**DB_CONFIG)

# 2. Création de la table (s'exécute au lancement)
def initialiser_structure():
    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS utilisateurs (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                mdp TEXT NOT NULL
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Erreur d'initialisation : {e}")

# 3. Fonction Inscription
def formulaire_inscription():
    print("\n--- INSCRIPTION SÉCURISÉE ---")
    email = input("Email : ")
    mdp = input("Mot de passe : ")

    if not email or not mdp:
        print("Erreur : Veuillez remplir tous les champs.")
        return

    # Hashage du mot de passe pour la sécurité
    mdp_hashe = bcrypt.hashpw(mdp.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("INSERT INTO utilisateurs (email, mdp) VALUES (%s, %s)", (email, mdp_hashe))
        conn.commit()
        print("✅ Compte créé avec succès !")
    except psycopg2.errors.UniqueViolation:
        print("❌ Erreur : Cet email est déjà utilisé.")
    except Exception as e:
        print(f"❌ Erreur : {e}")
    finally:
        cur.close()
        conn.close()

# 4. Fonction Connexion
def formulaire_connexion():
    print("\n--- CONNEXION ---")
    email = input("Email : ")
    mdp_saisi = input("Mot de passe : ")

    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("SELECT mdp FROM utilisateurs WHERE email = %s", (email,))
        resultat = cur.fetchone()

        if resultat:
            # On vérifie si le MDP saisi correspond au Hash en base
            if bcrypt.checkpw(mdp_saisi.encode('utf-8'), resultat[0].encode('utf-8')):
                print("Welcome ! Connexion réussie.")
            else:
                print("❌ Mot de passe incorrect.")
        else:
            print("❌ Aucun compte trouvé pour cet email.")
    except Exception as e:
        print(f"❌ Erreur : {e}")
    finally:
        cur.close()
        conn.close()

# 5. Fonction Mot de passe oublié
def reinitialiser_mdp():
    print("\n--- RÉINITIALISATION ---")
    email = input("Entrez votre email pour vérification : ")

    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM utilisateurs WHERE email = %s", (email,))
        
        if cur.fetchone():
            nouveau_mdp = input("Entrez votre nouveau mot de passe : ")
            # Nouveau hashage
            mdp_hashe = bcrypt.hashpw(nouveau_mdp.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cur.execute("UPDATE utilisateurs SET mdp = %s WHERE email = %s", (mdp_hashe, email))
            conn.commit()
            print("✅ Mot de passe mis à jour !")
        else:
            print("❌ Email inconnu.")
    except Exception as e:
        print(f"❌ Erreur : {e}")
    finally:
        cur.close()
        conn.close()

# --- PROGRAMME PRINCIPAL ---
if __name__ == "__main__":
    initialiser_structure()
    
    while True:
        print("\n--- MENU SYMPHONAI ---")
        print("1. S'inscrire")
        print("2. Se connecter")
        print("3. Mot de passe oublié")
        print("4. Quitter")
        
        choix = input("\nVotre choix : ")
        
        if choix == "1":
            formulaire_inscription()
        elif choix == "2":
            formulaire_connexion()
        elif choix == "3":
            reinitialiser_mdp()
        elif choix == "4":
            print("Au revoir !")
            break
        else:
            print("Choix invalide.")
