from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import face_recognition
import time
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

def base64_to_image(base64_string):
    try:
        # Décoder la base64
        image_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"Erreur de décodage base64: {e}")
        return None

def image_to_encoding(image):
    try:
        if image is None:
            return None
            
        # Convertir en RGB pour face_recognition
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Détecter les visages
        face_locations = face_recognition.face_locations(rgb_image)
        print(f"Visages détectés: {len(face_locations)}")
        
        if len(face_locations) == 0:
            return None
            
        # Encoder le premier visage
        encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if len(encodings) == 0:
            return None
            
        return encodings[0]
        
    except Exception as e:
        print(f"Erreur d'encodage: {e}")
        return None

@app.route('/scanne', methods=['POST'])
def scanne():
    start_time = time.time()
    
    try:
        data = request.get_json()
        print("Données reçues, nombre d'utilisateurs:", len(data.get('datausers', [])))
        
        if not data or 'datausers' not in data or 'scanned_image_base64' not in data:
            return jsonify({'error': 'Données manquantes'}), 400

        # Décoder l'image scannée
        scanned_image = base64_to_image(data['scanned_image_base64'])
        if scanned_image is None:
            return jsonify({'error': 'Erreur de décodage de l\'image scannée'}), 400
            
        scanned_encoding = image_to_encoding(scanned_image)
        if scanned_encoding is None:
            return jsonify({'error': 'Aucun visage détecté sur l\'image scannée'}), 400
        # Parcourir tous les utilisateurs
        for i, user in enumerate(data['datausers']):
            if not user.get('profile'):
                print(f"Utilisateur {i}: Pas de profil")
                continue
                
            print(f"Traitement de l'utilisateur {i}: {user.get('prenom')} {user.get('nom')}")
                
            # Décoder l'image de profil
            profile_image = base64_to_image(user['profile'])
            if profile_image is None:
                print(f"Utilisateur {i}: Erreur de décodage du profil")
                continue
                
            profile_encoding = image_to_encoding(profile_image)
            if profile_encoding is None:
                print(f"Utilisateur {i}: Aucun visage détecté dans le profil")
                continue
                
            # Comparer les visages
            result = face_recognition.compare_faces([scanned_encoding], profile_encoding)
            distance = face_recognition.face_distance([scanned_encoding], profile_encoding)
            
            print(f"Utilisateur {i}: Résultat={result[0]}, Distance={distance[0]:.3f}")
            
            if result[0] and distance[0] < 0.6:  # Seuil de confiance
                print(f"MATCH TROUVÉ! Utilisateur {user['prenom']} {user['nom']}")
                return jsonify({
                    'id': user['id'],
                    'nom': user['nom'],
                    'prenom': user['prenom'],
                    'confidence': float(1 - distance[0]),
                    'time': round(time.time() - start_time, 2)
                }), 200
        return jsonify({
            'status': 'error', 
            'message': 'Aucun utilisateur correspondant trouvé'
        }), 404
        
    except Exception as e:
        print(f"Erreur générale: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error', 
            'message': f'Erreur interne: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)