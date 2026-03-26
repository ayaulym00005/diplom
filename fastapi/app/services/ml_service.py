"""
ML inference service.

Model: MobileNetV2-based classifier trained on Oily-Dry-Skin-Types dataset.
Input:  224×224 RGB image, preprocessed with tf.keras.applications.mobilenet_v2.preprocess_input
Output: softmax probabilities over 4 classes
"""
import io
import logging
from typing import Dict, Tuple

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Class labels in the order the model was trained ──────────────────────────
# Adjust this order if your dataset folders were in a different alphabetical order.
# Common order when using ImageDataGenerator with flow_from_directory:
# alphabetical → combination, dry, normal, oily
CLASS_NAMES: list[str] = ["combination", "dry", "normal", "oily"]

_model = None  # lazy-loaded singleton


def _load_model():
    global _model
    if _model is None:
        try:
            import tensorflow as tf
            logger.info(f"Loading model from {settings.MODEL_PATH} ...")
            _model = tf.keras.models.load_model(settings.MODEL_PATH)
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Could not load skin type model: {e}") from e
    return _model


def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes → (1, 224, 224, 3) float32 tensor
    ready for MobileNetV2 inference.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except UnidentifiedImageError:
        raise ValueError("Uploaded file is not a valid image.")

    # Convert any mode (RGBA, palette, grayscale) → RGB
    img = img.convert("RGB")

    # Resize to model input size
    img = img.resize((224, 224), Image.LANCZOS)

    # HWC → float32 array
    arr = np.array(img, dtype=np.float32)  # shape (224, 224, 3)

    # MobileNetV2 preprocessing: scale pixels to [-1, 1]
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    arr = preprocess_input(arr)

    # Add batch dimension
    return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)


def predict(image_bytes: bytes) -> Tuple[str, int, Dict[str, float]]:
    """
    Run inference on raw image bytes.

    Returns:
        skin_type   – top predicted class label (str)
        confidence  – percentage of top class (int, 0-100)
        probs       – dict mapping each class to its probability (float, 0-1)

    Raises:
        ValueError  – if the image cannot be decoded
        RuntimeError – if the model cannot be loaded
    """
    model = _load_model()

    tensor = _preprocess_image(image_bytes)

    raw_probs: np.ndarray = model.predict(tensor, verbose=0)[0]  # shape (num_classes,)

    # Build probability dict
    probs: Dict[str, float] = {
        cls: float(round(float(p), 4))
        for cls, p in zip(CLASS_NAMES, raw_probs)
    }

    top_idx: int = int(np.argmax(raw_probs))
    skin_type: str = CLASS_NAMES[top_idx]
    confidence: int = int(round(float(raw_probs[top_idx]) * 100))

    logger.info(f"Prediction: {skin_type} ({confidence}%) | probs={probs}")

    return skin_type, confidence, probs
