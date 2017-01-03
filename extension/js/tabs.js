function loadContentScriptInAllTabs() {
    chrome.tabs.onUpdated.addListener(function(details) {
        chrome.tabs.executeScript(
            details.tabId, { file: 'window_side_script.js', allFrames: true });
    });
}