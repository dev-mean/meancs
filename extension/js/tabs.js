function loadContentScriptInAllTabs() {
  chrome.windows.getAll({'populate': true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        chrome.tabs.executeScript(
            tabs[j].id,
            {file: './window_side_script.js', allFrames: true});
      }
    }
  });
}
//chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//        chrome.tabs.executeScript(
//            tabId,
//            {file: 'window_side_script.js', allFrames: true});
//          }); 