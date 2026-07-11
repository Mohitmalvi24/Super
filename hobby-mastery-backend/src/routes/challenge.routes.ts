import { Router, Request, Response } from 'express';
import { generateDailyChallenge } from '../services/challenge.service';
import { validateChallengeParams } from '../middleware/validation';

const router = Router();

router.get('/:hobby', validateChallengeParams, async (req: Request, res: Response) => {
  try {
    const { hobby } = req.params;
    const level = (req.query.level as string) || 'beginner';
    const completed = parseInt((req.query.completed as string) || '0', 10);

    const challenge = await generateDailyChallenge(hobby, level, completed);
    res.json(challenge);
  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({ error: 'Failed to generate daily challenge' });
  }
});

export default router;
