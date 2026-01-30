import { Frame } from '../models/types';
export declare function listFrames(): Promise<any>;
export declare function createFrame(payload: Partial<Frame>): Promise<Frame>;
export declare function getFrameById(id: string): Promise<Frame>;
export declare function updateFrame(id: string, payload: Partial<Frame>): Promise<Frame>;
export declare function deleteFrame(id: string): Promise<Frame>;
//# sourceMappingURL=frameService_pg.d.ts.map