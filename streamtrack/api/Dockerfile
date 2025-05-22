ARG PYTHON_VERSION=3.11-slim

# Etap budowania
FROM python:${PYTHON_VERSION} AS builder
WORKDIR /install
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Etap produkcyjny
FROM python:${PYTHON_VERSION} AS runner
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]