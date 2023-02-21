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
        chrome.scripting.executeScript({target:{tabId:data.tabId}, files:[scriptFilePath]});
      }
    }
  }
  console.groupEnd("urlchanged",);
}


addContextMenus()
async function addContextMenus() {
  chrome.contextMenus.removeAll()
  var rfapikey = await getSync("rfapikey")
  var projectid = await getSync("rfprojectid")
  var versionid = await getSync("rfversionid")
  console.log("Adding Context Menus",rfapikey,projectid)
  
  if(!rfapikey) chrome.contextMenus.create({
    id: "apikeymissing",
    title: "Missing Roboflow API key (Click for info)",
    contexts: ["all"]
  })
  if(!projectid) chrome.contextMenus.create({
    id: "projectmissing",
    title: "Project Not Selected (Click for info)",
    contexts: ["all"]
  })
  if(rfapikey&&projectid) chrome.contextMenus.create({
    id: "addimage",
    title: `Add this image to your project (${projectid})`,
    contexts: ["image"]
  })
  if(rfapikey&&projectid&&versionid) chrome.contextMenus.create({
    id: "inferimage",
    title: `Infer on this image with ${versionid}`,
    contexts: ["image"]
  })

  chrome.contextMenus.onClicked.addListener(async function(clickdata,tab){
    var type = clickdata.menuItemId

    if(type == "apikeymissing") runFunction(()=>{
      alert("You can add your Roboflow API key in the options for RF++. Click the RF++ icon in your browser bar and under options, enter in your Roboflow API key.\n\nTo get your Roboflow API key, go to your projects page on roboflow.com and click on the settings icon in the upper right corner. Click on Roboflow API and copy the Private API Key.")
    },tab.id)
    if(type == "projectmissing") runFunction(()=>{
      alert("Pick a project in the RF++ options. Click the RF++ icon in your browser bar and under options select your project. You might need to set up your Roboflow API key first though.")
    },tab.id)
    if(type == "addimage") {
      var image = await new Promise((resolve,reject)=>{
        chrome.tabs.sendMessage(tab.id, {action: "getClickedImage"}, (response) => {
          console.log("Clicked Image:",response)
          if(!response) return reject("No image found")
          resolve(response)
        })
      })

      if((!image) || (!image.base64)) return runFunction(()=>{
        alert("The image selected is not able to be uploaded.")
      },tab.id)

      var rfrequrl = new URL(`https://api.roboflow.com/dataset/${encodeURI("test-woenr")}/upload`)
      rfrequrl.searchParams.set("api_key",rfapikey)
      rfrequrl.searchParams.set("name",image.name)
      rfrequrl.searchParams.set("batch","Uploaded From RF Plus Extension")
      var rfreq = await fetch(rfrequrl.href, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: image.base64
      })
      var rfres = await rfreq.json()
      console.log("RF Upload Response:",rfres)

      if(rfres.success) {
        chrome.action.setBadgeText({text: '\u2713'});
        chrome.action.setBadgeBackgroundColor({color: "green"});
        setTimeout(function() {
          chrome.action.setBadgeText({text: ''});
        }, 5000);
      } else if(rfres.duplicate) {
        chrome.action.setBadgeText({text: 'Copy'});
        chrome.action.setBadgeBackgroundColor({color: "yellow"});
        setTimeout(function() {
          chrome.action.setBadgeText({text: ''});
        }, 5000);
      } else {
        chrome.action.setBadgeText({text: 'Error'});
        chrome.action.setBadgeBackgroundColor({color: "red"});
        setTimeout(function() {
          chrome.action.setBadgeText({text: ''});
        }, 5000);
      }
    }
    if(type == "inferimage") {
      var image = await new Promise((resolve,reject)=>{
        chrome.tabs.sendMessage(tab.id, {action: "getClickedImage"}, (response) => {
          console.log("Clicked Image:",response)
          if(!response) return reject("No image found")
          resolve(response)
        })
      })
      if((!image) || (!image.base64)) return runFunction(()=>{
        alert("The image selected is not able to be uploaded.")
      },tab.id)

      var versionnumber = versionid.split("/")[2]
      var model = versionid.split("/")[1]

      var inferurl = new URL(`https://detect.roboflow.com/`)
      inferurl.searchParams.set("model",model)
      inferurl.searchParams.set("version",versionnumber)
      inferurl.searchParams.set("api_key",rfapikey)
      var popup = await chrome.windows.create({
        tabId: tab.id,
        type: "popup",
        focused: true,
        height: 600,
        width: 850,
        url: inferurl.href
      });
      console.log("Image:",image,popup)


      runFunction((image,popup)=>{
        console.log("RUNNING",image,popup)
        window.addEventListener('load', async (event) => {
          console.log("LOADED",image,popup)

          console.log("image base64:",image.base64)

          var bytecharacters = atob(image.base64);
          var bytenumbers = new Array(bytecharacters.length);
          for (var i = 0; i < bytecharacters.length; i++) {
            bytenumbers[i] = bytecharacters.charCodeAt(i);
          }
          var bytearray = new Uint8Array(bytenumbers);
          var blob = new Blob([bytearray], { type:"image/png"});
          var file = new File([blob], 'RF++.png', { type:"image/png" });
          console.log("file:",file)
          

          var content = document.querySelector(".content")
          var heading = document.createElement("h1")
          heading.innerText = "Infer Clicked Image"
          content.insertBefore(heading, content.childNodes[0])

          document.querySelector("#fileSelectionContainer > label").innerText = "File"
          document.querySelector("#fileName").value = "RF++ Your Clicked Image:"
          document.querySelector("#fileMock").remove()
          var imagepreview = document.createElement("img")
          imagepreview.src = image.dataurl
          imagepreview.style.backgroundColor = "#fff"
          imagepreview.style.height = "40px"
          document.querySelector("#fileSelectionContainer > .flex").appendChild(imagepreview)

          var container = new DataTransfer()
          container.items.add(file)
          document.querySelector("#file").files = container.files
        });
      },popup.tabs[0].id,[image,popup])
      
      addCSS(`
      body {
        font-size: 15px !important;
      }

      h1 {
        font-size: 40px !important;
        font-weight: bold !important;
      }

      .input__label {
        margin-bottom: 0.2rem !important;
      }

      #method {
        display: none !important;
      }

      .header__grid {
        gap: 0.25rem !important;
      }

      .header {
        padding: 1rem !important;
      }

      .content {
        padding: 1rem !important;
      }

      .content__grid {
        padding: 0 !important;
        row-gap: 0.5rem !important;
      }

      a#codepenLink {
        display: none !important;
      }

      .header {
        display: none !important;
      }
      `,popup.tabs[0].id)

    }
  })
}

async function runFunction(func,tabid,args) {
  await chrome.scripting.executeScript({target: {tabId: tabid}, func:func, args:args})
}
async function addCSS(css,tabid) {
  await chrome.scripting.insertCSS({target: {tabId: tabid}, css})
}

async function getSync(key) {
  var data = await chrome.storage.sync.get(key)
  return data[key]
}

async function rfAPI(route,apikey,data) {
  var url = new URL(`https://api.roboflow.com/${route}`)
  url.searchParams.set("api_key", apikey)
  var options = {
    method: data ? "POST" : "GET",
  };
  if (data) {
    options.headers = {
      "Content-Type": "application/json"
    };
    options.body = JSON.stringify(data);
  }
  var req = await fetch(url.href, options)
  var res = await req.json()
  return res
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message:",request.message)
  if(request.message === "updatedOptions") {
    addContextMenus()
  }
});

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