# ScriptTagger — AI-Powered Metadata Tagging from Movie Transcripts

Generative-AI / NLP pipeline that ingests a movie screenplay (a transcript of media content) and produces rich, structured metadata for indexing, archiving, recommendations and compliance:

- **Scene / time segmentation** — every scene becomes a timestamped segment
- **Speaker identification** — who said what, with gender enrichment
- **Topics & keywords** — RAKE + TF-IDF + KeyBERT keyphrases per scene and overall
- **Named entities** — people, organizations, locations, products (spaCy)
- **Sentiment & emotion** — VADER baseline + optional transformer emotion model (RoBERTa)
- **Content classification** — multi-label genre classifier trained on screenplay text
- **Ultra-Fast Storage** — `.json.gz` Gzip compression (~900MB reduced to ~100MB)
- **React 19 Web Dashboard** — Glassmorphism dark-mode React + Tailwind + Recharts frontend

---

## Architecture

```
screenplay (.txt)
      │
      ▼
 src/parser.py         structural parse (scenes, speakers, dialogue, action)
 src/segmentation.py   scene → pseudo-timestamps (mm:ss per segment)
 src/speakers.py       canonical speakers + gender enrichment
 src/topics.py         RAKE / TF-IDF / KeyBERT keyphrases
 src/ner.py            spaCy NER, per-scene + global, speaker linking
 src/sentiment.py      VADER + (optional) transformer emotion/sentiment
 src/classify.py       multi-label genre classifier (sklearn)
 src/pipeline.py       orchestrates the modules → compressed metadata (.json.gz)
 api/main.py           FastAPI service & Static Frontend host (http://localhost:8000)
 frontend/             React 19 + Vite + Tailwind + Recharts Web Dashboard
 ui/app.py             Streamlit dashboard (http://localhost:8501)
 evaluate/evaluate.py  offline evaluation vs rule_based/BERT annotations
 scripts/tag_corpus.py multi-threaded parallel batch processor
```

Metadata output (Compressed `.json.gz` or JSON API response) per script:

```json
{
  "title": "Ex Machina",
  "genres": [{"genre": "Drama", "score": 0.38}, ...],
  "known_genres": ["Drama", "Mystery", "Sci-Fi", "Thriller"],
  "overall": {
    "topics": [{"keyword": "...", "score": 0.12}, ...],
    "entities": [{"label": "PERSON", "text": "CALEB", "count": 326, "is_speaker": true}, ...],
    "sentiment": {"compound": 0.03, "label": "neutral"},
    "emotion": {"label": "neutral", "distribution": {...}},
    "num_scenes": 142, "num_dialogue_lines": 2227, "num_words": 11359
  },
  "segments": [
    {"segment_id": 1, "start": "00:00", "end": "00:06",
     "heading": "INT. OFFICE - DAY", "location": "OFFICE", "time_of_day": "DAY",
     "speakers": [...], "topics": [...], "entities": [...],
     "sentiment": {...}, "emotion": {...}, "dialogue": [...]}
  ],
  "speakers": [{"name": "NATHAN", "lines": 920, "words": 4760, "gender": null}, ...]
}
```

---

## Setup & Usage (Docker - Recommended)

This project is fully Dockerized. You do not need to install Python, PyTorch, or set up any virtual environments locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iamshaury/MetaData-Tagging.git
   cd MetaData-Tagging
   ```

2. **Build and start the application:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **React / FastAPI Web Application:** [http://localhost:8000](http://localhost:8000)
   - **Streamlit Dashboard:** [http://localhost:8501](http://localhost:8501)

---

## Local Setup (Virtual Environment)

### Step 1: Create a Virtual Environment

**On Windows:**
```powershell
python -m venv .venv
```

**On Linux / macOS:**
```bash
python3 -m venv .venv
```

### Step 2: Activate Virtual Environment

**On Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**On Windows (CMD):**
```cmd
.\.venv\Scripts\activate.bat
```

**On Linux / macOS:**
```bash
source .venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Step 4: Run Initial Setup & Model Training

Run `setup.py` to download required spaCy models (`en_core_web_lg`), NLTK stopwords, build the corpus index, and train the multi-label genre classifier:

```bash
python setup.py
```

> ⚡ **Note**: No GPU required. All models are optimized to run on CPU.

---

## How to Run the Applications

Make sure your virtual environment is activated before running these commands.

### 1. Run React Frontend + FastAPI Backend (Main Web App)

```bash
python -m uvicorn api.main:app --port 8000
```
- Open **[http://localhost:8000](http://localhost:8000)** in your browser for the React Glassmorphism Web App.
- Interactive API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Endpoints: `POST /tag` (Tag script/text), `GET /scripts` (List corpus scripts), `GET /metadata/{imdb_id}` (Fetch metadata).

To run React Frontend in standalone Vite development mode:
```bash
cd frontend
npm install
npm run dev
```
- Opens at [http://localhost:5173](http://localhost:5173) with automatic proxying to FastAPI port 8000.

### 2. Run Streamlit UI Dashboard

```bash
streamlit run ui/app.py
```
- Opens automatically at [http://localhost:8501](http://localhost:8501)

### 3. Run Multi-Threaded Parallel Batch Processor

To generate `.json.gz` compressed metadata for all 2,800+ scripts using multi-threading:

```bash
python scripts/tag_corpus.py --workers 8
```

### 4. Run Model Evaluation Benchmark

To evaluate parser and tagging accuracy against annotated ground truth:

```bash
python evaluate/evaluate.py --sample 30
```

---

## Dataset

Kaggle — [Movie Scripts Corpus](https://www.kaggle.com/datasets/gufukuro/movie-scripts-corpus)
(`archive (3)` extracted to the path configured in `src/config.py`):
- `screenplay_data/raw_texts` — 2,857 screenplay transcripts
- `screenplay_data/rule_based_annotations` — ScreenPy scene/speaker ground truth (2,607)
- `screenplay_data/BERT_annotations`, `manual_annotations` — line-type labels
- `movie_characters/` — per-character dialogue + gender pickle
- `movie_metadata/movie_meta_data.csv` — genres, plot, keywords, cast, awards

---

## Notes & Tradeoffs

- **Gzip Compression**: Outputs are stored as `.json.gz` files in `outputs/` directory. This reduces storage footprint from ~900MB to ~100MB while preserving full scene dialogue arrays.
- **Parallel Workers**: Batch generation uses `ThreadPoolExecutor` (default 8 workers) to process 2,800+ movies in ~15-20 minutes.
- **Transformer Emotion Model**: Transformer emotion models run on CPU and are optional; toggle them in the UI or pass `use_transformers=true` to the API.
- **Genre Classifier**: Trained on screenplay text + IMDb plot summaries; `known_genres` shows ground truth for corpus titles.