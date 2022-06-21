import type { CreateItemAttrs } from '$services/types';

export const serialize = (attrs: CreateItemAttrs) => {
	const data = {
		...attrs,
		createdAt: attrs.createdAt.toMillis(),
		endingAt: attrs.endingAt.toMillis()
	};
	console.log('created item:', data);
	return data;
};
