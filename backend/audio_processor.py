import os
import uuid

def save_music(cursor, title, audio_file, user_id):
    upload_dir = "uploads/sounds"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    extension = os.path.splitext(audio_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            content = audio_file.file.read()
            buffer.write(content)

        sql = """
            INSERT INTO sounds (title, file_url, user_id, date_created) 
            VALUES (%s, %s, %s, NOW()) 
            RETURNING id;
        """
        cursor.execute(sql, (title, file_path, user_id))

        new_id = cursor.fetchone()[0]

        return {
            "id": new_id,
            "title": title,
            "file_url": file_path,
            "user_id": user_id
        }

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"Erreur lors de l'enregistrement : {e}")
        raise e