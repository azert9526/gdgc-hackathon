FROM python:3.12-slim

WORKDIR /app

COPY platform_backend.py /app/platform_backend.py

RUN pip install --no-cache-dir fastapi uvicorn requests pydantic supabase

ENV PORT=8080
ENV PYTHONUNBUFFERED=1
EXPOSE 8080

CMD ["uvicorn", "platform_backend:app", "--host", "0.0.0.0", "--port", "8080"]
