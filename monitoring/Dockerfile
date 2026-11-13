FROM mirror.gcr.io/library/node:20.11.1-alpine3.19

RUN apk add --no-cache python3 py3-psutil py3-pip

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

COPY metrics_collector.py .

# CMD ["python3", "-u", "metrics_collector.py"]
