import config from './config/environment';
import express from 'express';
import cors from 'cors';
import planRoutes from './routes/plan.routes';
import challengeRoutes from './routes/challenge.routes';
import videoRoutes from './routes/video.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/plan', planRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/video', videoRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});
