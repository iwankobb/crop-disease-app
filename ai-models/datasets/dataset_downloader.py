import os
import shutil

# =====================================================================
# CROP DISEASE APP - DATASET ENGINEERING STRATEGY
# =====================================================================
# Quality over Quantity is our core ML principle. In real-world agriculture:
# 1. Plants grow in changing field settings (soil, mud, background clutter).
# 2. Lighting is rarely optimal (harsh sun causing reflections, deep shadows, clouds).
# 3. Mobile cameras used by farmers can be blurry, low-res, or out of focus.
#
# WHICH DATASETS ARE ACTUALLY USEFUL:
# - PlantVillage: Excellent baseline for high-resolution leaf classification, but lacks natural background.
# - Roboflow Universe: Fantastic for bounding-box leaf annotations in real-world field conditions.
# - Kaggle Crop Disease Datasets: Helpful for filling in local tropical crops (like Cassava or Cocoa).
#
# WHICH DATASETS TO AVOID:
# - Avoid clean laboratory datasets with uniform backgrounds (pure white/black sheets). Models trained
#   on these look 99% accurate in training, but drop to 10% in real fields because they learn to fit the background.
#
# DATASET COMBINATION & CLASS BALANCING:
# - We balance classes (e.g., healthy vs rust) by undersampling major classes or applying synthetic augmentations 
#   to minor classes.
# =====================================================================

def init_dataset_structure():
    """Create directory structure for YOLOv8 and MobileNetV2 datasets"""
    print("=== Initializing Dataset Directories ===")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Paths for YOLOv8 Object Detection (Leaf vs Non-Leaf validation)
    yolo_dirs = [
        os.path.join(base_dir, "detection", "images", "train"),
        os.path.join(base_dir, "detection", "images", "val"),
        os.path.join(base_dir, "detection", "labels", "train"),
        os.path.join(base_dir, "detection", "labels", "val")
    ]
    
    # Paths for MobileNetV2 Disease Classification
    classifier_dirs = [
        os.path.join(base_dir, "classification", "train", "maize_healthy"),
        os.path.join(base_dir, "classification", "train", "maize_rust"),
        os.path.join(base_dir, "classification", "train", "cassava_healthy"),
        os.path.join(base_dir, "classification", "train", "cassava_mosaic"),
        os.path.join(base_dir, "classification", "train", "cocoa_healthy"),
        os.path.join(base_dir, "classification", "train", "cocoa_swollen_shoot"),
        os.path.join(base_dir, "classification", "train", "tomato_healthy"),
        os.path.join(base_dir, "classification", "train", "tomato_late_blight"),
        
        os.path.join(base_dir, "classification", "val", "maize_healthy"),
        os.path.join(base_dir, "classification", "val", "maize_rust"),
        os.path.join(base_dir, "classification", "val", "cassava_healthy"),
        os.path.join(base_dir, "classification", "val", "cassava_mosaic"),
        os.path.join(base_dir, "classification", "val", "cocoa_healthy"),
        os.path.join(base_dir, "classification", "val", "cocoa_swollen_shoot"),
        os.path.join(base_dir, "classification", "val", "tomato_healthy"),
        os.path.join(base_dir, "classification", "val", "tomato_late_blight")
    ]
    
    # Create directories
    for d in yolo_dirs + classifier_dirs:
        os.makedirs(d, exist_ok=True)
        print(f"Created: {os.path.relpath(d, base_dir)}")
        
    print("\nDirectory initialization complete.")

def write_yolo_yaml():
    """Create data.yaml configuration file for YOLOv8 training"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    yaml_path = os.path.join(base_dir, "detection", "data.yaml")
    
    content = """# YOLOv8 leaf validation config
path: ../ai-models/datasets/detection  # dataset root dir
train: images/train  # train images (relative to path)
val: images/val      # val images (relative to path)

# Classes: mapping leaf classes and a non-leaf background target
names:
  0: maize_leaf
  1: cassava_leaf
  2: cocoa_leaf
  3: tomato_leaf
  4: non_leaf_object
"""
    with open(yaml_path, 'w') as f:
        f.write(content)
    print(f"Created YOLO config file: {os.path.relpath(yaml_path, base_dir)}")

def explain_augmentation_strategy():
    """Print educational MLOps instructions for the user"""
    print("""
=====================================================================
PRODUCTION-GRADE AUGMENTATION STRATEGY
=====================================================================
To train a model that survives on the farm, we apply online 
augmentations during model feed-forward loops:

1. GEOMETRIC TRANSFORMS:
   - Random Rotations (up to 30 degrees): Simulates leaf tilt on branches.
   - Horizontal and Vertical Flips: Accounts for scanning leaves from different angles.
   - Translation / Shifting: Simulates off-center crop leaf placement.

2. LIGHTING & CONTRAST (Critical):
   - Brightness scaling (0.6 to 1.4): Prepares for both direct noon sunlight and shaded trees.
   - Contrast adjustments: Compensates for low-cost, high-exposure mobile cameras.

3. SENSORY DISTORTION:
   - Gaussian Blur (radius up to 2px): Simulates unsteady farmer hands clicking a photo.
   - Color Jitter (Hue, Saturation changes): Handles leaf color variances (young leaves vs old).

These are configured dynamically inside:
  - train_yolo.py (via Ultralytics Augmentations)
  - train_classifier.py (via tf.keras.layers.RandomRotation, RandomZoom)
=====================================================================
""")

if __name__ == "__main__":
    init_dataset_structure()
    write_yolo_yaml()
    explain_augmentation_strategy()
