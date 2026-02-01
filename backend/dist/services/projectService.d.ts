import { Project } from '../models/types';
export declare function listProjects(page?: number, itemsPerPage?: number, filter?: string): Promise<{
    items: Project[];
    total: number;
}>;
export declare function createProject(payload: Partial<Project>): Promise<Project>;
export declare function getProjectById(id: string): Promise<Project>;
export declare function updateProject(id: string, payload: Partial<Project>): Promise<Project>;
export declare function deleteProjectById(id: string): Promise<Project>;
export declare function getProjectStyle(id: string): Promise<{
    name: string;
    description: string;
    theme: string;
    primary: string;
    secondary: string;
    tertiary: string;
}>;
//# sourceMappingURL=projectService.d.ts.map