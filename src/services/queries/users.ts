import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey, usernamesUniqueKey, usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	// Look up the id-number
	const idNum = await client.zScore(usernamesKey(), username);
	const uneErr = new Error('User does not existo');
	if (idNum === null) {
		throw uneErr;
	}

	// stored as base10, convert to lc hex.
	const id = idNum.toString(16);
	const user = await client.hGetAll(usersKey(id));
	if (Object.keys(user).length == 0) {
		throw uneErr;
	}
	return deserialize(id, user);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));

	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();

	const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);
	if (exists) {
		throw new Error('Username is taken');
	}

	await client.hSet(usersKey(id), serialize(attrs));
	await client.sAdd(usernamesUniqueKey(), attrs.username);

	// Make usernames recoverable to user objects.
	// We use a sorted set; you could also do this with a hash.
	await client.zAdd(usernamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16) // must be a number, and genId() returns a hex string.
	});

	return id;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
