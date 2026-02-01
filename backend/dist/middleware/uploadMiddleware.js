import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Configurar storage customizado para salvar em uploads/{projectId}
const createStorage = () => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const projectId = req.body.projectId;
            if (!projectId) {
                return cb(new Error('projectId is required'), '');
            }
            const uploadDir = path.join(process.cwd(), 'uploads', projectId);
            // Criar diretório se não existir
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Gerar nome único para o arquivo
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);
            const filename = `${name}-${timestamp}${ext}`;
            cb(null, filename);
        },
    });
};
// Configurar filtro para apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
    }
};
// Criar instância do multer
export const uploadPhoto = multer({
    storage: createStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
export const uploadPhotos = multer({
    storage: multer.memoryStorage(), // Essencial para existir o file.buffer
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
export const uploadBg = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // O destino agora é fixo na pasta 'bg'
            const uploadDir = path.join(process.cwd(), 'uploads', 'bg');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const { projectId } = req.params;
            if (!projectId) {
                return cb(new Error('projectId is required in params'), '');
            }
            const ext = path.extname(file.originalname);
            // O nome do arquivo passa a ser exatamente o ID do projeto
            const filename = `${projectId}${ext}`;
            cb(null, filename);
        },
    }),
    fileFilter: fileFilter,
});
export default { uploadPhoto, uploadPhotos, uploadBg };
//# sourceMappingURL=uploadMiddleware.js.map