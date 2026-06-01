import sys

def check_pytorch():
    print("=== PyTorch Diagnostic ===")
    try:
        import torch
        print(f"PyTorch Version: {torch.__version__}")
        
        # Check for MPS (Metal Performance Shaders) for Apple Silicon
        mps_available = torch.backends.mps.is_available()
        print(f"MPS (Apple Silicon GPU) Available: {mps_available}")
        
        if mps_available:
            # Run a small tensor operation on the M1 GPU
            device = torch.device("mps")
            x = torch.ones(5, 5, device=device)
            y = x * 2
            print(f"MPS Tensor operation test succeeded: result elements: {y[0].tolist()}")
        else:
            print("WARNING: MPS acceleration is not available. PyTorch will run on CPU.")
            
    except ImportError as e:
        print(f"PyTorch NOT installed: {e}")
    print()

def check_tensorflow():
    print("=== TensorFlow Diagnostic ===")
    try:
        import tensorflow as tf
        print(f"TensorFlow Version: {tf.__version__}")
        
        # Check for physical GPU devices (which includes Apple Silicon GPU via metal plug-in)
        gpus = tf.config.list_physical_devices('GPU')
        print(f"GPUs available to TensorFlow: {gpus}")
        
        if len(gpus) > 0:
            print("TensorFlow successfully detected Apple Silicon GPU acceleration!")
        else:
            print("WARNING: No physical GPU detected for TensorFlow. It will run on CPU.")
            
    except ImportError as e:
        print(f"TensorFlow NOT installed: {e}")
    print()

if __name__ == "__main__":
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    print()
    check_pytorch()
    check_tensorflow()
