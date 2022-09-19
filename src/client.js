'use strict';

const { PeerRPCClient } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');
const OrderBook = require('./order-book.js');
const { newId } = require('./lib.js');
var readline = require('readline'),
	rl = readline.createInterface(process.stdin, process.stdout);

const client_id = newId();
console.log('Your client Id is: ', client_id);

const link = new Link({
	grape: 'http://127.0.0.1:30001',
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

const orderBook = new OrderBook({ peer, client_id });

console.log('\nAvailable commands:\n');
console.log("buy [price] [amount]: create a 'buy' order");
console.log("sell [price] [amount]: create a 'sell' order");
console.log('open: shows your unfulfilled orders');
console.log('closed: shows your fulfilled orders');
console.log('\n');
rl.setPrompt('DEXCHANGE> ');
rl.prompt();

rl.on('line', function(line) {
	const options = line.trim().split(' ');

	switch (options[0]) {
		case 'buy':
			if (orderBook.createOrder({ type: 'buy', price: parseInt(options[1]), amount: parseInt(options[2]) })) console.log('buy order created');
			break;
		case 'sell':
			if (orderBook.createOrder({ type: 'sell', price: parseInt(options[1]), amount: parseInt(options[2]) })) console.log('sell order created');
			break;
		case 'open':
			console.log(orderBook.getMyUnfulfilledOrders());
			break;
		case 'closed':
			console.log(orderBook.getMyFulfilledOrders());
			break;
		default:
			console.log('unknown command');
			break;
	}
	rl.prompt();
}).on('close', function() {
	process.exit(0);
});

/*
for (let i = 0; i < 10; i++) {
	orderBook.createOrder({ type: 'buy', price: 100, amount: 1 });
}
*/
