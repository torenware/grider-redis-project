import { client } from '$services/redis';
import { itemsByViewsKey, itemsKey } from '$services/keys';
import { deserialize } from '$services/queries/items';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	let results: any = await client.sort(itemsByViewsKey(), {
		BY: 'nosort', // nonexistent key indicates no sort in sort.
		GET: [
			'#',
			`${itemsKey('*')}->name`,
			`${itemsKey('*')}->views`,
			`${itemsKey('*')}->endingAt`,
			`${itemsKey('*')}->imageUrl`,
			`${itemsKey('*')}->price`
		],
		DIRECTION: order,
		LIMIT: {
			offset,
			count
		}
	});

	// we have an endless list of strings. Unpack it and deserialize.
	const items = [];
	while (results.length) {
		let [id, name, views, endingAt, imageUrl, price, ...rest] = results;
		const item = deserialize(id, {
			name,
			views,
			endingAt,
			imageUrl,
			price
		});
		items.push(item);
		results = rest;
	}

	return items;
};
