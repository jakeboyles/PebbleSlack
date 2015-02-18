var StrapKit = require('strapkit');

var MYTOKEN = '';



var parseFeed = function(data, quantity) {
    var items = [];
    for (var i = 0; i < quantity; i++) {
        // Always upper case the description string
        var channels = data.channels[i];

        // Add to menu items array
        items.push({
            title:  channels.name,
            data: data.channels[i],
        });
    }

    // Finally return whole array
    return items;
};


var parseFeed2 = function(data, quantity) {
    var items = [];
    for (var i = 0; i < quantity; i++) {
        // Always upper case the description string
        var title = data.messages[i];

        // Add to menu items array
        items.push({
            title: title.text,
            data: data.messages[i],
        });
    }

    // Finally return whole array
    return items;
};

var formatDateTime = function(date) { // This is to display 12 hour format like you asked
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};

var app_id = "RhLqA7DmqpsS6pisd";

StrapKit.Metrics.Init(app_id);

// Show splash screen while waiting for data
var splashPage = StrapKit.UI.Page();

// Text element to inform user
var card = StrapKit.UI.TextView({
    position: 'center',
    text: 'Loading data now...'
});

// Add to splashPage and show
splashPage.addView(card);
splashPage.show();

StrapKit.Metrics.logEvent("/show/splashPage");


// Make request to slack
StrapKit.HttpClient({
        url: 'https://slack.com/api/channels.list?token='+MYTOKEN+'&pretty=1',
        type: 'json',
    },
    function(data) {

        var menuItems = parseFeed(data, 10);

        StrapKit.Metrics.logEvent("/httpClient/success", menuItems);

        var resultsPage = StrapKit.UI.Page();
        // Construct Menu to show to user
        var resultsMenu = StrapKit.UI.ListView({
            items: menuItems
        });


        // Add an action for SELECT
        resultsMenu.setOnItemClick(function(e) {
        StrapKit.Metrics.logEvent(JSON.stringify(e.item));

        StrapKit.HttpClient({
        url: 'https://slack.com/api/channels.history?token='+MYTOKEN+'&channel='+e.item.data.id+'&pretty=1',
        type: 'json',
        },
        function(data2) {

            StrapKit.Metrics.logEvent(JSON.stringify(data2));

            var menuItems2 = parseFeed2(data2, 10);

            var detailPage = StrapKit.UI.Page();

            // Construct Menu to show to user
            var detailMenu = StrapKit.UI.ListView({
                items: menuItems2
            });

            detailPage.addView(detailMenu);
            detailPage.show();


            detailMenu.setOnItemClick(function(e) {
                StrapKit.Metrics.logEvent(JSON.stringify(e.item));
                var forecast = e.item.data;
                var content = forecast.text;

                var singlePage = StrapKit.UI.Page();
                // Create the Card for detailed view
                var singleCard = StrapKit.UI.Card({
                body: content,
                });
                singlePage.addView(singleCard);
                singlePage.show();

            });

            StrapKit.Metrics.logEvent("show/detailPage", e.item.data);
        });
    });


                // Show the Menu, hide the splash
        resultsPage.addView(resultsMenu);
        resultsPage.show();

        StrapKit.Metrics.logEvent("show/resultsPage");

},
    function(error) {
        console.log(error);
    }
);
