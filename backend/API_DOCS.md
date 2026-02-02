# API PhotoBooth Backend

## Endpoints Disponíveis

### Autenticação

#### POST `/api/auth/login`
Realiza login do usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (sucesso):**
```json
{
  "success": true,
  "token": "fake-jwt-token-1234567890",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Projetos

#### GET `/api/projects?page=1&filter=search`
Lista todos os projetos com paginação e filtro.

**Query Parameters:**
- `page` (optional): Número da página (padrão: 1)
- `filter` (optional): Texto para filtrar pelo nome

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "userId": "1",
      "name": "Wedding Party",
      "description": "Photos from wedding reception",
      "style": {
        "theme": "elegant",
        "colors": ["#000000", "#FFFFFF"],
        "layout": "grid"
      },
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

#### POST `/api/projects`
Cria um novo projeto.

**Body:**
```json
{
  "name": "New Project",
  "description": "Descrição do projeto",
  "style": {
    "theme": "colorful",
    "colors": ["#FF6B6B", "#4ECDC4"],
    "layout": "masonry"
  }
}
```

#### GET `/api/projects/:projectId/open`
Abre um projeto específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "userId": "1",
    "name": "Wedding Party",
    "description": "Photos from wedding reception",
    "style": {...},
    "photos": [],
    "permissions": ["read", "write", "delete"],
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### GET `/api/projects/:projectId/style`
Obtém o estilo de um projeto.

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "elegant",
    "colors": ["#000000", "#FFFFFF"],
    "layout": "grid"
  }
}
```

#### PUT `/api/projects/:id`
Edita um projeto existente.

**Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Nova descrição",
  "style": {...}
}
```

#### DELETE `/api/projects/:id`
Deleta um projeto.

---

### Fotos

#### GET `/api/photos/project/:projectId`
Lista todas as fotos de um projeto.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "projectId": "1",
      "fileName": "photo1.jpg",
      "filePath": "/uploads/photo1.jpg",
      "frame": "classic",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### GET `/api/photos/:id`
Obtém uma foto específica.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "projectId": "1",
    "fileName": "photo1.jpg",
    "filePath": "/uploads/photo1.jpg",
    "frame": "classic",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### GET `/api/photos/qrcode/:token`
Obtém uma foto usando o token do QR code.

#### POST `/api/photos`
Salva uma nova foto.

**Body:**
```json
{
  "projectId": "1",
  "fileName": "photo.jpg",
  "frame": "modern"
}
```

#### POST `/api/photos/:id/generate-qrcode`
Gera um QR code para a foto. O QR code contém um link que leva para recuperar a foto pelo token.

**Response:**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "photoId": "1",
    "token": "qr-token-1234567890",
    "qrUrl": "http://localhost:3001/api/photos/qrcode/qr-token-1234567890",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

#### PUT `/api/photos/:id/frame`
Aplica um frame à foto.

**Body:**
```json
{
  "tipo_de_frame": "vintage"
}
```

#### DELETE `/api/photos/:id`
Deleta uma foto.

---

## Rodando a aplicação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

O servidor estará disponível em `http://localhost:3001`
