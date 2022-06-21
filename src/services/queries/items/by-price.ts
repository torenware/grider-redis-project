import { client } from '$services/redis';
import { itemsByPriceKey } from '$services/keys';
import { getItems } from '$services/queries/items';

export const itemsByPrice = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	const ids = await client.sort(itemsByPriceKey(), {
		BY: 'jove',
		DIRECTION: 'DESC',
		GET: ['#'],
		LIMIT: {
			offset,
			count
		}
	});

	return getItems(ids as string[]);
};
