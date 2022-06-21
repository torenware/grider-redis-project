import { SchemaFieldTypes } from 'redis';
import { client } from './client';
import { itemsIndexKey, itemsKey } from '$services/keys';

export const createIndexes = async () => {
	// Check to see if we already have this index:
	const indexes = await client.ft._list();

	if (indexes.includes(itemsIndexKey())) {
		return;
	}

	return client.ft.create(
		itemsIndexKey(),
		// schema:
		{
			name: {
				type: SchemaFieldTypes.TEXT
			},
			description: {
				type: SchemaFieldTypes.TEXT
			}
		},
		// options:
		{
			ON: 'HASH',
			PREFIX: itemsKey('')
		}
	);
};
