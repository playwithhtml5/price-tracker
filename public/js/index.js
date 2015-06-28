/**
 * Taken from http://stackoverflow.com/a/2117523
 */
function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * Utility function to avoid tedious string concatenations:
 * Instead of: 'a' + 'b' + 'c', 
 *         or: ['a', 'b', 'c'].join(""), 
 * you can write: concat('a', 'b', 'c')
 */
function concat () {
    var args = Array.prototype.slice.call(arguments);
    return args.join("");
}
/**
 * Use __('a', 'b', 'c') instead of concat('a', 'b', 'c')
 */
__ = concat;
/**
 * Use $__('a', 'b', 'c') instead of $(__('a', 'b', 'c'))
 */
$__ = function() {
    return $(__.apply(null, arguments));
};
/**/

function QuotesView() {
    this.exchanges = {
        'amagi' : {
            description: 'Amagi Metals',
            link: 'https://www.amagimetals.com/',
        },
        'ambito' : {
            description: 'Ambito.com',
            link: 'http://www.ambito.com.ar/economia/mercados/monedas/dolar/',
        },
        'lanacion' : {
            description: 'La Nacion',
            link: 'http://www.lanacion.com.ar/dolar-hoy-t1369'
        },
        'clarin' : {
            description: 'Clarin',
            link: 'http://www.ieco.clarin.com/'
        },
        'cexio' : {
            description: 'Cex.IO',
            link: 'https://cex.io/'
        },
        'cronista' : {
            description: 'Cronista',
            link: 'http://www.cronista.com'
        },
        'infobae' : {
            description: 'Infobae',
            link: 'http://www.infobae.com'
        },
        'coinbase' : {
            description: 'Coinbase',
            link: 'https://coinbase.com/charts',
        },
        'coinsetter' : {
            description: 'Coinsetter',
            link: 'https://www.coinsetter.com/',
        },
        'bitstamp' : {
            description: 'Bitstamp',
            link: 'https://www.bitstamp.net',
        },
        'btc-e' : {
            description: 'BTC-e',
            link: 'https://btc-e.com',
        },
        'okcoin' : {
            description: 'OKCoin',
            link: 'https://www.okcoin.com/market.do',
        },
        'bitfinex' : {
            description: 'Bitfinex',
            link: 'https://www.bitfinex.com/pages/stats',
        },
        'bullionvault' : {
            description: 'BullionVault',
            link: 'https://www.bullionvault.com',
        },
        'virwox' : {
            description: 'VirWox',
            link: 'https://www.virwox.com',
        }
    };

    this.symbols = {
        'USDARS' : {
            description: '(Dolar oficial)',
            exchanges: ['ambito', 'lanacion', 'cronista', 'infobae', 'clarin'],
            prefix: 'AR$',
            column: '1'
        }, 
        'USDARSB' : {
            description: '(Dolar blue)',
            exchanges: ['ambito', 'lanacion', 'cronista', 'infobae', 'clarin'],
            prefix: 'AR$',
            column: '1'
        }, 
        'USDARSCL' : {
            description: '(Contado c/liqui)',
            exchanges: ['ambito', 'cronista', 'infobae'],
            prefix: 'AR$',
            column: '1'
        },
        'USDARSBOL' : {
            description: '(Dolar bolsa)',
            exchanges: ['ambito'],
            prefix: 'AR$',
            column: '1'
        },
        'BTCUSD' : {
            description: '(Bitcoin)',
            exchanges: ['bitstamp', 'coinbase', 'btc-e',
                        'okcoin', 'bitfinex',
                        'coinsetter', 'cexio'],
            prefix: '$',
            column: '2'
        },  
        'LTCUSD' : {
            description: '(Litecoin)',
            exchanges: ['btc-e', 'okcoin', 'bitfinex', 'cexio'],
            prefix: '$',
            column: '2'
        },
        'XAUUSD' : {
            description: '(Gold)',
            exchanges: ['bullionvault', 'amagi'],
            prefix: '$',
            column: '2'
        },           
        'XAGUSD' : {
            description: '(Silver)',
            exchanges: ['bullionvault', 'amagi'],
            prefix: '$',
            column: '2'
        }, 
        'USDSLL' : {
            description: '(Linden/USD)',
            exchanges: ['virwox'],
            prefix: '',
            column: '2'
        }, 
        'BTCSLL' : {
            description: '(Linden/Bitcoin)',
            exchanges: ['virwox'],
            prefix: 'SLL ',
            column: '2'
        }, 
    };

    this.symbol_list = [
        'USDARSB', 'USDARS', 'USDARSCL', 'USDARSBOL',
        null,
        'BTCUSD', 'LTCUSD',
        null,
        'XAUUSD', 'XAGUSD',
        null,
        'USDSLL', 'BTCSLL'
    ];
}

QuotesView.prototype.render = function() {
    var self = this;

    this.symbol_list.forEach(function(symbol) {
        self.addSymbol(symbol, self.symbols[symbol]);
    });
};

QuotesView.prototype.updateExchangeChart = function(symbol, exchange) {
    var series_url = (
        location.origin + '/api/v1/symbols/' +
        symbol + '/' + exchange + '/series'
    );

    var chart = $__('#', symbol, '-', exchange, '-chart').highcharts();

    if (chart === undefined)
        chart = this.renderExchangeChart(symbol, exchange);

    chart.showLoading('Loading data...');

    $.getJSON(series_url, function (response) {
        var series = function (name) {
            return response.data.series.map(function (item) {
                return [
                    new Date(item.date) * 1,
                    item[name].open,
                    item[name].high,
                    item[name].low,
                    item[name].close,
                ];
            });
        };

        chart.series[0].setData(series('ask'));

        chart.hideLoading();
    });
};

QuotesView.prototype.getSelectedSymbol = function(model) {
    return model.getSelectedSymbol() ||
           this.symbol_list[0];
};

QuotesView.prototype.getSelectedExchange = function(model, symbol) {
    return model.getSelectedExchange(symbol) ||
           this.symbols[symbol].exchanges[0];
};

QuotesView.prototype.onSymbolSelected = function(model, symbol) {
    var exchange = this.getSelectedExchange(model, symbol);

    $(".select-symbol").removeClass("active");
    $__("#select-symbol-", symbol).addClass("active");

    $(".prices-body").addClass("hide");
    $__("#prices-body-", symbol).removeClass("hide");

    this.onExchangeSelected(model, symbol, exchange);
};

QuotesView.prototype.onExchangeSelected = function(model, symbol, exchange) {
    $(".select-exchange").removeClass('custom-nav-selected');
    $(".select-exchange").addClass('custom-nav-not-selected');

    $__("#select-exchange-", symbol, '-', exchange).removeClass('custom-nav-not-selected');
    $__("#select-exchange-", symbol, '-', exchange).removeClass('custom-nav-hover');
    $__("#select-exchange-", symbol, '-', exchange).addClass('custom-nav-selected');

    $(".exchange-details").addClass("hide");
    $__("#", symbol, '-', exchange, '-details').removeClass("hide");

    this.updateExchangeChart(symbol, exchange);
};

QuotesView.prototype.hookPriceLabels = function () {
    var self = this;

    $(".change-price").bind('click', function(event) {
        event.preventDefault();

        $(".change-price").addClass('hide');
        $(".change-percent").removeClass('hide');

        return false;
    });

    $(".change-percent").bind('click', function(event) {
        event.preventDefault();

        $(".change-price").removeClass('hide');
        $(".change-percent").addClass('hide');

        return false;
    });

    $('.change-price, .change-percent').hover(
        function() {
            $(this).addClass('custom-nav-hover');
        },
        function() {
            $(this).removeClass('custom-nav-hover');
        }
    );
};

QuotesView.prototype.hookSelectionButtons = function (model) {
    var self = this;

    $(".select-symbol").bind('click', function(event) {
        event.preventDefault();

        var symbol = $(this).attr("target");
        model.setSelectedSymbol(symbol);
        self.onSymbolSelected(model, symbol);

        self.scrollTo("#main-quotes-prices-column");

        return false;
    });

    $(".select-exchange").bind('click', function(event) {
        event.preventDefault();

        var symbol = self.getSelectedSymbol(model),
            exchange = $(this).attr("target");
        model.setSelectedExchange(symbol, exchange);
        self.onExchangeSelected(model, symbol, exchange);

        self.scrollTo("#main-quotes-details-column");

        return false;
    });

    $('.select-exchange').hover(
        function() {
            if (!$(this).hasClass('custom-nav-selected')) {
                $(this).removeClass('custom-nav-not-selected');
                $(this).addClass('custom-nav-hover');
            }
        },
        function() {
            $(this).removeClass('custom-nav-hover');

            if (!$(this).hasClass('custom-nav-selected')) {
                $(this).addClass('custom-nav-not-selected');
            }
        }
    );
};

QuotesView.prototype.restoreSelectionStatus = function (model) {
    var symbol = model.getSelectedSymbol() || this.symbol_list[0];
    this.onSymbolSelected(model, symbol);
};

QuotesView.prototype.scrollTo = function (target) {
    $('html, body').animate({
        scrollTop: $(target).offset().top - 50 // account for the fixed top navbar
    }, 1000);
};

QuotesView.prototype.renderSymbolPricesBody = function (symbol, info) {
    return $__(
        '<div class="row">',
        '  <div class="hide prices-body" ',
        '       id="prices-body-', symbol, '">',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderSymbolDetailsBody = function (symbol, info) {
    return $__(
        '<div class="row">',
        '  <div id="details-body-', symbol, '">',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderSymbolNav = function (symbol, info) {
    return $__(
        '<li role="presentation" ',
        '    target="', symbol, '" ',
        '    class="select-symbol" ',
        '    id="select-symbol-', symbol,'">',
        '  <a>',
        '    <img src="img/symbol/', symbol, '.png" width=32 height=32></img>',
        '    <large>', symbol, '</large> <small>', info.description, '</small>',
        '  </a>',
        '</li>'
    );
};

QuotesView.prototype.renderSymbolNavSep = function () {
    return $__(
        '<li role="presentation" class="separator bottom-separator">',
        '</li>',
        '<li>',
        '</li>'
    );
};

QuotesView.prototype.addSymbol = function (symbol, info) {
    if (!symbol) {
        $__("#main-quotes-symbol-nav-bar").append(this.renderSymbolNavSep());
        return;
    }

    $__("#main-quotes-symbol-nav-bar").append(this.renderSymbolNav(symbol, info));
    $__("#main-quotes-prices-column").append(this.renderSymbolPricesBody(symbol, info));
    $__("#main-quotes-details-column").append(this.renderSymbolDetailsBody(symbol, info));

    var self = this;
    info.exchanges.forEach(function(exchange) {
        self.addExchangeForSymbol(symbol, exchange);
    });
};

QuotesView.prototype.renderExchangePrices = function (symbol, exchange) {
    var base_id = __(symbol, '-', exchange);

    return $__(
        '<div class="row" style="margin-left: 15px; margin-right: 0px">',
        '  <div target="', exchange, '"',
        '       class="col-xs-5 select-exchange custom-nav custom-nav-not-selected"',
        '       id="select-exchange-', symbol, '-', exchange, '">', 
        '    <span style="font-size: xx-small;"> ',
        '       <img src="img/exchange/', exchange, '.ico" ',
        '            width=16 height=16> ', 
        '      <span style="font-size: small">', this.exchanges[exchange].description, '</span>',
        '    </span>',
        '  </div>',
        '  <div style="margin-top: 8px">',
        '    <div class="col-xs-7"',
        '         id="', base_id, '-progress">',
        '      <div class="progress progress-striped active">',
        '        <div class="progress-bar" style="width: 100%">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div class="col-xs-7 hide"',
        '         id="', base_id, '-error">',
        '      <div class="alert alert-danger">',
        '        <strong>Error</strong>',
        '        <span id="', base_id, '-error-msg"></span>',
        '      </div>',
        '    </div>',
        '    <div id="', base_id, '-prices" class="hide" style="text-align: right;">',
        '      <div class="col-xs-7" style="text-align: right; padding-left: 0px;">',
        '        <span class="label label-primary" style="font-size: small"',
        '            id="', base_id, '-ask">',
        '        </span>',
        '        <span class="label label-default hide change-price" style="font-size: small"',
        '            id="', base_id, '-change-price">',
        '        </span>',
        '        <span class="label label-default change-percent" style="font-size: small"',
        '            id="', base_id, '-change-percent">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderExchangeDetails = function (symbol, exchange) {
    var base_id = __(symbol, '-', exchange);

    return $__(
        '<div id="', base_id, '-details" ',
        '     class="hide exchange-details"',
        '     style="margin: 15px;">',
        '  <div id="', base_id, '-details-data">',
        '    <div class="row" style="padding-top: 0px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Buy/Sell:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-details-bid"',
        '              style="font-size: small">',
        '        </span>',
        '        <span class="label label-primary" ',
        '              id="', base_id, '-details-ask"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row" style="padding-top: 7px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Open/Close:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-details-open"',
        '              style="font-size: small">',
        '        </span>',
        '        <span class="label label-primary" ',
        '              id="', base_id, '-details-close"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row" style="padding-top: 7px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Low/High:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-details-low"',
        '              style="font-size: small">',
        '        </span>',
        '        <span class="label label-primary" ',
        '              id="', base_id, '-details-high"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div id="', base_id, '-details-dates" style="padding-top: 15px;">',
        '    <div class="row">',
        '      <div class="col-xs-4" style="font-size: x-small; font-style: italic; text-align: right;">',
        '        <span>',
        '          <strong>Last updated:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="font-size: x-small; font-style: italic; text-align: right; padding-left: 0px;">',
        '        <span id="', base_id, '-last-updated-date">',
        '        </span>',
        '        <span id="', base_id, '-last-updated-ago">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row">',
        '      <div class="col-xs-4" style="font-size: x-small; font-style: italic; text-align: right;">',
        '        <span>',
        '          <strong>Last change:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="font-size: x-small; font-style: italic; text-align: right; padding-left: 0px;">',
        '        <span id="', base_id, '-last-change-date">',
        '        </span>',
        '        <span id="', base_id, '-last-change-ago">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row" style="margin-left: 0px">',
        '    <h4>Chart</h4>',
        '    <hr>',
        '  </div>',
        '  <div class="row" style="margin: 0px">',
        '    <div class="price-chart" id="', base_id, '-chart"></div>',
        '    <hr></hr>',
        '  </div>',
        '</div>'
    );  
};

QuotesView.prototype.renderExchangeChart = function (symbol, exchange) {
    var self = this,
        selector = __('#', symbol, '-', exchange, '-chart');

    $(selector).highcharts('StockChart', {
        chart: {
            type: 'candlestick',
            zoomType: 'x'
        },
        rangeSelector : {
            buttons: [
                {type: 'day', count: 1, text: '1d'},
                {type: 'week', count: 1, text: '1w'},
                {type: 'month', count: 1, text: '1m'},
                {type: 'year', count: 1, text: '1y'},
                {type: 'all', text: 'All'}
            ],
            inputEnabled: false, // it supports only days
            selected : 4 // all
        },
        title : {
            text : __(self.exchanges[exchange].description, '/', symbol)
        },
        subtitle : {
            text : __('<a href="', self.exchanges[exchange].link, '" target="_blank">(Source)</a>')
        },
        xAxis: {
            type: 'datetime',
            minRange: 3600 * 1000, // one hour
            title: {
                text: 'Date'
            }
        },
        series : [
            {
                name : 'Price',
                data: [],
                tooltip: {
                    valueDecimals: 2,
                    valuePrefix: self.symbols[symbol].prefix,
                }
            },
        ]
    });

    return $(selector).highcharts();
};

QuotesView.prototype.addExchangeForSymbol = function (symbol, exchange) {
    $__('#prices-body-', symbol).append(
        this.renderExchangePrices(symbol, exchange)
    );

    $__('#details-body-', symbol).append(
        this.renderExchangeDetails(symbol, exchange)
    );
};

QuotesView.prototype.renderPrice = function (price, prev) {
    var selector_base = __("#", price.symbol, "-", price.exchange),
        prices_selector = __(selector_base, "-prices"),
        ask_selector = __(selector_base, "-ask"),
        change_price_selector = __(selector_base, "-change-price"),
        change_percent_selector = __(selector_base, "-change-percent"),
        error_selector = __(selector_base, "-error"),
        progress_selector = __(selector_base, "-progress");

    $(ask_selector).html(__(
        this.symbols[price.symbol].prefix,
        price.ask ? price.ask.toFixed(2) : "N/A"
    ));

    var change_price = price.stats.daily.ask.close - price.stats.daily.ask.open,
        change_percent = change_price / price.stats.daily.ask.open * 100;

    $(change_price_selector).html(
        __(change_price > 0 ? '+' : '', change_price.toFixed(2))
    );

    $(change_percent_selector).html(
        __(change_percent > 0 ? '+' : '', change_percent.toFixed(2), '%')
    );

    if (!prev || prev.bid != price.bid || prev.ask != price.ask) {
        $(ask_selector).effect("highlight");
        $(change_price_selector).effect("highlight");
        $(change_percent_selector).effect("highlight");
    }

    $(prices_selector).removeClass("hide");
    $(error_selector).addClass("hide");
    $(progress_selector).addClass("hide");
};

QuotesView.prototype.updateLabelsColors = function (price, prev) {
    var selector_base = __("#", price.symbol, "-", price.exchange),
        change_price_selector = __(selector_base, "-change-price"),
        change_percent_selector = __(selector_base, "-change-percent");

    var set_label_class = function(selector, label_class) {
        $(selector)
            .removeClass(__("label-info ",
                            "label-primary ",
                            "label-danger ",
                            "label-success ",
                            "label-default"))
            .addClass(__("label-", label_class));
    };

    var change = price.stats.daily.ask.close - price.stats.daily.ask.open;

    if (change > 0) {
        set_label_class(change_price_selector, "success");
        set_label_class(change_percent_selector, "success");
    } else if (change < 0) {
        set_label_class(change_price_selector, "danger");
        set_label_class(change_percent_selector, "danger");
    } else {
        set_label_class(change_price_selector, "default");
        set_label_class(change_percent_selector, "default");
    }
};

QuotesView.prototype.renderDetails = function (price) {
    var selector_base = __("#", price.symbol, "-", price.exchange),
        details_bid_selector = __(selector_base, "-details-bid"),
        details_ask_selector = __(selector_base, "-details-ask"),
        details_open_selector = __(selector_base, "-details-open"),
        details_close_selector = __(selector_base, "-details-close"),
        details_low_selector = __(selector_base, "-details-low"),
        details_high_selector = __(selector_base, "-details-high"),
        last_updated_date_selector = __(selector_base, "-last-updated-date"),
        last_updated_ago_selector = __(selector_base, "-last-updated-ago"),
        last_change_date_selector = __(selector_base, "-last-change-date"),
        last_change_ago_selector = __(selector_base, "-last-change-ago");

    var updated_on = (new Date(price.updated_on)).toLocaleString(),
        last_change = (new Date(price.stats.last_change)).toLocaleString(),
        symbol_prefix = this.symbols[price.symbol].prefix;

    $(last_updated_date_selector).html(updated_on);
    $(last_change_date_selector).html(last_change);

    $(details_bid_selector).html(price.bid ? __(symbol_prefix, price.bid.toFixed(2)) : "N/A");
    $(details_ask_selector).html(price.ask ? __(symbol_prefix, price.ask.toFixed(2)) : "N/A");
    $(details_open_selector).html(__(symbol_prefix, price.stats.daily.ask.open.toFixed(2)));
    $(details_close_selector).html(__(symbol_prefix, price.stats.daily.ask.close.toFixed(2)));
    $(details_low_selector).html(__(symbol_prefix, price.stats.daily.ask.low.toFixed(2)));
    $(details_high_selector).html(__(symbol_prefix, price.stats.daily.ask.high.toFixed(2)));
};

QuotesView.prototype.renderCustomFields = function (price) {
    var selector_base = __("#", price.symbol, "-", price.exchange);

    var render_func = {
        published_on: function (value) {},
        volume24: function (value) {
            $__(selector_base, '-volume24-value').html(
                __(value.toFixed(2), ' BTC')
            );
        },
        low24: function (value) {},
        high24: function (value) {}
    };

    for (var field in price.custom) {
        render_func[field](price.custom[field]);
    }
};

QuotesView.prototype.addCustomFields = function (price) {
    var selector_base = __("#", price.symbol, "-", price.exchange);

    for (var field in price.custom) {
        var custom_selector = __(selector_base, "-", field);
        if (!$(custom_selector).length) {
            $__(selector_base, '-details-data').append(
                this.addCustomField(price.symbol, price.exchange, field)
            );
        }
    }
};

QuotesView.prototype.addCustomField = function (symbol, exchange, field) {
    var base_id = __(symbol, '-', exchange);

    var field_desc = {
        volume24: 'Volume:',
    };

    var field_body = {
        volume24: __(
            '<div class="col-xs-8" style="text-align: right;">',
            '  <span class="label label-warning" ',
            '        id="', base_id, '-volume24-value"',
            '        style="font-size: small">',
            '  </span>',
            '</div>'
        ),
    };

    if (!(field in field_body))
        return '';

    return $__(
        '<div class="row" id="', base_id, '-', field, '" style="padding-top: 7px;">',
        '  <div class="col-xs-4" style="text-align: right;">',
        '    <span style="font-size: small;">',
        '      <strong>', field_desc[field], '</strong>',
        '    </span>',
        '  </div>',
        '  <div>', field_body[field], '</div>',
        '</div>'
    );
};

QuotesView.prototype.renderPriceError = function (error) {
    var selector_base = __("#", error.info.symbol, "-", error.info.exchange),
        prices_selector = __(selector_base, "-prices"),
        error_selector = __(selector_base, "-error"),
        error_msg_selector = __(selector_base, "-error-msg"),
        progress_selector = __(selector_base, "-progress");

    $(error_msg_selector).html(error.message);

    $(error_selector).removeClass("hide");
    $(prices_selector).addClass("hide");
    $(progress_selector).addClass("hide");
};

QuotesView.prototype.renderGenericError = function (error) {
    $("#global-error").removeClass("hide");
    $("#global-error-msgs").empty();
    $("#global-error-msgs").append($__(
        "<li>", error.message, "</li>"
    ));
};

QuotesView.prototype.clearGenericError = function () {
    $("#global-error").addClass("hide");
    $("#global-error-msgs").empty();
};

QuotesView.prototype.timedelta = function(last_update) {
    var delta = ((new Date()) - last_update) / 1000,
        frames = {},
        ret = '';

    frames.minute = {seconds: 60, suffix: 'm'};
    frames.hour = {seconds: frames.minute.seconds * 60, suffix: 'h'};
    frames.day = {seconds: frames.hour.seconds * 24, suffix: 'd'};
    frames.week = {seconds: frames.day.seconds * 7, suffix: 'w'};

    ['week', 'day', 'hour', 'minute'].forEach(function (frame) {
        if (delta >= frames[frame].seconds) {
            var units = Math.floor(delta / frames[frame].seconds);
            ret += units + frames[frame].suffix + ' ';
            delta = delta % frames[frame].seconds;
        }
    });

    return ret + delta.toFixed(2) + 's';
};

QuotesView.prototype.updateGlobalTimer = function (last_update) {
    $("#quotes-updated-ago").html(this.timedelta(last_update));
};

QuotesView.prototype.updateQuoteTimer = function (quote) {
    var selector_base = __("#", quote.symbol, "-", quote.exchange);

    $__(selector_base, "-last-updated-ago").html(
        __('(', this.timedelta(new Date(quote.updated_on)), ' ago)')
    );

    $__(selector_base, "-last-change-ago").html(
        __('(', this.timedelta(new Date(quote.stats.last_change)), ' ago)')
    );
};

function QuotesModel() {
    this.quotes = {};
    this.selected = undefined;
}

QuotesModel.prototype.save = function () {
    localStorage["quotes.selected"] = JSON.stringify(this.selected);
};

QuotesModel.prototype.load = function () {
    this.selected = JSON.parse(localStorage["quotes.selected"] || null) || {
        symbol: null,
        exchange: {}
    };
};

QuotesModel.prototype.getSelectedSymbol = function () {
    return this.selected.symbol;
};

QuotesModel.prototype.getSelectedExchange = function (symbol) {
    return this.selected.exchange[symbol];
};

QuotesModel.prototype.setSelectedSymbol = function (symbol) {
    this.selected.symbol = symbol;
    this.save();
};

QuotesModel.prototype.setSelectedExchange = function (symbol, exchange) {
    this.selected.exchange[symbol] = exchange;
    this.save();
};

QuotesModel.prototype.updateQuote = function(quote) {
    if (!(quote.symbol in this.quotes))
        this.quotes[quote.symbol] = {};

    var prev = this.quotes[quote.symbol][quote.exchange];
    this.quotes[quote.symbol][quote.exchange] = quote;
    return prev;
};

QuotesModel.prototype.getQuote = function(symbol, exchange) {
    if (!(symbol in this.quotes))
        return;

    if (!(exchange in this.quotes[symbol]))
        return;
    
    return this.quotes[symbol][exchange];
};

function QuotesController(view, model) {
    this.view = view;
    this.model = model;
    this.updated_on = new Date();
    this.watchdog();
}

QuotesController.prototype.start = function () {
    this.model.load();
    this.view.render();
    this.view.hookPriceLabels(this.model);
    this.view.hookSelectionButtons(this.model);
    this.view.restoreSelectionStatus(this.model);
};

QuotesController.prototype.onPriceUpdated = function (price) {
    var prev;

    this.updated_on = new Date();
    prev = this.model.updateQuote(price);
    this.view.addCustomFields(price);
    this.view.updateLabelsColors(price, prev);
    this.view.renderPrice(price, prev);
    this.view.renderDetails(price);
    this.view.renderCustomFields(price);
    this.view.updateQuoteTimer(price);
};

QuotesController.prototype.onConnect = function (error) {
    this.view.clearGenericError();
};

QuotesController.prototype.onError = function (error) {
    if (!error.info || !error.info.exchange || !error.info.symbol) {
        this.view.renderGenericError(error);
    } else {
        this.view.renderPriceError(error);
    }
};

QuotesController.prototype.watchdog = function () {
    this.view.updateGlobalTimer(this.updated_on);

    for (var symbol in this.model.quotes) {
        for (var exchange in this.model.quotes[symbol]) {
            var quote = this.model.getQuote(symbol, exchange);
            this.view.updateQuoteTimer(quote);
        }
    }

    setTimeout(this.watchdog.bind(this), 1000);
};

QuotesController.prototype.getQuote = function (symbol, exchange) {
    return this.model.getQuote(symbol, exchange);
};

QuotesController.prototype.getExchanges = function (symbol) {
    return this.view.symbols[symbol].exchanges;
};

QuotesController.prototype.getExchangeDescription = function (exchange) {
    return this.view.exchanges[exchange].description;
};

function GlobalView() {}

GlobalView.prototype.setWindowTitle = function (title) {
    document.title = title;
};

function GlobalController(view) {
    this.view = view;
}

GlobalController.prototype.start = function() {
};

function init_app () {
    global_view = new GlobalView();
    global_controller = new GlobalController(global_view);

    quotes_view = new QuotesView();
    quotes_model = new QuotesModel();
    quotes_controller = new QuotesController(quotes_view, quotes_model);

    global_controller.start();
    quotes_controller.start();
}

function init_client () {
    var url = location.origin.replace(/^http/, 'ws');

    var wsclient = new WSClient(url);

    wsclient.addHandler("onConnect", function() {
        quotes_controller.onConnect();
        this.requestExchanges();
    });

    wsclient.addHandler("onDisconnect", function() {
        quotes_controller.onError({message:'Disconnected'});
    });

    wsclient.addHandler("onExchangesListReceived", function(exchanges) {
        this.requestPrices(exchanges);
    });

    wsclient.addHandler("onPriceUpdated", function(price) {
        quotes_controller.onPriceUpdated(price);
    });

    wsclient.addHandler("onError", function (error) {
        quotes_controller.onError(error);
    });

    wsclient.start();
}

$(document).ready(function() {
    init_app();
    init_client();
});