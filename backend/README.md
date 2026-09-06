# Rubik backend

Flask API dùng để lưu thời gian solve. Nginx reverse proxy `/api/` tới port `8888`.

## Chạy bằng Docker

```bash
docker compose up --build -d
curl http://127.0.0.1:8888/api/health
```

## API

- `GET /api/health`
- `GET /api/solves?limit=20`
- `POST /api/solves` với `{ "time_ms": 12345, "scramble": "R U2 F'" }`
- `GET /api/stats`

SQLite được lưu trong volume `rubik-data` tại `/data/rubik.db`.
