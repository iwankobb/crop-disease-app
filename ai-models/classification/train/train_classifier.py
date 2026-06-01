import os
import sys
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# =====================================================================
# UNDER THE HOOD: TRANSFER LEARNING WITH MOBILENETV2
# =====================================================================
# Training a deep convolutional neural network from scratch requires
# hundreds of thousands of labeled images and massive GPU server farms.
# Instead, we use a powerful MLOps technique: **Transfer Learning**.
#
# 1. FEATURE EXTRACTION:
#    MobileNetV2 has already been trained on the ImageNet dataset (1.4 million
#    images, 1000 categories). It already knows how to recognize edge gradients,
#    leaf veins, color spots, and organic circular shapes.
#    By freezing its base convolutional layers (`trainable = False`), we keep 
#    these generalized visual filters intact and only train the final classification head.
#
# 2. OVERFITTING PREVENTION:
#    - Dropout (0.4): Randomly disables 40% of hidden neurons during each 
#      training batch. This forces the network to learn redundant features and 
#      prevents it from memorizing the training images (overfitting).
#    - Early Stopping: Monitors validation loss and halts training when the model
#      stops improving, saving us CPU cycles and preventing model degradation.
#
# 3. SOFTMAX:
#    The final dense layer outputs a vector of raw scores (logits). The Softmax
#    activation function normalizes these logits into a probability distribution
#    where all values sum to 1. Each index corresponds to the model's confidence
#    for that specific disease class.
# =====================================================================

def build_transfer_model(num_classes=8, img_size=(224, 224)):
    """Assemble MobileNetV2 architecture with custom classification head"""
    print(f"--- Building MobileNetV2 Transfer Learning Model (Classes: {num_classes}) ---")
    
    # 1. Base MobileNetV2 (freeze convolutional base)
    base_model = MobileNetV2(
        input_shape=(img_size[0], img_size[1], 3),
        include_top=False, # Do not include the final 1000-class ImageNet layer
        weights="imagenet"
    )
    base_model.trainable = False
    
    # 2. Add sequential classification top
    inputs = tf.keras.Input(shape=(img_size[0], img_size[1], 3))
    
    # Scale inputs from [0, 255] to [-1, 1] as required by MobileNetV2
    x = layers.Lambda(lambda val: (val / 127.5) - 1.0)(inputs)
    
    # Custom Data Augmentation (integrated directly into the model graph)
    x = layers.RandomFlip("horizontal_and_vertical")(x)
    x = layers.RandomRotation(0.2)(x)
    x = layers.RandomZoom(0.15)(x)
    
    # Convolutional outputs
    x = base_model(x, training=False)
    
    # Pooling & Dropout
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.4)(x)  # Strong dropout to prevent overfitting
    
    # Final Softmax logits output layer
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    
    model = models.Model(inputs, outputs)
    
    # Compile with custom Adam optimizer
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    model.summary()
    return model

def train_classifier():
    """Load datasets and initiate local training"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    dataset_dir = os.path.join(base_dir, "datasets", "classification")
    
    train_path = os.path.join(dataset_dir, "train")
    val_path = os.path.join(dataset_dir, "val")
    
    img_size = (224, 224)
    batch_size = 16 # Optimized for M1 memory footprint
    
    print("\n--- Loading Classification Datasets from Disk ---")
    try:
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_path,
            image_size=img_size,
            batch_size=batch_size,
            shuffle=True
        )
        
        val_ds = tf.keras.utils.image_dataset_from_directory(
            val_path,
            image_size=img_size,
            batch_size=batch_size,
            shuffle=False
        )
        
        class_names = train_ds.class_names
        print(f"Target categories found: {class_names}")
        
    except Exception as e:
        print(f"Dataset load failed: {e}")
        print("Please verify that dataset downloader has initialized folders.")
        sys.exit(1)
        
    # Build model
    model = build_transfer_model(num_classes=len(class_names))
    
    # Define production callbacks
    checkpoint_path = os.path.join(base_dir, "classification", "mobilenetv2_crop_classifier.h5")
    
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor="val_loss",
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3, # Halt if validation loss doesn't improve for 3 epochs
            restore_best_weights=True,
            verbose=1
        )
    ]
    
    print("\n--- Launching Transfer Learning ---")
    # Limit training to 10 epochs for resource-efficiency during development
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        callbacks=callbacks
    )
    
    print(f"\n--- Training Complete! Model exported to: {checkpoint_path} ---")

if __name__ == "__main__":
    train_classifier()
