FROM node:20 AS frontend-build

WORKDIR /frontend

COPY image-client/image-client/package*.json ./
RUN npm install

COPY image-client/image-client .
RUN npm run build

FROM python:3.12-slim

WORKDIR /backend
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server ./server

COPY --from=frontend-build /frontend/dist ./frontend

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8080"]