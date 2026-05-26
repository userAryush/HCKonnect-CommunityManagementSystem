# Production image for HCKonnect Django API
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Runtime libraries for Pillow / PostgreSQL client wheels
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq5 \
        libjpeg62-turbo \
        zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (layer-cached separately from app code)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Ensure entrypoint has LF line endings (safe on any build host) and is executable
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Collect static files into STATIC_ROOT so WhiteNoise can serve them.
# SECRET_KEY must be non-empty for Django to load settings; the value here is
# never used at runtime — the real secret is injected via Render environment vars.
ARG SECRET_KEY=django-insecure-build-placeholder-not-used-at-runtime
RUN SECRET_KEY=${SECRET_KEY} python manage.py collectstatic --noinput

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]