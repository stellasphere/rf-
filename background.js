chrome.webNavigation.onHistoryStateUpdated.addListener(newPage);
chrome.webNavigation.onCommitted.addListener(newPage);

function newPage(data) {
  console.log("URL changed: ",data);
  var newURL = data.url

  for(i in extras) {
    var extra = extras[i]
    
    var match = false
    if(extra.match.urlregex) {
      if(newURL.match(extra.match.urlregex)) match = true
      else return
    }

    if(match) {
      console.log("Extra Matched:",extra)
      if(extra.script) {
        var scriptFilePath = `extras/${extra.folder}/${extra.script}`
        console.log("Executing Script:",scriptFilePath)
        chrome.tabs.executeScript(data.tabId,{file:scriptFilePath});
      }
    }
  }
}

var extras = {}
chrome.storage.local.set({extras})