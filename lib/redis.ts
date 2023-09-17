"use server"

import { createClient } from 'redis';
import { generate } from 'random-words';

const redis = createClient({
	url: process.env.REDIS_URL
});

let isConnectionOpen: boolean = false;

redis.on('error', (err) => console.log('Redis Client Error', err));

redis.on('connect', () => console.log('Connected to Redis Client'));

async function connect() {
	if (!isConnectionOpen) {
		await redis.connect();
		isConnectionOpen = true;
	}
}


export async function getDailyWord() {
	await connect();

	const word = await redis.get('daily-word');

	return word;
}

export async function setDailyWord() {
	try {
		await connect();

		const newWord: any = generate({ minLength: 5, maxLength: 5 });

		const response: any = await redis.set('daily-word', newWord);

		if (response == "OK") {
			return { success: "Daily word is set" }
		} else {
			throw response
		}
	} catch (error) {
		return { error }
	}
}
