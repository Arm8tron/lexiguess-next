import { createClient } from 'redis'

const redis = createClient({
	url: process.env.REDIS_URL
});

let isConnectionOpen : boolean = false;

redis.on('error', (err) => console.log('Redis Client Error', err));

redis.on('connect', () => console.log('Connected to Redis Client'));

async function connect() {
	if(!isConnectionOpen) {
        await redis.connect();
        isConnectionOpen = true;
    }
}


export async function getDailyWord() {
	await connect();

	const word = await redis.get('daily-word');

	return word;
}
