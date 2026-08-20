#!/usr/bin/env bash
# Start the ScriptTagger Streamlit dashboard.
set -e
cd "$(dirname "$0")"
exec env PYTHONPATH="$PWD" ./.venv/bin/python -m streamlit run ui/app.py "$@"
