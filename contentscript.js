if(!window.injectedContentScript) {
    window.injectedContentScript = true;
    
    console.log("Content Script Injected")

    var clickedelement = null
    document.addEventListener("contextmenu", function(event){
        var clickedElement = event.target || event.srcElement
        console.log("Updating Clicked Element:",clickedElement,clickedElement.src)
        clickedelement = clickedElement.src;
    }, true);
    
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("Received message:", request, clickedelement)
        if (request.action === "getClickedImage") {
            getImageData(clickedelement, sendResponse);
            return true
        }
    });
      
    
    function getImageData(src, sendResponse) {
        var name = src
        fetch(src)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob); 
          reader.onloadend = () => {
            const dataurl = reader.result;
            console.log("dataurl:",dataurl);
            const base64 = dataurl.replace(/^data:image\/?[A-z]*;base64,/,"")
            sendResponse({ name, dataurl, base64 });
          }
        });
    }
}
