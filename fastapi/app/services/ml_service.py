"""
ML inference service — Dermiq v2
Жаңа модель: EfficientNetB0, 8 класс
acne | combination | dry | normal | oily | pigmentation | pores | wrinkles
"""

import io
import json
import logging
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.core.config import settings

logger = logging.getLogger(__name__)

def _load_class_names() -> list[str]:
    labels_path = Path(settings.MODEL_PATH).parent / "class_names.json"
    if labels_path.exists():
        with open(labels_path, "r", encoding="utf-8") as f:
            names = json.load(f)
        logger.info(f"Кластар жүктелді: {names}")
        return names
    fallback = ["acne", "combination", "dry", "normal", "oily", "pigmentation", "pores", "wrinkles"]
    logger.warning(f"class_names.json табылмады, резервтік: {fallback}")
    return fallback

CLASS_NAMES: list[str] = _load_class_names()
_model = None


def _load_model():
    global _model
    if _model is not None:
        return _model

    logger.info(f"Модель жүктелуде: {settings.MODEL_PATH}")
    load_error = None

    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(settings.MODEL_PATH, compile=False)
        logger.info(f"Модель жүктелді. Шығыс: {_model.output_shape}")
        return _model
    except Exception as e:
        load_error = e
        logger.warning(f"tensorflow.keras сәтсіз: {e}")

    try:
        import keras
        _model = keras.models.load_model(settings.MODEL_PATH, compile=False)
        logger.info(f"Модель жүктелді (keras). Шығыс: {_model.output_shape}")
        return _model
    except Exception as e:
        raise RuntimeError(f"Модельді жүктеу мүмкін болмады. tf: {load_error}; keras: {e}") from e


def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except UnidentifiedImageError:
        raise ValueError("Жүктелген файл сурет емес.")

    img = img.convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)

    try:
        from tensorflow.keras.applications.efficientnet import preprocess_input
    except Exception:
        try:
            from keras.applications.efficientnet import preprocess_input
        except Exception:
            arr = (arr / 127.5) - 1.0
            return np.expand_dims(arr, axis=0)

    arr = preprocess_input(arr)
    return np.expand_dims(arr, axis=0)


def predict(image_bytes: bytes) -> Tuple[str, int, Dict[str, float]]:
    global CLASS_NAMES
    model = _load_model()

    n_outputs = model.output_shape[-1]
    if n_outputs != len(CLASS_NAMES):
        logger.warning(f"Модель {n_outputs} класс, CLASS_NAMES {len(CLASS_NAMES)} — автотүзету")
        CLASS_NAMES = [f"class_{i}" for i in range(n_outputs)]

    tensor = _preprocess_image(image_bytes)
    raw_probs = model.predict(tensor, verbose=0)[0]

    probs: Dict[str, float] = {
        cls: float(round(float(p), 4))
        for cls, p in zip(CLASS_NAMES, raw_probs)
    }

    top_idx = int(np.argmax(raw_probs))
    skin_type = CLASS_NAMES[top_idx]
    confidence = int(round(float(raw_probs[top_idx]) * 100))

    if confidence < 50:
        logger.warning(f"Төмен сенімділік: {skin_type} ({confidence}%)")

    logger.info(f"Болжам: {skin_type} ({confidence}%) | {probs}")
    return skin_type, confidence, probs


def get_class_names() -> list[str]:
    return CLASS_NAMES.copy()