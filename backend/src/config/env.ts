//melhor usar zod p validar. Qlqr coisa outra alternativa como envalid tbm é bom.
import { z } from 'zod';

const envSchema = z.object({
  BEDROCK_API_KEY: z.string().min(1),
  BEDROCK_REGION: z.string().default("sa-east-1"),
  BEDROCK_MODEL_ID: z.string().default("amazon.titan-embed-text-v2:0"),
  BEDROCK_ACCESS_KEY: z.string().min(1),
  BEDROCK_SECRET_ACCESS: z.string().min(1),
  POSTGRES_DB_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  
  // p ambiente se necess
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}

export const config = {
  bedrock: {
    apiKey: env.data.BEDROCK_API_KEY,
    region: env.data.BEDROCK_REGION,
    modelId: env.data.BEDROCK_MODEL_ID,
    accessKey: env.data.BEDROCK_ACCESS_KEY,
    secretKey: env.data.BEDROCK_SECRET_ACCESS,
  },
  database: {
    postgresUrl: env.data.POSTGRES_DB_URL,
    redisUrl: env.data.REDIS_URL,
  },
  isProduction: env.data.NODE_ENV === "production",
  isDevelopment: env.data.NODE_ENV === "development",
};