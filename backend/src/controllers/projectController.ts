// Dados estáticos
const mockProjects = [
  {
    id: '1',
    userId: '1',
    name: 'Wedding Party',
    description: 'Photos from wedding reception',
    style: {
      theme: 'elegant',
      colors: ['#000000', '#FFFFFF'],
      layout: 'grid',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: '1',
    name: 'Birthday Celebration',
    description: 'Birthday party photos',
    style: {
      theme: 'colorful',
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
      layout: 'masonry',
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

export const getProjects = (req: any, res: any) => {
  const { page = 1, filter = '' } = req.query;
  
  // Simulação de paginação e filtro
  const pageNum = parseInt(page) || 1;
  const itemsPerPage = 10;
  
  let filtered = mockProjects;
  if (filter) {
    filtered = mockProjects.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  const start = (pageNum - 1) * itemsPerPage;
  const paginatedProjects = filtered.slice(start, start + itemsPerPage);

  res.json({
    success: true,
    data: paginatedProjects,
    pagination: {
      page: pageNum,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    },
  });
};

export const createProject = (req: any, res: any) => {
  const { name, description, style } = req.body;

  const newProject = {
    id: String(mockProjects.length + 1),
    userId: '1',
    name: name || 'New Project',
    description: description || '',
    style: style || {
      theme: 'default',
      colors: ['#000000'],
      layout: 'grid',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockProjects.push(newProject);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: newProject,
  });
};

export const editProject = (req: any, res: any) => {
  const { id } = req.params;
  const { name, description, style } = req.body;

  const projectIndex = mockProjects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  if (name) mockProjects[projectIndex].name = name;
  if (description) mockProjects[projectIndex].description = description;
  if (style) mockProjects[projectIndex].style = style;
  mockProjects[projectIndex].updatedAt = new Date();

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: mockProjects[projectIndex],
  });
};

export const deleteProject = (req: any, res: any) => {
  const { id } = req.params;

  const projectIndex = mockProjects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  const deletedProject = mockProjects.splice(projectIndex, 1)[0];

  res.json({
    success: true,
    message: 'Project deleted successfully',
    data: deletedProject,
  });
};

export const openProjectPage = (req: any, res: any) => {
  const { projectId } = req.params;

  const project = mockProjects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  res.json({
    success: true,
    data: {
      ...project,
      photos: [],
      permissions: ['read', 'write', 'delete'],
    },
  });
};

export const getProjectStyle = (req: any, res: any) => {
  const { projectId } = req.params;

  const project = mockProjects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  res.json({
    success: true,
    data: project.style,
  });
};
