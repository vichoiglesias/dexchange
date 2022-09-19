const { newId } = require('./lib.js');
const crypto = require('crypto');

class OrderBook {
	constructor({ peer, client_id }) {
		this.book = [];
		this.peer = peer;
		this.client_id = client_id;
		this.sync = false;

		if (this.peer) {
			setInterval(() => {
				this.peer.request('get_book', {}, { timeout: 10000 }, (err, data) => {
					if (err) {
						console.error(err);
						process.exit(-1);
					}
					this.book = data;
				});
			}, 1000);
		}
	}

	startBook(newState) {
		this.book = newState;
	}

	// Creates a new Order
	// params:
	// type: "buy" || "sell"
	// price: float, desired price of the asset
	// amount: float, amount to sell
	// client_id
	createOrder({ type, price, amount, client_id, date, parent_id }) {
		const newOrder = {
			id: newId(),
			type,
			price,
			amount,
			fulfilled: false,
			client_id,
			date,
			parent_id,
		};

		if (isNaN(price) || isNaN(amount)) {
			return false;
		}

		if (this.peer) {
			newOrder.client_id = this.client_id;
			newOrder.date = new Date();

			this.peer.request('new_order', newOrder, { timeout: 10000 }, (err, data) => {
				if (err) {
					console.error(err);
					process.exit(-1);
				}
				this.book = data;
			});
		} else {
			this.book.push(newOrder);
			this.matchOrders();
		}
		return true;
	}

	getBook() {
		return this.book;
	}

	getUnfulfilledOrders() {
		return this.book.filter(order => !order.fulfilled);
	}

	getFulfilledOrders() {
		return this.book.filter(order => order.fulfilled);
	}

	getMyUnfulfilledOrders() {
		return this.getUnfulfilledOrders().filter(order => order.client_id == this.client_id);
	}

	getMyFulfilledOrders() {
		return this.getFulfilledOrders().filter(order => order.client_id == this.client_id);
	}

	matchOrders() {
		if (this.client_id) {
			// for simplicity we will match orders only on the server
			return;
		}

		const unfulfilledOrders = this.getUnfulfilledOrders();

		const buyers = unfulfilledOrders.filter(order => order.type === 'buy').sort((a, b) => b.price - a.price || a.date - b.date);
		const sellers = unfulfilledOrders.filter(order => order.type === 'sell').sort((a, b) => a.price - b.price || a.date - b.date);

		let current_buyer = buyers[0];
		let current_seller = sellers[0];

		// we found a price match
		if (current_buyer && current_seller && current_buyer.price >= current_seller.price) {
			current_seller.fulfilled = true;
			current_buyer.fulfilled = true;

			current_seller.fulfilledBy = current_buyer.id;
			current_buyer.fulfilledBy = current_seller.id;

			current_buyer.final_price = current_seller.price;

			if (current_buyer.amount > current_seller.amount) {
				// the buyer wants more
				this.createOrder({
					type: 'buy',
					price: current_buyer.price,
					amount: current_buyer.amount - current_seller.amount,
					client_id: current_buyer.client_id,
					date: current_buyer.date,
					parent_id: current_buyer.id,
				});
			} else if (current_buyer.amount < current_seller.amount) {
				// the seller has more to sell
				this.createOrder({
					type: 'sell',
					price: current_seller.price,
					amount: current_seller.amount - current_buyer.amount,
					client_id: current_seller.client_id,
					date: current_seller.date,
					parent_id: current_seller.id,
				});
			}
		}
	}
}

module.exports = OrderBook;
