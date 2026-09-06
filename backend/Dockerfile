FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DATABASE_PATH=/data/rubik.db

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 8888

CMD ["gunicorn", "--bind", "0.0.0.0:8888", "--workers", "2", "app:app"]
