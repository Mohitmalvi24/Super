import dotenv from 'dotenv';
dotenv.config();

interface EnvironmentConfig {
  port: number;
  groqApiKey: string | null;
  nodeEnv: string;
}

const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  groqApiKey: process.env.GEMINI_API_KEY || null,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
