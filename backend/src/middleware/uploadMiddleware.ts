import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

// Interface para request com file
interface UploadRequest {
  file?: Express.Multer.File;
  body: any;
}

// Configurar storage customizado para salvar em uploads/{projectId}
const createStorage = (): StorageEngine => {
  return multer.diskStorage({
    destination: (req: any, file: Express.Multer.File, cb) => {
      const projectId = req.body.projectId;

      if (!projectId) {
        return cb(new Error('projectId is required'), '');
      }

      const uploadDir = path.join(process.cwd(), 'uploads', projectId);

      // Criar diretório se não existir
      fs.mkdirSync(uploadDir, { recursive: true });

      cb(null, uploadDir);
    },
    filename: (req: any, file: Express.Multer.File, cb) => {
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
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
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

export default uploadPhoto;
