import logging
import sys
import threading
from contextlib import asynccontextmanager
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src import corpus, pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

try:
    INDEX = corpus.load_index()
    if INDEX.empty:
        INDEX = corpus.build_index()
    logger.info("Loaded corpus index with %s scripts", len(INDEX))
except Exception as exc:
    logger.error("Failed to load corpus index: %s", exc)
    INDEX = None


class TagRequest(BaseModel):
    imdb_id: str = ""
    text: str = ""
    title: str = ""
    use_transformers: bool = False
    include_dialogue: bool = False
    use_llm: bool = False


from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

DIST_DIR = PROJECT_ROOT / "frontend" / "dist"


def _warm_up():
    """Preload optional heavyweight models so the first request isn't slow."""
    try:
        from src import classify, ner

        classify.load_classifier()
        ner.load_spacy("en_core_web_lg")
    except Exception as exc:  # pragma: no cover
        logger.warning("Model warm-up failed (non-fatal): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=_warm_up, daemon=True).start()
    yield


app = FastAPI(title="ScriptTagger API", version="1.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


@app.get("/")
def root():
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "app": "ScriptTagger",
        "endpoints": ["/health", "/scripts", "/tag", "/tag/upload", "/metadata/{id}", "/scripts/{id}"],
    }


@app.get("/api/info")
def info():
    return {
        "app": "ScriptTagger",
        "endpoints": ["/health", "/scripts", "/tag", "/tag/upload", "/metadata/{id}", "/scripts/{id}"],
    }


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "scripts_indexed": int(len(INDEX)) if INDEX is not None else 0}


@app.get("/scripts")
@app.get("/api/scripts")
def scripts(query: str = "", limit: int = 0, offset: int = 0):
    if INDEX is None:
        raise HTTPException(503, "corpus index unavailable")
    df = INDEX
    if query:
        mask = df["title"].fillna("").str.contains(query, case=False, regex=False)
        df = df[mask]
    if limit > 0:
        df = df.iloc[offset : offset + limit]
    elif offset > 0:
        df = df.iloc[offset:]
    rows = []
    for _, r in df.iterrows():
        g_val = r.get("genres")
        genres_list = [g.strip() for g in str(g_val).split(",") if g.strip()] if pd.notna(g_val) and g_val else []
        rows.append(
            {
                "imdb_id": str(r["imdbid"]),
                "title": str(r.get("title")) if pd.notna(r.get("title")) else "",
                "year": int(r.get("year")) if pd.notna(r.get("year")) else None,
                "genres": genres_list[:5],
                "num_scenes": None,
            }
        )
    return {"total": len(df), "results": rows}


@app.get("/scripts/{imdb_id}")
@app.get("/api/scripts/{imdb_id}")
def raw_script(imdb_id: str):
    try:
        text = corpus.read_script(imdb_id)
    except KeyError:
        raise HTTPException(404, "script not found")
    return {"imdb_id": imdb_id, "title": corpus.metadata_for(imdb_id).get("title", ""), "text": text}


@app.post("/tag")
@app.post("/api/tag")
def tag(req: TagRequest):
    if req.imdb_id:
        cached = pipeline.load_cached_metadata(req.imdb_id)
        if cached is not None and not req.use_transformers:
            has_dialogue = any(bool(s.get("dialogue")) for s in cached.get("segments", []))
            has_summary = bool(cached.get("summary"))
            needs_dialogue = req.include_dialogue and not has_dialogue
            needs_summary = req.use_llm and not has_summary
            if not needs_dialogue and not needs_summary:
                return cached
        try:
            text = corpus.read_script(req.imdb_id)
        except KeyError:
            raise HTTPException(404, "script not found")
        meta = pipeline.tag_script(
            text,
            imdb_id=req.imdb_id,
            title=corpus.metadata_for(req.imdb_id).get("title", ""),
            use_transformers=req.use_transformers,
            include_dialogue=req.include_dialogue,
            use_llm=req.use_llm,
        )
        pipeline.save_metadata(req.imdb_id, meta)
        return meta
    if req.text:
        return pipeline.tag_script(
            req.text,
            imdb_id=req.imdb_id,
            title=req.title,
            use_transformers=req.use_transformers,
            include_dialogue=req.include_dialogue,
            use_llm=req.use_llm,
        )
    raise HTTPException(400, "provide either imdb_id or text")


@app.post("/tag/upload")
@app.post("/api/tag/upload")
async def tag_upload(
    file: UploadFile = File(...),
    use_transformers: bool = False,
    include_dialogue: bool = False,
    use_llm: bool = False,
):
    raw = (await file.read()).decode("utf-8", errors="replace")
    return pipeline.tag_script(
        raw,
        title=file.filename or "",
        use_transformers=use_transformers,
        include_dialogue=include_dialogue,
        use_llm=use_llm,
    )


@app.get("/metadata/{imdb_id}")
@app.get("/api/metadata/{imdb_id}")
def metadata(imdb_id: str):
    cached = pipeline.load_cached_metadata(imdb_id)
    if cached:
        return cached
    try:
        text = corpus.read_script(imdb_id)
    except KeyError:
        raise HTTPException(404, "script not found")
    meta = pipeline.tag_script(
        text,
        imdb_id=imdb_id,
        title=corpus.metadata_for(imdb_id).get("title", ""),
        use_transformers=False,
    )
    pipeline.save_metadata(imdb_id, meta)
    return meta


if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")