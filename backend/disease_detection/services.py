import os
import json
import logging
from django.conf import settings
import numpy as np
from PIL import Image

# Suppress TensorFlow logging warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

logger = logging.getLogger(__name__)

# Paths to trained model files
MODEL_DIR = os.path.join(settings.BASE_DIR, '..', 'trained_models')
MODEL_PATH = os.path.abspath(os.path.join(MODEL_DIR, 'farmverse_cotton_model.keras'))
LABELS_PATH = os.path.abspath(os.path.join(MODEL_DIR, 'labels.json'))

# Model global cache variables to ensure we load them only once
_model = None
_labels = None

# Class-specific details for the 6 cotton model classes
DISEASE_DETAILSInfo = {
    "Aphids": {
        "status": "Diseased",
        "description": "Aphids are tiny, soft-bodied insects that suck sap from cotton leaves, causing them to curl downwards, turn yellow, and secrete sticky honeydew.",
        "treatment": "Apply organic neem oil or recommended chemical insecticides such as imidacloprid to control the aphid population. Introduce natural predators like ladybugs.",
        "prevention": "Monitor plants weekly, especially under leaves. Control weed hosts surrounding the field and avoid excessive nitrogen fertilizer."
    },
    "Army worm": {
        "status": "Diseased",
        "description": "Army worm larvae chew large, irregular holes in cotton leaves and squares, defoliating plants rapidly in severe outbreaks.",
        "treatment": "Apply bacillus thuringiensis (Bt) spray or chemical insecticides containing active ingredients like spinosad or chlorantraniliprole.",
        "prevention": "Practice crop rotation, deep summer plowing to destroy pupae, and maintain clean margins. Use pheromone traps to monitor adult moths."
    },
    "Bacterial Blight": {
        "status": "Diseased",
        "description": "Bacterial Blight (or angular leaf spot) causes liquid or water-soaked leaf spots on cotton leaves that eventually turn black or dark brown, sometimes causing blackarm.",
        "treatment": "Apply copper-based fungicides if infections occur early. Destroy infected plant residue after harvest to prevent residue carryover.",
        "prevention": "Plant certified acid-delinted disease-resistant seed varieties. Avoid sprinkler/overhead irrigation to reduce moisture on foliage."
    },
    "Healthy": {
        "status": "Healthy",
        "description": "Leaves exhibit normal green coloration, healthy turgidity, and no visible damage or discoloration.",
        "treatment": "No chemical treatment is needed. Your cotton crop is healthy and growing well!",
        "prevention": "Maintain regular irrigation cycles, balanced N-P-K fertilization, and continuous field monitoring for pests and diseases."
    },
    "Powdery Mildew": {
        "status": "Diseased",
        "description": "Powdery Mildew is characterized by white to grey powdery fungal growth appearing on the upper or lower surface of leaves, causing premature leaf drop.",
        "treatment": "Apply sulfur-based fungicides or systemic fungicides like hexaconazole immediately upon first sign of infection.",
        "prevention": "Ensure proper plant spacing for air circulation and sunlight penetration. Keep fields free of volunteer host plants."
    },
    "Target spot": {
        "status": "Diseased",
        "description": "Target spot produces circular lesions on lower leaves with concentric dark rings resembling a target board, leading to defoliation.",
        "treatment": "Apply strobilurin or carboxamide-based fungicides during early bloom stage if disease pressure is high.",
        "prevention": "Rotate cotton crops with non-host crops. Manage canopy density to restrict humidity levels. Use resistant cotton cultivars."
    }
}

def get_model():
    """Returns the cached Keras model or loads it if not already cached."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        
        # Import TensorFlow only when needed
        import tensorflow as tf
        logger.info(f"Loading Keras model from {MODEL_PATH}...")
        _model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("Model loaded successfully.")
    return _model

def get_labels():
    """Returns the cached label indices dictionary or loads it if not already cached."""
    global _labels
    if _labels is None:
        if not os.path.exists(LABELS_PATH):
            raise FileNotFoundError(f"Labels mapping file not found at {LABELS_PATH}")
        with open(LABELS_PATH, 'r') as f:
            data = json.load(f)
            # Ensure keys are integers
            _labels = {int(k): v for k, v in data.items()}
    return _labels

def predict_cotton_disease(image_file):
    """
    Accepts an uploaded image, converts it to RGB at 224x224, scales by 1/255.0,
    predicts using the trained model, and returns the result, confidence, 
    probabilities dictionary, and relevant treatment information.
    """
    try:
        model = get_model()
        labels = get_labels()
    except Exception as e:
        logger.error(f"Failed to load modeling assets: {str(e)}")
        raise RuntimeError(f"Model loading error: {str(e)}")

    # Load image using Pillow
    try:
        img = Image.open(image_file).convert('RGB')
    except Exception as e:
        raise ValueError(f"Invalid image format or corrupted file: {str(e)}")

    # Resize image to 224x224
    img_resized = img.resize((224, 224))

    # Convert to NumPy array (retains 0-255 range since EfficientNetB0 has built-in Rescaling)
    img_array = np.array(img_resized, dtype=np.float32)

    # Add batch dimension (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)

    # Run predictions
    try:
        print("Input shape:", img_array.shape)
        print("Input min:", img_array.min())
        print("Input max:", img_array.max())
        preds = model.predict(img_array, verbose=0)
        print("Raw predictions:", preds)
    except Exception as e:
        logger.error(f"Inference execution failed: {str(e)}")
        raise RuntimeError(f"Prediction logic failed: {str(e)}")

    probs = preds[0]
    predicted_idx = int(np.argmax(probs))
    prediction_name = labels.get(predicted_idx, "Unknown")
    confidence = float(probs[predicted_idx]) * 100.0

    # Format all probability outputs
    probabilities = {}
    for idx, prob in enumerate(probs):
        class_name = labels.get(idx, f"Class_{idx}")
        probabilities[class_name] = round(float(prob) * 100.0, 2)

    # Resolve treatment info
    info = DISEASE_DETAILSInfo.get(prediction_name, {
        "status": "Diseased",
        "description": "Unknown cotton crop anomaly.",
        "treatment": "Please consult an agricultural expert.",
        "prevention": "Practice general sanitation and regular monitoring."
    })

    return {
        "prediction": prediction_name,
        "confidence": round(confidence, 2),
        "probabilities": probabilities,
        "status": info["status"],
        "description": info["description"],
        "treatment": info["treatment"],
        "prevention": info["prevention"]
    }
