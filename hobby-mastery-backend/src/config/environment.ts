import dotenv from 'dotenv';
dotenv.config();

interface EnvironmentConfig {
  port: number;
  groqApiKey: string | null;
  nodeEnv: string;
  huggingfaceApiToken: string | null;
}

const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  groqApiKey: process.env.GROQ_API_KEY || null,
  nodeEnv: process.env.NODE_ENV || 'development',
  huggingfaceApiToken: process.env.HUGGINGFACE_API_TOKEN || null,
};

export default config;
