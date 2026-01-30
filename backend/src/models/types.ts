export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  theme: string;
  primary: string;
  secondary: string;
  tertiary: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface Frame {
  id: string;
  name: string;
  description?: string;
  rows: number;
  cols: number;
  photoWidth: number;
  photoHeight: number;
  padding: number;
  backgroundColor: string;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FrameId = 'grid_2x2' | 'grid_3x1' | 'grid_1x4' | 'grid_2x3';
