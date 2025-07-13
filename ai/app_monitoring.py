import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask
# from prometheus_flask_exporter import PrometheusMetrics  # Optional - install when needed


def setup_app():
    app = Flask(__name__)

    # 📄 Structured logging setup
    os.makedirs("logs", exist_ok=True)
    handler = RotatingFileHandler(
        "logs/app.log", maxBytes=10 * 1024 * 1024, backupCount=5
    )
    formatter = logging.Formatter(
        '{"time":"%(asctime)s","level":"%(levelname)s","module":"%(module)s","message":"%(message)s"}'
    )
    handler.setFormatter(formatter)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info("Logging setup complete")

    # 📊 Prometheus monitoring (optional - uncomment when prometheus_flask_exporter is installed)
    # metrics = PrometheusMetrics(app)
    # metrics.info("app_info", "Application info", version="1.0.0")

    return app
