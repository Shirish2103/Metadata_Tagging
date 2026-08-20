"""Sentiment & emotion analysis: VADER baseline + optional transformer models."""

import logging
import os
import warnings
from functools import lru_cache

os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore")

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _vader():
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

    return SentimentIntensityAnalyzer()


def vader_sentiment(text: str) -> dict:
    if not text or not isinstance(text, str):
        return {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0, "label": "neutral"}
    scores = _vader().polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return {
        "compound": round(compound, 4),
        "pos": round(scores["pos"], 4),
        "neg": round(scores["neg"], 4),
        "neu": round(scores["neu"], 4),
        "label": label,
    }


@lru_cache(maxsize=1)
def _emotion_pipeline():
    try:
        from transformers import logging as tf_logging, pipeline
        tf_logging.set_verbosity_error()

        return pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
            device=-1,
        )
    except Exception as exc:
        logger.info("Transformer emotion model unavailable: %s", exc)
        return None


@lru_cache(maxsize=1)
def _sentiment_pipeline():
    try:
        from transformers import logging as tf_logging, pipeline
        tf_logging.set_verbosity_error()

        return pipeline(
            "text-classification",
            model="cardiffnlp/twitter-roberta-base-sentiment",
            top_k=None,
            device=-1,
        )
    except Exception as exc:
        logger.info("Transformer sentiment model unavailable: %s", exc)
        return None


def _normalize_label(label: str) -> str:
    return {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}.get(
        label, label.lower()
    )


def transformer_emotion(texts: list[str], batch_size: int = 16) -> list[dict | None]:
    pipe = _emotion_pipeline()
    if pipe is None:
        return [None] * len(texts)
    out = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        try:
            res = pipe(batch)
            for r in res:
                r = sorted(r, key=lambda x: -x["score"])
                out.append(
                    {
                        "label": r[0]["label"],
                        "scores": {x["label"]: round(x["score"], 4) for x in r},
                    }
                )
        except Exception as exc:
            logger.warning("emotion batch failed: %s", exc)
            out.extend([None] * len(batch))
    return out


def transformer_sentiment(texts: list[str], batch_size: int = 16) -> list[dict | None]:
    pipe = _sentiment_pipeline()
    if pipe is None:
        return [None] * len(texts)
    out = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        try:
            res = pipe(batch)
            for r in res:
                r = sorted(r, key=lambda x: -x["score"])
                out.append(
                    {
                        "label": _normalize_label(r[0]["label"]),
                        "scores": {
                            _normalize_label(x["label"]): round(x["score"], 4) for x in r
                        },
                    }
                )
        except Exception as exc:
            logger.warning("sentiment batch failed: %s", exc)
            out.extend([None] * len(batch))
    return out


def aggregate_sentiment(items: list[dict]) -> dict:
    valid = [i for i in items if i and isinstance(i, dict) and "compound" in i]
    if not valid:
        return {"compound": 0.0, "label": "neutral", "n": 0}
    compound = sum(i["compound"] for i in valid) / len(valid)
    label = "positive" if compound >= 0.05 else "negative" if compound <= -0.05 else "neutral"
    return {
        "compound": round(compound, 4),
        "label": label,
        "n": len(valid),
        "positive": sum(1 for i in valid if i.get("label") == "positive"),
        "negative": sum(1 for i in valid if i.get("label") == "negative"),
        "neutral": sum(1 for i in valid if i.get("label") == "neutral"),
    }


def aggregate_emotion(items: list[dict | None]) -> dict:
    present = [i for i in items if i and isinstance(i, dict) and "label" in i]
    if not present:
        return {"label": "neutral", "distribution": {}, "n": 0}
    counts: dict[str, int] = {}
    for i in present:
        counts[i["label"]] = counts.get(i["label"], 0) + 1
    label = max(counts, key=counts.get)
    return {
        "label": label,
        "distribution": counts,
        "n": len(present),
    }