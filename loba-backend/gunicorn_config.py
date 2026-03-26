# Gunicorn configuration for Render free tier
# Render free: 512MB RAM, shared CPU

import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 1024

# Worker processes (optimized for small instance)
# Render free tier: use 2-3 workers
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 100
timeout = 30
keepalive = 2

# Logging
accesslog = "-"  # stdout
errorlog = "-"   # stdout
loglevel = "info"

# Process model
daemon = False
pidfile = None
umask = 0

# Server mechanics
preload_app = False
reload = False

def on_starting(server):
    print("✅ Gunicorn starting...")

def when_ready(server):
    print("✅ Gunicorn ready - application ready to accept requests")

def on_exit(server):
    print("Gunicorn shutting down...")

