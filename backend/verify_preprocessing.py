import os
import numpy as np
import tensorflow as tf
from PIL import Image

# Setup paths
MODEL_PATH = r"d:\Project2K26\FarmVerse_AI\trained_models\farmverse_cotton_model.keras"
IMG1_PATH = r"d:\Project2K26\FarmVerse_AI\backend\media\diseases\Screenshot_2026-02-10_220056.png"
IMG2_PATH = r"d:\Project2K26\FarmVerse_AI\backend\media\diseases\Screenshot_2026-07-13_182453.png"

print("Loading Keras model...")
model = tf.keras.models.load_model(MODEL_PATH)

def run_predictions(rescale=True):
    print(f"\n--- Running predictions with rescale={rescale} ---")
    for img_path in [IMG1_PATH, IMG2_PATH]:
        image = Image.open(img_path).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image, dtype=np.float32)
        if rescale:
            img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        preds = model.predict(img_array, verbose=0)
        print(f"Image: {os.path.basename(img_path)}")
        print("Input shape:", img_array.shape)
        print("Input min:", img_array.min())
        print("Input max:", img_array.max())
        print("Raw predictions:", preds)
        print("Max index:", np.argmax(preds[0]))

if __name__ == "__main__":
    run_predictions(rescale=True)
    run_predictions(rescale=False)
