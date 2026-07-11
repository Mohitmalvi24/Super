import { Request, Response, NextFunction } from 'express';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

export function validatePlanRequest(req: Request, res: Response, next: NextFunction): void {
  const { hobby, level } = req.body;

  if (!hobby || typeof hobby !== 'string' || hobby.trim().length < 2) {
    res.status(400).json({ error: 'Hobby is required and must be at least 2 characters.' });
    return;
  }

  if (!level || !VALID_LEVELS.includes(level)) {
    res.status(400).json({ error: `Level must be one of: ${VALID_LEVELS.join(', ')}` });
    return;
  }

  req.body.hobby = hobby.trim();
  next();
}

export function validateChallengeParams(req: Request, res: Response, next: NextFunction): void {
  const { hobby } = req.params;

  if (!hobby || typeof hobby !== 'string' || hobby.trim().length < 2) {
    res.status(400).json({ error: 'Hobby parameter is required.' });
    return;
  }

  next();
}
