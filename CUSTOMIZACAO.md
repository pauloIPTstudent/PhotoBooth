# Guia de Customização - PhotoBooth

## 🎨 Personalizar Cores

Todas as cores do projecto estão centralizadas no ficheiro `.env`. Basta alterar os valores HEX para customizar a aparência completa da aplicação.

### Cores Disponíveis

```env
# Cor Principal (botões, destaques, gradientes)
PHOTOBOOTH_COLOR_HEX=#e91e63

# Cor do Fundo Escuro (background geral)
PHOTOBOOTH_BG_DARK=#0a0a0a

# Cor Branca (texto, bordas)
PHOTOBOOTH_COLOR_WHITE=#ffffff

# Cor Cinzenta Clara (textos secundários)
PHOTOBOOTH_COLOR_GRAY_LIGHT=#aaa

# Cor Cinzenta Escura (bordas, divisórias)
PHOTOBOOTH_COLOR_GRAY_DARK=#333

# Cor do Botão Verde (botão IMPRIMIR)
PHOTOBOOTH_BTN_GREEN=#4cd964
```

## 📝 Texto e Evento

```env
# Título do Evento (aparece em todas as telas)
PHOTOBOOTH_TITLE=Mosqueteiras & Photobooth

# Data do Evento (formato: DD * MM * YYYY)
PHOTOBOOTH_DATE=24 * 01 * 2026
```

## 🖼️ Composição de Fotos (3 Fotos)

```env
# Largura da tira de fotos
PHOTOBOOTH_CANVAS_WIDTH=600

# Cor do texto no rodapé
PHOTOBOOTH_TEXT_COLOR=#3c3c3c

# Cor de fundo da tira
PHOTOBOOTH_BACKGROUND_COLOR=#aaaaaa
```

## 📁 Estrutura CSS

O estilo está organizado em:

1. **static/css/style.css** - Ficheiro principal com todas as classes reutilizáveis
2. **/css/colors.css** (dinâmico) - Gerado pelo servidor com as cores do .env

### Classes CSS Reutilizáveis

#### Telas
- `.screen` - Container base para cada tela
- `.screen.active` - Tela ativa (visível)
- `.gradient-dark` - Fundo com gradiente escuro (Start)
- `.gradient-dark-light` - Fundo com gradiente para sucesso
- `.screen-options` - Tela de opções
- `.screen-camera` - Tela da câmara

#### Botões
- `.btn-circle` - Botão circular grande (START)
- `.btn-fixed` - Botão fixo no footer
- `.btn-fixed-primary` - Botão primário (verde - IMPRIMIR)
- `.btn-fixed-secondary` - Botão secundário (REPETIR)
- `.btn-advance` - Botão AVANÇAR nas opções
- `.btn-shoot` - Botão START da câmara

#### Formulários e Opções
- `.opt-btn` - Botão de opção
- `.opt-btn.active` - Opção selecionada
- `.options-label` - Label das opções
- `.options-group` - Grupo de botões de opção

#### Conteúdo
- `.photos-container` - Container das fotos no preview
- `.bottom-actions` - Barra fixa com botões
- `.success-icon` - Ícone de sucesso
- `.success-title` - Título de sucesso
- `.success-message` - Mensagem de sucesso
- `.event-name` - Nome do evento
- `.progress-bar-container` - Barra de progresso
- `.progress-bar` - Barra animada

#### Câmara
- `.camera-video` - Elemento vídeo
- `.camera-overlay` - Overlay com botão e countdown
- `#countdown` - Elemento do countdown

## 🔄 Fluxo de Cores

1. Utilizador modifica `.env`
2. Servidor carrega variáveis via `/css/colors.css`
3. CSS dinâmico substitui as variáveis CSS `:root`
4. Todas as classes usam `var(--pink)`, `var(--dark)`, etc.
5. Mudança instantânea sem editar CSS

## 💡 Exemplo: Mudar Tema Completo

### Tema Rosa/Roxo
```env
PHOTOBOOTH_COLOR_HEX=#c2185b
PHOTOBOOTH_BG_DARK=#1a0f1f
PHOTOBOOTH_COLOR_GRAY_LIGHT=#d9b5d9
PHOTOBOOTH_BTN_GREEN=#9c27b0
```

### Tema Azul
```env
PHOTOBOOTH_COLOR_HEX=#1976d2
PHOTOBOOTH_BG_DARK=#0d47a1
PHOTOBOOTH_COLOR_GRAY_LIGHT=#81d4fa
PHOTOBOOTH_BTN_GREEN=#0288d1
```

### Tema Verde
```env
PHOTOBOOTH_COLOR_HEX=#388e3c
PHOTOBOOTH_BG_DARK=#1b5e20
PHOTOBOOTH_COLOR_GRAY_LIGHT=#66bb6a
PHOTOBOOTH_BTN_GREEN=#43a047
```

## 🎯 Boas Práticas

1. **Contraste**: Assegure que a cor principal contrasta bem com o fundo escuro
2. **Botão Verde**: Use tons de verde para o botão IMPRIMIR (cor tradicional de confirmação)
3. **Testabilidade**: Altere uma cor por vez e teste antes de prosseguir
4. **Formato HEX**: Use sempre formato HEX de 6 dígitos (#RRGGBB)

## 🔧 Aplicar Mudanças

1. Edite `.env`
2. Reinicie o servidor Flask: `python app.py`
3. Limpe cache do navegador (Ctrl+Shift+Delete) se necessário
4. Recarregue a página

Pronto! Todas as cores estão atualizadas.
