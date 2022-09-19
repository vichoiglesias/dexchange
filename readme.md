# Partial solution


## How to run:
```
# boot two grape servers on console
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

## Run the server
```
node src/server.js
```

## Run as many clients as you want
```
node src/client.js
```

## Options
The client will prompt you with the options to:
- buy [price] [amount]: create a 'buy' order
- sell [price] [amount]: create a 'sell' order
- open: show your open orders
- closed: show your fulfilled  orders


The requirements where:
- Each client will have its own instance of the orderbook
	R: We have a OrderBook class that automatically syncs with a server (which I get is not the most decentraliced thing...).
- Clients submit orders to their own instance of orderbook. The order is distributed to other instances, too.
	R: The client will create the order locally and then send it to the server. The server will return the updated orderbook with the new order.
- If a client's order matches with another order, any remainer is added to the orderbook, too.
	R: There is a simple match creating algorithm on the OrderBook class. If there is an extra amount to buy / sell, that extra will be added to the orderbook with the same date so it takes precedence over newer orders.
	
	
## With more time
- We could have multiple servers. I could find a correct way to use multiple servers with Grenache... this would allow for a truly decentralised exchange.
- We are trusting the date that the clients give.
- There's no type of security, login, and all that.
- Test, tests and more tests...