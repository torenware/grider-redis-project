import { client } from '$services/redis';
import { itemsKey, itemsByViewsKey, itemsUniqueViewsKey } from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	// TODO: make sure a given user gets exactly one view per item at most.
	//console.log(`${userId} viewed ${itemId}`);

	// To track unique views, we use the hyperloglog type, which is a
	// probablistic estimator of whether the HLL has seen an item before.
	// We feed the data structure with userIDs for the given itemID. In
	// a comparatively tiny heap (12KB), it records each userID, and uses
	// its fingerprint to estimate if it has seen a record before. For something
	// like unique views, a 1% error as to whether a UID has been seen before
	// is acceptible, and the space savings are immense on large data sets.
	const inserted = await client.pfAdd(itemsUniqueViewsKey(itemId), userId);
	if (inserted) {
		await Promise.all([
			client.hIncrBy(itemsKey(itemId), 'views', 1),
			client.zIncrBy(itemsByViewsKey(), 1, itemId)
		]);
	}
};
