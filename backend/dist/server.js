import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { projectRoutes } from './routes/projectRoutes.js';
import { photoRoutes } from './routes/photoRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { frameRoutes } from './routes/frameRoutes.js';
import { testConnection } from './services/connectionTest.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/frames', frameRoutes); // Assuming frameRoutes are included in photoRoutes
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});
// Database connection test
app.get('/api/test-connection', async (req, res) => {
    try {
        const result = await testConnection();
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=server.js.map