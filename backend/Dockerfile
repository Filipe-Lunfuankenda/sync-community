# Estágio de Build para dependências nativas
FROM python:3.11-alpine as builder

WORKDIR /app
RUN apk add --no-cache gcc musl-dev postgresql-dev libffi-dev

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
RUN pip install --no-cache-dir --prefix=/install psycopg2-binary

# Estágio final ultraleve
FROM python:3.11-alpine

WORKDIR /app
RUN apk add --no-cache libpq

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
