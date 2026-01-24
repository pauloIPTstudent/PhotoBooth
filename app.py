import os
import base64
import json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from functools import wraps
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui'  # ALTERE ISTO!

UPLOAD_FOLDER = 'static/uploads'
ADMIN_PASSWORD = 'senha123'  # ALTERE ISTO!

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Decorator para proteger rotas
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            return render_template('login.html', error='Senha incorreta!')
    return render_template('login.html')

@app.route('/admin')
@login_required
def admin():
    files = os.listdir(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else []
    return render_template('admin.html', files=files)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/download/<filename>')
@login_required
def download(filename):
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        # Validar que o arquivo existe e está na pasta correta
        if os.path.exists(filepath) and os.path.abspath(filepath).startswith(os.path.abspath(UPLOAD_FOLDER)):
            return send_file(filepath, as_attachment=True, download_name=filename)
        else:
            return jsonify({"status": "error", "message": "Arquivo não encontrado"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/delete/<filename>', methods=['DELETE'])
@login_required
def delete(filename):
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        # Validar que o arquivo existe e está na pasta correta (segurança)
        if os.path.exists(filepath) and os.path.abspath(filepath).startswith(os.path.abspath(UPLOAD_FOLDER)):
            os.remove(filepath)
            return jsonify({"status": "success", "message": f"{filename} eliminado com sucesso"})
        else:
            return jsonify({"status": "error", "message": "Arquivo não encontrado"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/delete-all', methods=['POST'])
@login_required
def delete_all():
    try:
        if not os.path.exists(UPLOAD_FOLDER):
            return jsonify({"status": "error", "message": "Pasta de uploads não existe"}), 404
        
        # Listar todos os arquivos
        files = os.listdir(UPLOAD_FOLDER)
        deleted_count = 0
        
        for filename in files:
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(filepath):
                try:
                    os.remove(filepath)
                    deleted_count += 1
                except Exception as e:
                    print(f"Erro ao eliminar {filename}: {e}")
        
        return jsonify({
            "status": "success", 
            "message": f"{deleted_count} arquivo(s) eliminado(s) com sucesso"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

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

@app.route('/compose', methods=['POST'])
def compose():
    """Compõe 3 fotos num layout de photobooth e envia uma imagem única"""
    try:
        data = request.json
        photos = data.get('photos', [])
        
        if len(photos) != 3:
            return jsonify({"status": "error", "message": "Exactamente 3 fotos são necessárias"}), 400
        
        # Decodificar as 3 fotos
        images = []
        for photo_data in photos:
            header, encoded = photo_data.split(",", 1)
            img_decoded = base64.b64decode(encoded)
            images.append(Image.open(BytesIO(img_decoded)).convert('RGB'))
        
        # Redimensionar para tamanho padrão (para que fiquem iguais)
        # Vamos usar altura fixa e manter aspecto
        target_height = 400
        resized_images = []
        
        for img in images:
            ratio = target_height / img.height
            new_width = int(img.width * ratio)
            resized = img.resize((new_width, target_height), Image.Resampling.LANCZOS)
            resized_images.append(resized)
        
        # Criar imagem final com as 3 fotos em coluna + emoldura
        padding = 20
        border_color = (230, 50, 100)  # Rosa/Pink
        
        # Dimensões da emoldura final
        max_width = max(img.width for img in resized_images) + (padding * 2)
        total_height = sum(img.height for img in resized_images) + (padding * 4) + 100  # +100 para texto
        
        # Criar imagem com fundo preto
        final_image = Image.new('RGB', (max_width, total_height), color=(0, 0, 0))
        draw = ImageDraw.Draw(final_image)
        
        # Desenhar emoldura rosa nos lados
        draw.rectangle([(0, 0), (max_width, total_height)], outline=border_color, width=15)
        
        # Colar as 3 fotos
        y_offset = padding
        for img in resized_images:
            x = (max_width - img.width) // 2
            final_image.paste(img, (x, y_offset))
            y_offset += img.height + padding
        
        # Adicionar texto na parte inferior
        try:
            draw.text((max_width // 2, y_offset + 20), "✨ Photo Booth ✨", 
                     fill=(230, 50, 100), anchor="mm")
        except:
            pass
        
        # Salvar a imagem composta
        filename = f"photobooth_{len(os.listdir(UPLOAD_FOLDER)) + 1}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        final_image.save(filepath, 'PNG')
        
        return jsonify({"status": "success", "filename": filename})
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)