import { client } from '$services/redis';
import { userLikesKey, itemsKey, usersKey } from '$services/keys';
import { getItems } from '$services/queries/items';

export const userLikesItem = async (itemId: string, userId: string) => {
	return client.sIsMember(userLikesKey(userId), itemId);
};

export const likedItems = async (userId: string) => {
	const ids = await client.sMembers(userLikesKey(userId));
	const items = await getItems(ids);
	return items;
};

export const likeItem = async (itemId: string, userId: string) => {
	// very rapid double clicks can cause weird effects.
	const clicks = await client.sAdd(userLikesKey(userId), itemId);
	if (clicks) {
		await client.hIncrBy(itemsKey(itemId), 'likes', 1);
	}
};

export const unlikeItem = async (itemId: string, userId: string) => {
	const clicks = await client.sRem(userLikesKey(userId), itemId);
	if (clicks) {
		await client.hIncrBy(itemsKey(itemId), 'likes', -1);
	}
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
	// note we pass an array of keys:
	const ids = await client.sInter([userLikesKey(userOneId), userLikesKey(userTwoId)]);
	return getItems(ids);
};
