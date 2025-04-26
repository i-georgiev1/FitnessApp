import multiprocessing

# Server configuration
host = '0.0.0.0'
port = 8000
workers = multiprocessing.cpu_count() * 2 + 1

# Logging configuration
log_level = 'info'
access_log = True

# SSL configuration (disabled by default)
ssl_keyfile = None
ssl_certfile = None

# Worker class configuration
loop = 'auto'  # Options: 'auto', 'asyncio', 'uvloop'
http = 'auto'  # Options: 'auto', 'h11', 'httptools'
ws = 'auto'    # Options: 'auto', 'none', 'websockets', 'wsproto'

# Resource limits
limit_concurrency = 1000
backlog = 2048
timeout_keep_alive = 5 