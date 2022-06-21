import { client } from '$services/redis';
import { deserialize } from './deserialize';
import { itemsIndexKey } from '$services/keys';

export const searchItems = async (term: string, size: number = 5) => {
	console.log('called search');
	const cleaned = term
		.replaceAll(/^[a-zA-Z0-9 ]/g, '')
		.trim()
		.split(' ')
		.map((word) => (word ? `%${word}%` : '')) // fuzzy; remove doubled spaces.
		.join(' '); // do search as an and

	// validate the modified search string
	if (cleaned === '') {
		return [];
	}

	// do a full text search for our index
	const result = await client.ft.search(
		itemsIndexKey(),
		cleaned, // sufficient to run the search
		{
			LIMIT: {
				from: 0,
				size
			}
		}
	);

	console.log(result);
	return [];
};
