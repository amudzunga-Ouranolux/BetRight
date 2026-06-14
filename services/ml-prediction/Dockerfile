FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

COPY pyproject.toml ./
RUN pip install --no-cache-dir \
    "fastapi>=0.115" "uvicorn[standard]>=0.30" "pydantic>=2.7" \
    "sqlalchemy>=2.0" "psycopg[binary]>=3.2" "alembic>=1.13" "apscheduler>=3.10" \
    "httpx>=0.27" "python-dotenv>=1.0"

COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app

EXPOSE 8001
# Apply migrations, then serve. (depends_on: postgres healthy in compose.)
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8001"]
