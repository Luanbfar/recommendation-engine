import { createClient } from "redis";
import { redisUrl } from "../config/env.ts";

const redisClient = createClient({
  url: redisUrl,
});

export default redisClient;
