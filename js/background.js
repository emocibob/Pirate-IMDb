// Track tabs updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "tab_updated"});
    });
});