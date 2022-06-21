import { client, withLock } from '$services/redis';
import { DateTime } from 'luxon';
import type { CreateBidAttrs } from '$services/types';
import { bidHistoryKey, itemsKey, itemsByPriceKey } from '$services/keys';
import { getItem } from '$services/queries/items';

export const createBid = async (attrs: CreateBidAttrs) => {
	// Use a transaction to prevent a race condition
	const key = itemsKey(attrs.itemId);

	// Lock example
	return withLock(`lock:${attrs.itemId}`, async () => {
		// Validate the bid
		const item = await getItem(attrs.itemId);
		if (!item) {
			throw new Error('Item not found in DB');
		}

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Auction already closed');
		}

		if (item.price >= attrs.amount) {
			throw new Error('Bid below current price');
		}

		// Should now be valid. Update item fields

		// add bid info to the queue
		const bidData = serializeBid(attrs);

		return Promise.all([
			client.hSet(key, {
				price: attrs.amount,
				highestBidUserId: attrs.userId
			}),
			client.zAdd(itemsByPriceKey(), {
				value: attrs.itemId,
				score: attrs.amount
			}),
			client.hIncrBy(key, 'bids', 1),
			client.rPush(bidHistoryKey(attrs.itemId), bidData)
		]);
	});

	// transaction example. This has issues, since under load
	// this can fail quite a lot, and the onus is on the client code
	// to retry the transaction.
	/**
  return client.executeIsolated(async (isolatedClient) => {
		// Put a watch on our key
		await isolatedClient.watch(key);

		// Validate the bid
		const item = await getItem(attrs.itemId);
		if (!item) {
			throw new Error('Item not found in DB');
		}

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Auction already closed');
		}

		if (item.price >= attrs.amount) {
			throw new Error('Bid below current price');
		}

		// Should now be valid. Update item fields

		// add bid info to the queue
		const bidData = serializeBid(attrs);

		// Attempt the following. May fail if interrupting
		// some other transaction.
		return isolatedClient
			.multi()
			.hSet(key, {
				price: attrs.amount,
				highestBidUserId: attrs.userId
			})
			.zAdd(itemsByPriceKey(), {
				value: attrs.itemId,
				score: attrs.amount
			})
			.hIncrBy(key, 'bids', 1)
			.rPush(bidHistoryKey(attrs.itemId), bidData)
			.exec();
	});
   */
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10) => {
	// starting from the right, so we need to translate our indexes:
	const start = -offset - count;
	const stop = -1 - offset;
	const bids = await client.lRange(bidHistoryKey(itemId), start, stop);
	console.log('bids', itemId, bids);
	return bids.map((bd) => deserializeBid(bd));
};

const serializeBid = (attrs: CreateBidAttrs) => {
	return `${attrs.amount}:${attrs.createdAt.toMillis()}`;
};

const deserializeBid = (bidData: string) => {
	const [bid, ts] = bidData.split(':');
	return {
		amount: parseFloat(bid),
		createdAt: DateTime.fromMillis(parseInt(ts))
	};
};
