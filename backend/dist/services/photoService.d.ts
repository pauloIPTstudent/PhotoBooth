import { Photo } from '../models/types';
export declare function createPhoto(payload: Partial<Photo>): Promise<Photo>;
export declare function getPhotoById(id: string): Promise<Photo | null>;
export declare function getPhotosByProjectId(projectId: string): Promise<Photo[]>;
export declare function deletePhoto(id: string): Promise<Photo | null>;
//# sourceMappingURL=photoService.d.ts.map