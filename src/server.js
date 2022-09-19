'use strict';

const { PeerRPCServer } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');
const OrderBook = require('./order-book.js');

const link = new Link({
	grape: 'http://127.0.0.1:30001',
});
link.start();

const peer = new PeerRPCServer(link, {
	timeout: 300000,
});
peer.init();

const port = 1031; // 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport('server');
service.listen(port);

setInterval(function() {
	link.announce('new_order', service.port, {});
	link.announce('get_book', service.port, {});
}, 1000);

const orderBook = new OrderBook({});

setInterval(function() {
	console.log(`orderbook total:`, orderBook.getBook().length, '\t unfulfilled: ', orderBook.getUnfulfilledOrders().length);
}, 1000);

service.on('request', (rid, key, payload, handler) => {
	switch (key) {
		case 'new_order':
			orderBook.createOrder(payload);
			handler.reply(null, orderBook.getBook());
			break;
		case 'get_book':
			orderBook.matchOrders();
			handler.reply(null, orderBook.getBook());
			break;
	}
});
