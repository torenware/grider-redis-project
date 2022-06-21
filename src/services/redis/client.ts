import { createClient, defineScript } from 'redis';
import { createIndexes } from './create-indexes';

const client = createClient({
	scripts: {
		unlockItem: defineScript({
			NUMBER_OF_KEYS: 1,
			transformArguments: (lockKey: string, token: string) => {
				return [lockKey, token];
			},
			SCRIPT: `
      local lockKey = KEYS[1]
      local token = ARGV[1]

      -- only delete key if it is belong to me.
      if redis.call('GET', lockKey) == token then
        return redis.call('DEL', lockKey)
      end
      `
		})
	},
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW
});

client.on('error', (err) => console.error(err));

// On connection do some stuff.  Such as create our index
// if our index does not yet exist:
client.connect();
client.on('connect', async () => {
	try {
		console.log('creating indexes');
		await createIndexes();
	} catch (err) {
		console.error(err);
	}
});

export { client };
