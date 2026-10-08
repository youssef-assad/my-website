import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const ipLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "1 h"),
  analytics: true,
  prefix: "chat:ip",
});

const DAILY_REQUEST_BUDGET = 500;

export async function checkDailyBudget(): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `chat:daily:${today}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60 * 60 * 26);
  }

  return {
    allowed: count <= DAILY_REQUEST_BUDGET,
    remaining: Math.max(0, DAILY_REQUEST_BUDGET - count),
  };
}
