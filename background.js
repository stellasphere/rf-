chrome.webNavigation.onHistoryStateUpdated.addListener(newPage);
chrome.webNavigation.onCommitted.addListener(newPage);

function newPage(data) {
  console.groupCollapsed("urlchanged");
  console.log("data:",data)
  var newURL = data.url

  for(i in extras) {
    var extra = extras[i]
    console.log("checking extra:",extra)
    
    var match = false
    if(extra.match.urlregex) {
      console.log("checking url regex:",newURL.match(extra.match.urlregex),newURL,extra.match.urlregex)
      if(newURL.match(extra.match.urlregex)) match = true
      else continue
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
  console.groupEnd("urlchanged",);
}

var extras = {
  annotationsettings: {
    name: "Annotation Settings",
    folder: "annotationsettings",
    script: "injector.js",
    match: {
      urlregex: /^https?:\/\/app\.roboflow\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\/images\/([a-zA-Z0-9-]+)(?:\?.+)?$/
    }
  },
  remapoptions: {
    name: "Remap Options",
    folder: "remapoptions",
    script: "injector.js",
    match: {
      urlregex: /^https?:\/\/app\.roboflow\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\/generate\/preprocessing\/remap\/edit(?:\?.+)?$/
    }
  }
}