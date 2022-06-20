import { client } from '$services/redis';
import { itemsKey, itemsByViewsKey } from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	// TODO: make sure a given user gets exactly one view per item at most.
	console.log(`${userId} viewed ${itemId}`);
	await Promise.all([
		client.hIncrBy(itemsKey(itemId), 'views', 1),
		client.zIncrBy(itemsByViewsKey(), 1, itemId)
	]);
};
