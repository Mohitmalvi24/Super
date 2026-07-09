import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateLearningPlan } from './services/ai.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/plan', async (req: Request, res: Response) => {
  try {
    const { hobby, level } = req.body;
    
    if (!hobby || !level) {
      return res.status(400).json({ error: 'Missing hobby or level' });
    }

    const plan = await generateLearningPlan(hobby, level);
    res.json(plan);
  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: 'Failed to generate learning plan' });
  }
});

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
