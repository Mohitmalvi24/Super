import { Router, Request, Response } from 'express';
import { generateLearningPlan } from '../services/plan.service';
import { validatePlanRequest } from '../middleware/validation';

const router = Router();

router.post('/', validatePlanRequest, async (req: Request, res: Response) => {
  try {
    const { hobby, level, skippedTechniques } = req.body;
    const plan = await generateLearningPlan(hobby, level, skippedTechniques || []);
    res.json(plan);
  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate learning plan' });
  }
});

export default router;
