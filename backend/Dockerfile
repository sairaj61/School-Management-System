FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (optional, good for psycopg2 or debugging)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source code
COPY . .

# Copy start script and make it executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

# Run the startup script
CMD ["/start.sh"]
