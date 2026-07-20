import os
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def main():
    # Make sure target directories exist
    os.makedirs('trained_models', exist_ok=True)
    os.makedirs('training', exist_ok=True)

    csv_path = os.path.join('datasets', 'gujarat_crop_recommendation.csv')
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        return

    # 1. Read CSV using pandas
    print("--- 1. Loading Dataset ---")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")

    # 2. Check for missing values and duplicate rows
    print("\n--- 2. Auditing Dataset ---")
    missing_values = df.isnull().sum().sum()
    duplicate_rows = df.duplicated().sum()
    print(f"Total missing values: {missing_values}")
    print(f"Total duplicate rows: {duplicate_rows}")

    # Clean duplicates if any
    if duplicate_rows > 0:
        df = df.drop_duplicates()
        print(f"Duplicates removed. New dataset shape: {df.shape}")

    # 3. Label encoding categorical columns
    print("\n--- 3. Encoding Categorical Features ---")
    categorical_cols = ['soil_type', 'season', 'district', 'irrigation']
    encoders = {}

    for col in categorical_cols:
        le_col = LabelEncoder()
        df[col] = le_col.fit_transform(df[col].astype(str))
        encoders[col] = le_col
        
        # Save individual categorical encoder to trained_models/
        encoder_name = 'soil' if col == 'soil_type' else col
        encoder_path = os.path.join('trained_models', f'{encoder_name}_encoder.pkl')
        with open(encoder_path, 'wb') as f:
            pickle.dump(le_col, f)
        print(f"✔ Pickled and saved {encoder_name}_encoder.pkl")

    # 4. Split dataset into features X and target y
    print("\n--- 4. Splitting Dataset (80% Train, 20% Test) ---")
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'soil_type', 'season', 'district', 'irrigation']
    X = df[feature_cols]
    y = df['label']

    # Fit and save target label encoder
    le_label = LabelEncoder()
    y_encoded = le_label.fit_transform(y.astype(str))
    
    label_encoder_path = os.path.join('trained_models', 'label_encoder.pkl')
    with open(label_encoder_path, 'wb') as f:
        pickle.dump(le_label, f)
    print("✔ Pickled and saved label_encoder.pkl")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"Train features shape: {X_train.shape}")
    print(f"Test features shape: {X_test.shape}")

    # 5. Train Model options: Random Forest, Decision Tree, KNN
    print("\n--- 5. Training Models & Performing Cross Validation (5-Fold) ---")
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5)
    }

    model_test_accuracies = {}
    model_cv_scores = {}

    for name, model in models.items():
        # Train model fit
        model.fit(X_train, y_train)
        
        # Predict on test
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        model_test_accuracies[name] = acc

        # Cross Validation metric
        cv_scores = cross_val_score(model, X, y_encoded, cv=5)
        model_cv_scores[name] = cv_scores
        print(f"{name}:")
        print(f"  Test Accuracy: {acc:.4f}")
        print(f"  Cross-Val Mean Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

    # 6 & 7. Compare accuracy scores and select best model automatically
    print("\n--- 6 & 7. Model Selection ---")
    best_model_name = max(model_test_accuracies, key=model_test_accuracies.get)
    best_model = models[best_model_name]
    best_accuracy = model_test_accuracies[best_model_name]
    print(f"Best performing model on test set: {best_model_name} with Accuracy: {best_accuracy:.4f}")

    # 8. Display metrics for best model
    print("\n--- 8. Detailed Metrics for the Best Model ---")
    y_best_pred = best_model.predict(X_test)
    
    prec = precision_score(y_test, y_best_pred, average='weighted')
    rec = recall_score(y_test, y_best_pred, average='weighted')
    f1 = f1_score(y_test, y_best_pred, average='weighted')
    
    print(f"Accuracy:  {best_accuracy:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_best_pred))

    print("\nClassification Report:")
    print(classification_report(y_test, y_best_pred, target_names=le_label.classes_))

    # 10. Save trained model
    model_save_path = os.path.join('trained_models', 'crop_model.pkl')
    with open(model_save_path, 'wb') as f:
        pickle.dump(best_model, f)
    print(f"✔ Saved crop_model.pkl ({best_model_name})")

    # 12. Save features json config (ensuring strict order matching)
    features_save_path = os.path.join('trained_models', 'features.json')
    with open(features_save_path, 'w') as f:
        json.dump(feature_cols, f)
    print("✔ Saved features.json")

    print("\n✔ Training completed successfully")
    print(f"✔ Best Accuracy: {best_accuracy:.4f}")

if __name__ == '__main__':
    main()
