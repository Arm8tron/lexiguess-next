"use server"

import Redis from 'ioredis';

export async function getLeaderBoard() {
    const redisUrl: string | undefined = process.env.REDIS_URL;
    if (!redisUrl) return;

    const redis = new Redis(redisUrl);
    const res = await redis.lrange("leaderboard", 0, -1);

    redis.quit();

    console.log(res);

}
