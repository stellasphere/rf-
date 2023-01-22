chrome.webNavigation.onHistoryStateUpdated.addListener(newPage);
chrome.webNavigation.onCommitted.addListener(newPage);

function newPage(data) {
  console.log("URL changed to: " + data.url);
}