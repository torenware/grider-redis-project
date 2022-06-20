import { client } from '$services/redis';
import { itemsByEndingAtKey } from '$services/keys';
import { getItems } from '$services/queries/items';
import { deserialize } from './deserialize';

export const itemsByEndingTime = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	// retrieve the IDs.
	const ids = await client.zRange(itemsByEndingAtKey(), Date.now(), '+inf', {
		BY: 'SCORE',
		LIMIT: {
			offset,
			count
		}
	});

	//console.log('IDs', ids);
	return await getItems(ids);
};
