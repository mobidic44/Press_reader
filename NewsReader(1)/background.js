chrome.commands.onCommand.addListener(function (command) {

    if (command == "_execute_action")
    {
        chrome.storage.sync.get({
            appEnabled: true
        }, function (items) {
            chrome.storage.sync.set({
                appEnabled: !items.appEnabled
            }, function () {

            })
        });
    }

});