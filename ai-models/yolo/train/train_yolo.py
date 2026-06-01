import os
import sys
import torch
from ultralytics import YOLO

# =====================================================================
# UNDER THE HOOD: HOW YOLOv8 OBJECT DETECTION WORKS
# =====================================================================
# YOLO (You Only Look Once) revolutionized computer vision by reframing
# object detection as a single regression problem.
#
# 1. ANCHOR-FREE SEGREGATION:
#    Unlike older models that used fixed anchor boxes, YOLOv8 predicts the
#    center of objects directly along with bounding box offsets. This is
#    faster and generalizes better to partial or varying leaf shapes.
#
# 2. METRICS EXPLAINED:
#    - Bounding Box (x, y, w, h): Center coordinates (x, y) and dimensions (w, h)
#      normalized between 0 and 1 relative to the input image size.
#    - Confidence Score: Probability that a box contains an object ($P(Obj)$)
#      multiplied by the Intersection over Union ($IoU$) between prediction and target.
#    - Intersection over Union (IoU): The overlap ratio of the predicted box and the
#      ground-truth box. ($IoU = \\frac{Area of Overlap}{Area of Union}$).
#    - Mean Average Precision (mAP): The area under the Precision-Recall curve
#      evaluated at different IoU thresholds (typically $mAP_{50}$ and $mAP_{50-95}$).
#
# 3. HARDWARE TUNING ON M1:
#    We target PyTorch Metal Performance Shaders (`device='mps'`). This loads
#    network layers directly into the M1's GPU.
# =====================================================================

def check_m1_gpu():
    """Verify Apple Silicon hardware acceleration is enabled"""
    if torch.backends.mps.is_available():
        print("SUCCESS: Apple Silicon M1 GPU acceleration (MPS) is available.")
        return "mps"
    else:
        print("WARNING: Apple Silicon GPU not found. Falling back to CPU training.")
        return "cpu"

def run_training():
    """Launch local leaf-detection training"""
    device = check_m1_gpu()
    
    # Locate dataset yaml relative to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_yaml_path = os.path.join(base_dir, "datasets", "detection", "data.yaml")
    
    if not os.path.exists(data_yaml_path):
        print(f"ERROR: Bounding box config file not found at: {data_yaml_path}")
        sys.exit(1)
        
    print(f"\n--- Loading pre-trained YOLOv8 Nano model ---")
    # Load coco pre-trained weights to perform local transfer learning
    model = YOLO("yolov8n.pt") 
    
    print("\n--- Starting Bounding Box Leaf Validation Training ---")
    # Train the model
    # We restrict to 10 epochs for this local setup, utilizing batch size of 8
    # to fit comfortably inside the M1's unified RAM alongside Flask and Chrome.
    results = model.train(
        data=data_yaml_path,
        epochs=10,
        imgsz=640,
        batch=8,
        device=device,
        workers=2,
        project=os.path.join(base_dir, "yolo", "train", "runs"),
        name="leaf_validator",
        exist_ok=True,
        # Online field-condition augmentations configured here
        degrees=15.0,     # Rotate crop leaves by 15 deg
        fliplr=0.5,       # Randomly flip leaves horizontally
        blur=0.2          # Apply blur to model motion shake
    )
    
    print("\n--- Training Finished! ---")
    print(f"Best model weights saved under: runs/leaf_validator/weights/best.pt")
    
if __name__ == "__main__":
    run_training()
