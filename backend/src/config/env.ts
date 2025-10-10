const bedrockApiKey = process.env.BEDROCK_API_KEY || "";
const bedrockRegion = process.env.BEDROCK_REGION || "sa-east-1";
const bedrockModelId = process.env.BEDROCK_MODEL_ID || "amazon.titan-embed-text-v2:0";
const bedrockAccessKey = process.env.BEDROCK_ACCESS_KEY || "";
const bedrockSecretKey = process.env.BEDROCK_SECRET_ACCESS || "";
const postgresDbUrl = process.env.POSTGRES_DB_URL || "postgresql://postgres:postgres@localhost:5432/ai-app";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export { bedrockApiKey, bedrockRegion, bedrockModelId, bedrockAccessKey, bedrockSecretKey, postgresDbUrl, redisUrl };
