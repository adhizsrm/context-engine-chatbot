import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

// Global handler to prevent unhandled promise rejections from crashing the server
// This is necessary because older libraries like pdf-parse can leak unhandled rejections internally.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/upload', uploadRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Document Chatbot API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
