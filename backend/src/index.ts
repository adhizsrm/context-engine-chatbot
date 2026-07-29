import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

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
