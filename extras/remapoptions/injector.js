var s = document.createElement('script');
s.src = chrome.runtime.getURL('extras/remapoptions/script.js');
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
console.log("Script injected",s.src)