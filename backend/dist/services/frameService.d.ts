import { Frame } from '../models/types';
export declare function listFrames(): Promise<Frame[]>;
export declare function getFramesByProjectId(projectId: string): Promise<Frame[]>;
export declare function addFrameToProject(projectId: string, frameId: string): Promise<void>;
export declare function syncProjectFrames(projectId: string, frameIds: string[]): Promise<void>;
export declare function removeFrameFromProject(projectId: string, frameId: string): Promise<void>;
export declare function createFrame(payload: Partial<Frame>): Promise<Frame>;
export declare function getFrameById(id: string): Promise<Frame | null>;
export declare function updateFrame(id: string, payload: Partial<Frame>): Promise<Frame>;
export declare function deleteFrame(id: string): Promise<Frame | null>;
//# sourceMappingURL=frameService.d.ts.map