export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  style: ProjectStyle;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStyle {
  theme: string;
  colors: string[];
  layout: string;
}

export interface Photo {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string;
  frame?: string;
  qrToken?: string;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
