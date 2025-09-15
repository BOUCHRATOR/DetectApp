from flask import Flask, request, jsonify
from PIL import Image
import io, os, time
import base64
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.layers import Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
import pandas as pd
import seaborn as sns
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
app.config['PROCESSING_TIMEOUT'] = 300  # 5 minutes
CLASS_NAMES = ["Acne", "Eczema", "Melanome"]  # Remplacez par vos classes réelles
MODEL_PATH = "model_resnet50.h5"

# Charger ou créer le modèle
def load_or_train_model():
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
        print("✅ Modèle chargé depuis", MODEL_PATH)
    else:
        print("⚠️ Entraînement d'un nouveau modèle...")
        model = train_new_model()
    return model

def train_new_model():
    # 1. Préparation des données
    data_dir = "dataset"  # Chemin vers votre dossier d'images
    filepaths = list(glob.glob(data_dir + '/**/*.*'))
    labels = list(map(lambda x: os.path.split(os.path.split(x)[0])[1], filepaths))
    
    data = pd.DataFrame({
        'Filepath': pd.Series(filepaths),
        'label': pd.Series(labels)
    }).sample(frac=1).reset_index(drop=True)
    
    # Split des données
    train, test = train_test_split(data, test_size=0.25, random_state=42)
    train, val = train_test_split(train, test_size=0.25, random_state=42)
    
    # Data augmentation
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=40,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.3,
        horizontal_flip=True,
        vertical_flip=True,
        brightness_range=[0.7, 1.3],
        fill_mode='nearest'
    )
    
    test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    
    train_gen = train_datagen.flow_from_dataframe(
        dataframe=train,
        x_col='Filepath',
        y_col='label',
        target_size=(224, 224),
        class_mode='categorical',
        batch_size=32,
        shuffle=True,
        seed=42
    )
    
    valid_gen = test_datagen.flow_from_dataframe(
        dataframe=val,
        x_col='Filepath',
        y_col='label',
        target_size=(224, 224),
        class_mode='categorical',
        batch_size=32,
        shuffle=False,
        seed=42
    )
    
    # Construction du modèle
    pretrained_model = ResNet50(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    pretrained_model.trainable = False
    
    inputs = Input(shape=(224, 224, 3))
    base = pretrained_model(inputs)
    x = Dense(128, activation='relu')(base)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    outputs = Dense(len(CLASS_NAMES), activation='softmax')(x)
    model = Model(inputs=inputs, outputs=outputs)
    
    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Entraînement
    history = model.fit(
        train_gen,
        validation_data=valid_gen,
        epochs=50,
        callbacks=[EarlyStopping(monitor='val_accuracy', patience=3)]
    )
    
    model.save(MODEL_PATH)
    print("✅ Nouveau modèle entraîné et sauvegardé")
    return model

# Charger le modèle au démarrage
model = load_or_train_model()

def preprocess_image(image):
    """Prétraite l'image pour la classification"""
    image = image.resize((224, 224))
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = preprocess_input(image)
    return image

@app.route('/process', methods=['POST'])
def process():
    start_time = time.time()
    
    try:
        # Vérification des entrées
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 415
            
        data = request.get_json()
        if not data or 'chemin' not in data:
            return jsonify({'error': 'Le champ "chemin" est requis'}), 400

        # Décodage de l'image
        try:
            image_data = data['chemin'].split(',')[1] if ',' in data['chemin'] else data['chemin']
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image.verify()
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            # image.save("received_image.jpg")
        except Exception as e:
            return jsonify({'error': f'Erreur de décodage: {str(e)}'}), 400

        # Prédiction
        try:
            processed_image = preprocess_image(image)
            predictions = model.predict(processed_image)
            predicted_class = CLASS_NAMES[np.argmax(predictions)]
            top_probability = np.max(predictions) * 100
            
            return jsonify({
                'success': True,
                'diagnostic': predicted_class,
                'probabilite': f"{top_probability:.1f}",
                'temps': f"{time.time()-start_time:.2f}s"
            })
                
        except Exception as e:
            return jsonify({'error': f'Erreur de traitement: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)