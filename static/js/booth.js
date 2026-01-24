const Booth = {
    video: null,
    canvas: null,
    countdownEl: null,
    photosTaken: [],      // Array para guardar a sequência de fotos
    currentFilter: 'none',
    totalPhotos: 1,

    init() {
        this.video = document.getElementById('video');
        this.canvas = document.createElement('canvas');
        this.countdownEl = document.getElementById('countdown');
    },

    // Configura filtro e quantidade vindo da tela de opções
    config(filter, qty) {
        this.currentFilter = filter;
        this.totalPhotos = parseInt(qty);
        this.photosTaken = []; // Limpa fotos anteriores
        
        // Aplica o filtro visualmente no vídeo para o usuário ver
        if (this.video) {
            this.video.style.filter = this.currentFilter;
        }
    },

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: 1920, height: 1080 } 
            });
            this.video.srcObject = stream;
        } catch (err) { 
            alert("Câmera travada ou permissão negada: " + err); 
        }
    },

    // Inicia o processo de captura (pode ser uma ou várias fotos)
    async startCountdown() {
        const btn = document.getElementById('btn-shoot');
        if (btn) btn.style.display = 'none';
        
        this.photosTaken = []; // Reinicia o array de fotos
        await this.loopCapture();
    },

    // Lógica recursiva para tirar fotos em sequência
    async loopCapture() {
        let count = 3;
        this.countdownEl.style.display = 'block';
        this.countdownEl.innerText = count;
        
        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownEl.innerText = count;
            } else if (count === 0) {
                this.countdownEl.innerText = "📸"; // Feedback visual do clique
            } else {
                clearInterval(timer);
                this.countdownEl.style.display = 'none';
                this.capture();
                
                // Verifica se precisa de mais fotos
                if (this.photosTaken.length < this.totalPhotos) {
                    // Espera 1.5s para a pessoa mudar de pose e reinicia o countdown
                    setTimeout(() => this.loopCapture(), 1500);
                } else {
                    // Se terminou todas, vai para o preview
                    this.showFinalPreview();
                }
            }
        }, 1000);
    },

    capture() {
        const ctx = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Aplica o filtro no Canvas antes de "pintar" a foto
        ctx.filter = this.currentFilter;

        // Mirror flip (Efeito espelho)
        ctx.translate(this.canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.video, 0, 0);

        // Adiciona a foto ao array de sequência
        const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
        this.photosTaken.push(imageData);
    },

    showFinalPreview() {
        console.log("Iniciando Preview. Fotos tiradas:", this.photosTaken.length);
        
        const container = document.getElementById('photos-scroll-container');
        if (!container) {
            console.error("Erro: Container 'photos-scroll-container' não encontrado!");
            return;
        }

        container.innerHTML = ""; // Limpa fotos antigas

        // Todas as fotos passam pela composição (1 ou 3)
        this.sendComposed();
    },

    retake() {
        this.photosTaken = [];
        const btn = document.getElementById('btn-shoot');
        if (btn) btn.style.display = 'block';
        showScreen('screen-camera');
        // Assegura que a câmara está ainda ativa
        if (this.video && !this.video.srcObject) {
            this.startCamera();
        }
    },

    async send() {
        if (this.photosTaken.length === 0) return;

        const sendBtn = event.currentTarget;
        const originalText = sendBtn.innerText;
        sendBtn.innerText = "ENVIANDO...";
        sendBtn.disabled = true;

        try {
            // Todas as fotos já foram compostas e salvas no servidor
            // Apenas mostra a mensagem de sucesso
            console.log("Tira já foi composta e salva no servidor");
            
            // Chama a função global de sucesso (definida no _success.html)
            if (typeof startSuccessFlow === "function") {
                startSuccessFlow();
            } else {
                showScreen('screen-success');
                setTimeout(() => window.location.reload(), 5000);
            }
            
        } catch (err) {
            alert("Erro ao processar sequência de fotos.");
            sendBtn.disabled = false;
            sendBtn.innerText = originalText;
        }
    },

    async sendComposed() {
        // Aceita 1 ou 3 fotos para composição
        if (this.photosTaken.length !== 1 && this.photosTaken.length !== 3) {
            alert("Apenas 1 ou 3 fotos podem ser compostas");
            return;
        }

        const container = document.getElementById('photos-scroll-container');
        if (!container) return;

        container.innerHTML = '<p style="color: white; font-size: 18px; margin-top: 50px;">Processando sua tira...</p>';
        showScreen('screen-preview');

        try {
            // Envia as fotos para serem compostas num layout de photobooth
            const response = await fetch('/compose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    photos: this.photosTaken
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Mostra a imagem composta no preview
                container.innerHTML = "";
                const img = document.createElement('img');
                img.src = `/${result.url || result.filename}`;
                img.style.width = "85vw";
                img.style.borderRadius = "12px";
                img.style.border = "3px solid white";
                img.style.boxShadow = "0 10px 20px rgba(0,0,0,0.5)";
                
                container.appendChild(img);
                showScreen('screen-preview');
                document.getElementById('screen-preview').scrollTo(0, 0);
            } else {
                throw new Error(result.message || "Erro ao compor fotos");
            }
            
        } catch (err) {
            console.error("Erro:", err);
            alert("Erro ao processar composição: " + err.message);
            container.innerHTML = "";
        }
    }
};