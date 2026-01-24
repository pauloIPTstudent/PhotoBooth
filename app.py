import os
import base64
import json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from functools import wraps
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from dotenv import load_dotenv
import time
# Carrega as variáveis do ficheiro .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'sua_chave_secreta_aqui')

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'static/uploads')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'senha123')

# Variáveis globais do evento
PHOTOBOOTH_TITLE = os.getenv('PHOTOBOOTH_TITLE', 'Meu Evento')
PHOTOBOOTH_DATE = os.getenv('PHOTOBOOTH_DATE', '00 00 2026')
PHOTOBOOTH_COLOR_HEX = os.getenv('PHOTOBOOTH_COLOR_HEX', '#e91e63')
PHOTOBOOTH_CANVAS_WIDTH = int(os.getenv('PHOTOBOOTH_CANVAS_WIDTH', '600'))
PHOTOBOOTH_TEXT_COLOR = os.getenv('PHOTOBOOTH_TEXT_COLOR', '#3c3c3c')
PHOTOBOOTH_BACKGROUND_COLOR = os.getenv('PHOTOBOOTH_BACKGROUND_COLOR', '#ffffff')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ===== CONTEXT PROCESSOR - Passa variáveis a todos os templates =====
@app.context_processor
def inject_config():
    return {
        'photobooth_title': PHOTOBOOTH_TITLE,
        'photobooth_date': PHOTOBOOTH_DATE,
        'photobooth_color': PHOTOBOOTH_COLOR_HEX
    }

@app.route('/css/colors.css')
def colors_css():
    """Retorna CSS dinâmico com as cores personalizadas do .env"""
    color_pink = os.getenv('PHOTOBOOTH_COLOR_HEX', '#e91e63')
    color_dark = os.getenv('PHOTOBOOTH_BG_DARK', '#0a0a0a')
    color_white = os.getenv('PHOTOBOOTH_COLOR_WHITE', '#ffffff')
    color_gray_light = os.getenv('PHOTOBOOTH_COLOR_GRAY_LIGHT', '#aaa')
    color_gray_dark = os.getenv('PHOTOBOOTH_COLOR_GRAY_DARK', '#333')
    color_btn_green = os.getenv('PHOTOBOOTH_BTN_GREEN', '#4cd964')
    color_btn_green_dark = os.getenv('PHOTOBOOTH_BTN_GREEN', '#4cd964')
    # Converter HEX para RGB para o gradiente
    from colorsys import rgb_to_hls, hls_to_rgb
    
    css = f"""
    :root {{
        --pink: {color_pink};
        --dark: {color_dark};
        --white: {color_white};
        --gray-light: {color_gray_light};
        --gray-dark: {color_gray_dark};
        --btn-green: {color_btn_green};
        --btn-green-dark: #45a049;
        --bg-camera: #000;
        --options-bg: rgba(255, 255, 255, 0.1);
        --options-border: #444;
    }}
    """
    return css, 200, {'Content-Type': 'text/css'}


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
    """Compõe 1 ou 3 fotos num layout de photobooth vertical com rodapé personalizado"""
    try:
        data = request.json
        photos = data.get('photos', [])
        
        # Aceita 1 ou 3 fotos
        if len(photos) not in [1, 3]:
            return jsonify({"status": "error", "message": "Apenas 1 ou 3 fotos são aceites"}), 400

        # 1. Obter configurações do ficheiro .env (já carregadas globalmente)
        canvas_width = PHOTOBOOTH_CANVAS_WIDTH
        event_title = PHOTOBOOTH_TITLE
        event_date = PHOTOBOOTH_DATE
        
        # 2. Converter cores HEX para RGB
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        text_color = hex_to_rgb(PHOTOBOOTH_TEXT_COLOR)
        bg_color = hex_to_rgb(PHOTOBOOTH_BACKGROUND_COLOR)

        # 3. Configurações de Design (Estilo Tira de Photobooth)
        padding = 40             # Espaço entre fotos e bordas
        bottom_area_height = 280 # Espaço reservado para o texto em baixo

        # 4. Processar e Redimensionar Fotos
        images = []
        photo_width = canvas_width - (padding * 2)
        
        for photo_data in photos:
            # Remover cabeçalho base64 se existir
            if "," in photo_data:
                photo_data = photo_data.split(",", 1)[1]
            
            img_bytes = base64.b64decode(photo_data)
            img = Image.open(BytesIO(img_bytes)).convert('RGB')
            
            # Redimensionar mantendo proporção baseada na largura fixa
            aspect_ratio = img.height / img.width
            new_height = int(photo_width * aspect_ratio)
            resized = img.resize((photo_width, new_height), Image.Resampling.LANCZOS)
            images.append(resized)

        # 5. Calcular Altura Total da Tira
        total_photos_height = sum(img.height for img in images)
        # Altura = (Soma das fotos) + (Paddings entre fotos e topo) + (Área do Rodapé)
        total_canvas_height = total_photos_height + (padding * 4) + bottom_area_height

        # 6. Criar a Canvas (Fundo)
        final_image = Image.new('RGB', (canvas_width, total_canvas_height), color=bg_color)
        draw = ImageDraw.Draw(final_image)

        # 7. Colar as Fotos na Vertical
        current_y = padding
        for img in images:
            final_image.paste(img, (padding, current_y))
            current_y += img.height + padding

        # 8. Adicionar o Texto Personalizado (Rodapé)
        footer_text = f"{event_title}\n{event_date}"
        
        try:
            # Tenta carregar uma fonte específica. Se não encontrar, usa a padrão.
            # Dica: Coloca um ficheiro 'font.ttf' na pasta do projeto para estilo cursivo.
            font_path = "font.ttf" 
            if os.path.exists(font_path):
                font_main = ImageFont.truetype(font_path, 45)
            else:
                font_main = ImageFont.load_default()
            
            # Escrever o texto centrado na área restante
            text_y_position = current_y + (bottom_area_height // 2) - 20
            draw.multiline_text(
                (canvas_width // 2, text_y_position),
                footer_text,
                fill=text_color,
                font=font_main,
                anchor="mm",
                align="center",
                spacing=15
            )
        except Exception as e:
            print(f"Erro ao renderizar texto: {e}")

        # 9. Guardar o Resultado
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
            
        filename = f"pb_{int(time.time())}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        final_image.save(filepath, 'PNG')

        return jsonify({
            "status": "success", 
            "filename": filename,
            "url": f"{UPLOAD_FOLDER}/{filename}"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)