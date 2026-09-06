import os
import sqlite3
from datetime import datetime, timezone

from flask import Flask, jsonify, request

app = Flask(__name__)
DATABASE_PATH = os.getenv("DATABASE_PATH", "/data/rubik.db")


def get_connection():
    database_directory = os.path.dirname(DATABASE_PATH) or "."
    os.makedirs(database_directory, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS solves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                time_ms INTEGER NOT NULL CHECK (time_ms > 0),
                scramble TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "rubik-backend"})


@app.get("/api/solves")
def list_solves():
    limit = min(request.args.get("limit", default=20, type=int), 100)
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT id, time_ms, scramble, created_at FROM solves ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return jsonify({"items": [dict(row) for row in rows]})


@app.post("/api/solves")
def create_solve():
    payload = request.get_json(silent=True) or {}
    time_ms = payload.get("time_ms")
    scramble = str(payload.get("scramble", "")).strip()

    if not isinstance(time_ms, int) or time_ms <= 0 or time_ms > 24 * 60 * 60 * 1000:
        return jsonify({"error": "time_ms must be a positive integer"}), 400
    if len(scramble) > 500:
        return jsonify({"error": "scramble is too long"}), 400

    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO solves (time_ms, scramble, created_at) VALUES (?, ?, ?)",
            (time_ms, scramble, created_at),
        )
        solve_id = cursor.lastrowid
    return jsonify({"id": solve_id, "time_ms": time_ms, "scramble": scramble, "created_at": created_at}), 201


@app.get("/api/stats")
def stats():
    with get_connection() as connection:
        row = connection.execute(
            "SELECT COUNT(*) AS total, MIN(time_ms) AS best FROM solves"
        ).fetchone()
    return jsonify({"total_solves": row["total"], "best_time_ms": row["best"]})


initialize_database()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8888")))
