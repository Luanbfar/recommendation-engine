import { createClient } from "redis";
import { config } from "../config/env.ts";

const redisClient = createClient({
  url: config.database.redisUrl,
});

export default redisClient;
