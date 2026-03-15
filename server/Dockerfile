FROM node:slim AS frontend-build

WORKDIR /frontend

COPY image-client/package*.json ./
RUN npm install --legacy-peer-dep

COPY image-client .
RUN npm run build

FROM python:3.12-slim

WORKDIR /backend

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN python -m spacy download en_core_web_lg

COPY ./PrivacyProxy.py ./main.py ./dto.py ./

COPY --from=frontend-build /frontend/dist ./dist

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
