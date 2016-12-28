function loadContentScriptInAllTabs() {
  chrome.windows.getAll({'populate': true}, function(windows) {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        chrome.tabs.executeScript(
            tabId,
            {file: 'window_side_script.js', allFrames: true});
          }); 
          
  });
}
