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
        
        // Se foram tiradas exatamente 3 fotos, mostrar a emoldura
        if (this.photosTaken.length === 3) {
            if (typeof showFramePreview === "function") {
                showFramePreview();
            } else {
                console.error("Função showFramePreview não encontrada!");
            }
        } else {
            // Caso contrário, mostrar preview normal
            const container = document.getElementById('photos-scroll-container');
            if (!container) {
                console.error("Erro: Container 'photos-scroll-container' não encontrado!");
                return;
            }

            container.innerHTML = ""; // Limpa fotos antigas

            this.photosTaken.forEach((photoData, index) => {
                const img = document.createElement('img');
                img.src = photoData;
                img.style.width = "85vw";
                img.style.borderRadius = "12px";
                img.style.border = "3px solid white";
                img.style.boxShadow = "0 10px 20px rgba(0,0,0,0.5)";
                
                container.appendChild(img);
            });

            // Muda a tela
            showScreen('screen-preview');
            
            // Força o scroll para o topo
            document.getElementById('screen-preview').scrollTo(0, 0);
        }
    },

    retake() {
        this.photosTaken = [];
        const btn = document.getElementById('btn-shoot');
        if (btn) btn.style.display = 'block';
        showScreen('screen-camera');
    },

    async send() {
        if (this.photosTaken.length === 0) return;

        const sendBtn = event.currentTarget;
        const originalText = sendBtn.innerText;
        sendBtn.innerText = "ENVIANDO...";
        sendBtn.disabled = true;

        try {
            // Envia cada foto da sequência individualmente
            for (let i = 0; i < this.photosTaken.length; i++) {
                await fetch('/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        image: this.photosTaken[i],
                        photo_index: i + 1,
                        total_in_sequence: this.photosTaken.length
                    })
                });
            }
            
            // Chama a função global de sucesso (definida no _success.html)
            if (typeof startSuccessFlow === "function") {
                startSuccessFlow();
            } else {
                showScreen('screen-success');
                setTimeout(() => window.location.reload(), 5000);
            }
            
        } catch (err) {
            alert("Erro ao enviar sequência de fotos.");
            sendBtn.disabled = false;
            sendBtn.innerText = originalText;
        }
    },

    async sendComposed() {
        if (this.photosTaken.length !== 3) {
            alert("Apenas 3 fotos podem ser emolduradas");
            return;
        }

        const sendBtn = event.currentTarget;
        const originalText = sendBtn.innerText;
        sendBtn.innerText = "ENVIANDO...";
        sendBtn.disabled = true;

        try {
            // Envia as 3 fotos para serem compostas num layout de photobooth
            const response = await fetch('/compose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    photos: this.photosTaken
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Chama a função global de sucesso
                if (typeof startSuccessFlow === "function") {
                    startSuccessFlow();
                } else {
                    showScreen('screen-success');
                    setTimeout(() => window.location.reload(), 5000);
                }
            } else {
                throw new Error(result.message || "Erro ao compor fotos");
            }
            
        } catch (err) {
            console.error("Erro:", err);
            alert("Erro ao enviar composição: " + err.message);
            sendBtn.disabled = false;
            sendBtn.innerText = originalText;
        }
    }
};