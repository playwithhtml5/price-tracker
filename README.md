# Description

"Price Tracker" is a Node.js app that can be used to obtain the rates of many different symbols at different exchanges. This includes normal currencies, crypto currencies, gold/silver prices, and so on.

It uses [Redis](https://github.com/mranney/node_redis) for caching results, and [cheerio](https://github.com/MatthewMueller/cheerio) (server-side jQuery)

Everything is accesible via both REST and WebSockets APIs.

## REST API

### Exchanges Collection

#### Get Exchanges

Returns the list of supported exchanges, and supported symbols in each exchange.

**Request:**

  * `GET /api/v1/exchanges`

Example:

    $ curl http://localhost:5000/api/v1/exchanges
    {
      "data": [
        {
          "exchange": "amagi",
          "symbols": [
            "XAUUSD",
            "XAGUSD"
          ]
        },
        {
          "exchange": "ambito",
          "symbols": [
            "USDARS",
            "USDARSB",
            "USDARSCL",
            "USDARSBOL"
          ]
        },
        {
          "exchange": "btc-e",
          "symbols": [
            "BTCUSD",
            "LTCUSD"
          ]
        },
        [...]
      ]
    }

### Symbols Collection

#### Get Symbols

Returns the list of supported symbols, and the exchanges that provide them.

**Request:**

  * `GET /api/v1/symbols`

Example:

    $ curl http://localhost:5000/api/v1/exchanges
    {
      "data": [
        {
          "symbol": "XAUUSD",
          "exchanges": [
            "amagi",
            "bullionvault"
          ]
        },
        {
          "symbol": "USDARSB",
          "exchanges": [
            "ambito",
            "clarin",
            "cronista",
            "infobae",
            "lanacion"
          ]
        },
        {
          "symbol": "BTCUSD",
          "exchanges": [
            "btc-e",
            "bitfinex",
            "bitstamp",
            "cexio",
            "coinbase",
            "coinsetter",
            "okcoin"
          ]
        },
        [...]
      ]
    }

#### Get Symbol

Returns the information for this symbol in this particular exchange.

**Request:**

  * `GET /api/v1/symbols/<symbol>/<exchange>`

Fields:
  * **exchange**: Name of the exchange/source
  * **symbol**: Symbol name
  * **bid**: Best *buy* offer
  * **ask**: Best *sell* offer
  * **updated_on**: Date in which this information was *retrieved* from the exchange (it may have been retrieved recently but the data could still be old)
  * **custom**: Additional data, depending on symbol/exchange
    * **volume24**: Total volume transacted in the last 24 hours
    * **high24**: Highest *sell* value in the last 24 hours
    * **low24**: Lowest *sell* value in the last 24 hours
    * **published_on**: Date in which this information was *published* (this is the real date, but it's not always available)

Example 1:

    $ curl http://localhost:5000/api/v1/symbols/BTCUSD/bitstamp
    {
      "data": {
        "exchange": "bitstamp",
        "symbol": "BTCUSD",
        "bid": 238.58,
        "ask": 238.59,
        "updated_on": "2015-05-24T03:02:03.068Z",
        "custom": {
          "volume24": 2592.47046949,
          "high24": 240.67,
          "low24": 237.4
        }
      }
    }

Example 2:

    $ curl http://localhost:5000/api/v1/sybols/USDARSB/lanacion
    {
      "data": {
        "exchange": "lanacion",
        "symbol": "USDARSB",
        "bid": 12.45,
        "ask": 12.65,
        "updated_on": "2015-05-24T03:02:31.709Z",
        "custom": {
          "published_on": "2015-05-21T03:00:00.000Z"
        }
      }
    }

#### Get Price Series

Returns all stored prices for this particular symbol in this exchange in the specified date range.

**Request:**

  * `GET /api/v1/symbols/<symbol>/<exchange>/series?start=<start>&end=<end>`

Fields:
  * **exchange**: Name of the exchange/source
  * **symbol**: Symbol name
  * **series**: List of elements with the following fields:
    * **date**: Item date
    * **bid**: Best *buy* offer
    * **ask**: Best *sell* offer

Example:

    $ curl http://localhost:5000/api/v1/sybols/USDARSB/lanacion/series
    {
      "data": {
        "exchange": "lanacion",
        "symbol": "USDARSB",
        "series": [
          {
            "date": "2015-05-24T15:27:00.531Z",
            "bid": 11.205,
            "ask": 11.385
          },
          [...]
          {
            "date": "2015-05-25T01:27:00.531Z",
            "bid": 12.45,
            "ask": 12.65
          }
        ]
      }
    }

## WebSockets API

    var ws = new WebSocket(host);
    
    // Using plain objects:
    ws.onopen = function (event) {
        ws.send('{
            "type": "ExchangesRequest",
            "request": {
                "options": {}
            }
        }');
        ws.send('{
            "type": "SymbolRequest",
            "request": {
                "symbol": "LTCUSD",
                "exchange": "btc-e",
                "options": {}
            }
        }');
    };
    
    // Or, using classes:
    ws.onopen = function (event) {
        ws.send((new ExchangesRequest()).toString());
        ws.send((new SymbolRequest("LTCUSD", "btc-e")).toString());
    };
    
    ws.onmessage = function (event) {
        var object = JSON.parse(event.data);
    
        if (object.type == "Exchanges") {
            object.response.data.forEach(function(item) {
                item.symbols.forEach(function(symbol) {
                    console.log("exchange:", item.exchange, "symbol:", symbol);
                });
            });
        } else if (object.type == "Symbol") {
            console.log("symbol:", object.response.data.symbol);
            console.log("exchange:", object.response.data.exchange);
            console.log("bid:", object.response.data.bid);
            console.log("ask:", object.response.data.ask);
        }
    };

## Live site

The application can be previewed live at <http://price-tracker.herokuapp.com/>

