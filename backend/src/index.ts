import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.routes';
import { WeaviateService } from './vector-store/weaviate.service';

dotenv.config();

// Global handler to prevent unhandled promise rejections from crashing the server
// This is necessary because older libraries like pdf-parse can leak unhandled rejections internally.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
});

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api', uploadRoutes);

// Simple root route
app.get('/', (req: Request, res: Response) => {
  res.send('Document Chatbot Backend is running');
});

// Primary Server Boot
const startServer = async () => {
  try {
    await WeaviateService.initialize();

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Critical Failure: Primary system boot failed.", error);
    process.exit(1);
  }
};

startServer();
