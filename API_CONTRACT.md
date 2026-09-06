# Formula API contract

The static frontend uses same-origin `/api` requests. Nginx chooses the backend by hostname.

## Public site: `cube.local`

`GET /api/formulas?status=published`

Response:

```json
{
  "items": [
    {
      "id": "formula-id",
      "name": "OLL T",
      "moves": "F R U R' U' F'",
      "mode": "2d",
      "stickers": ["gray", "yellow", "yellow"],
      "status": "published"
    }
  ]
}
```

## Admin site: `admin.cube.local`

The browser sends credentials through the admin session or an access token. Nginx Basic Auth is an additional perimeter layer, not the application authorization model.

- `GET /api/admin/formulas`
- `POST /api/admin/formulas`
- `PATCH /api/admin/formulas/:id` with `{ "status": "published" }` or `{ "status": "draft" }`
- `DELETE /api/admin/formulas/:id`

Create payload:

```json
{
  "name": "OLL T",
  "moves": "F R U R' U' F'",
  "mode": "3d",
  "stickers": {
    "top": ["yellow"],
    "front": ["red"],
    "right": ["blue"]
  }
}
```

The backend must validate move notation, sticker colors, mode, and ownership. Publishing should be a deliberate action; saving a draft must not make it visible on `cube.local`.

## Nginx routing shape

Use the same frontend files on both hosts if convenient, but block admin paths on the public host. The backend routing can still preserve the requested `/api` path:

```nginx
server {
    listen 443 ssl;
    server_name cube.local;
    root /var/www/rubik/rubik-frontend;
    index index.html;

    location = /admin.html { return 404; }
    location /api/ {
        proxy_pass http://127.0.0.1:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location / { try_files $uri $uri/ /index.html; }
}

server {
    listen 443 ssl;
    server_name admin.cube.local;
    root /var/www/rubik/rubik-frontend;
    index admin.html;

    auth_basic "Cube admin";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location /api/ {
        proxy_pass http://127.0.0.1:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location / { try_files $uri $uri/ /admin.html; }
}
```

If the admin API is a separate upstream, replace the admin `proxy_pass` with the HAProxy address or the backend-admin upstream. Do not expose backend-admin directly to the browser.
