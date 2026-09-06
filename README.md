# cube.study timer

Frontend tĩnh để tính giờ Rubik, phục vụ bởi Nginx.

## Kiến trúc

```text
Browser -> Nginx
             |-- file tĩnh: index.html, script.js, styles-simple.css
             `-- /api/* -> HAProxy/backend
```

Backend mẫu nằm trong `backend/` và chạy bằng Docker Compose:

```bash
docker compose up --build -d
curl http://127.0.0.1:8888/api/health
```

Khi Nginx chạy, frontend gọi các endpoint same-origin:

- `GET /api/health` khi mở trang.
- `GET /api/solves?limit=8` để lấy lịch sử.
- `POST /api/solves` sau mỗi solve.
- `GET /api/stats` có sẵn cho bước mở rộng tiếp theo.

Ví dụ POST:

```bash
curl -X POST http://127.0.0.1:8888/api/solves \
  -H 'Content-Type: application/json' \
  -d '{"time_ms":12345,"scramble":"R U2 F2"}'
```

Nginx trong `nginx-cube-domains.conf` proxy `/api/` tới port `8888`. Trong mô hình có HAProxy, thay upstream trong `proxy_pass` bằng địa chỉ HAProxy.
