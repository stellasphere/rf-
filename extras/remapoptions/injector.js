var s = document.createElement('script');
s.src = chrome.runtime.getURL('extras/remapoptions/script.js');
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
console.log("Script injected",s.src)

async function setSync(key,value) {
  return new Promise((resolve,reject)=>{
    chrome.storage.sync.set({key: value},()=>{
      resolve()
    })
  })
}

async function getSync(key) {
  return new Promise((resolve,reject)=>{
    chrome.storage.sync.get(key,(data)=>{
      resolve(data)
    })
  })
} 