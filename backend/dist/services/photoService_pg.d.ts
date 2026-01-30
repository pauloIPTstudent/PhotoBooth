import { Photo } from '../models/types';
export declare function createPhoto(payload: Partial<Photo>): Promise<Photo>;
export declare function getPhotoById(id: string): Promise<Photo>;
export declare function listPhotosByProject(projectId: string): Promise<any>;
export declare function deletePhoto(id: string): Promise<Photo>;
//# sourceMappingURL=photoService_pg.d.ts.map