import os
import base64
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    try:
        data = request.json['image']
        header, encoded = data.split(",", 1)
        data_decoded = base64.b64decode(encoded)
        
        filename = f"foto_{len(os.listdir(UPLOAD_FOLDER)) + 1}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, "wb") as f:
            f.write(data_decoded)
        
        return jsonify({"status": "success", "filename": filename})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)