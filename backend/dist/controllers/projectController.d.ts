import { Request, Response } from 'express';
export declare const getProjects: (req: Request, res: Response) => Promise<void>;
export declare const createProject: (req: Request, res: Response) => Promise<void>;
export declare const editProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const openProjectPage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProjectStyle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=projectController.d.ts.map