import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import init_db
from routes.api import api_bp

# IMPORTANT: Get the root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')

print(f"📂 Root directory: {ROOT_DIR}")
print(f"📂 Frontend directory: {FRONTEND_DIR}")
print(f"📂 index.html exists: {os.path.exists(os.path.join(FRONTEND_DIR, 'index.html'))}")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Initialize database
print("🚀 Initializing database...")
count = init_db()
print(f"📊 Total schemes in database: {count}")

# Register API Blueprint
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/')
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(FRONTEND_DIR, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True)