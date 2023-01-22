console.log("Annotation Settings")
window.applyannotationsettings = setInterval(checkAndApplyAnnotationSettings,500);
window.appliedannotationsettings = false
function checkAndApplyAnnotationSettings() {
    if(window.appliedannotationsettings) {
      clearInterval(window.applyannotationsettings)
      return
    }
    var signal = document.querySelector("#tools")
    if(signal) {
        console.log("Signal activated")
        window.appliedannotationsettings = true
        clearInterval(window.applyannotationsettings)
        annotationSettings()
    }
}


async function annotationSettings() {
  function injectScript(src) {
    var script = document.createElement("script")
    script.src = src
    document.head.appendChild(script)
    return new Promise((resolve,reject)=>{
      script.onload = resolve
    })
  }
  await injectScript("https://unpkg.com/popper.js@1")
  await injectScript("https://unpkg.com/tippy.js@5/dist/tippy.iife.js")

  
  var toolbar = document.querySelector("#tools")
  
  var divider = document.createElement("div")
  divider.classList.add("divider")
  toolbar.appendChild(divider)
  
  if(document.getElementById("settingsButton")) document.getElementById("settingsButton").remove()
  var settings = document.createElement("div")
  toolbar.appendChild(settings)
  settings.id = "settingsButton"
  settings.classList.add("tool","toolTip")
  settings.innerHTML = `
  <i class="far fa-ellipsis-v"></i>
  <div class="settings" style="display: none;">
      <div class="text">
          <h3 class="settings-heading title">Annotate Settings</h3>
          <p class="settings-description description">Customize your annotation experience.</p>
          <div class="settings-options">
          </div>
          <p class="settings-note description">Note: These changes only apply to the visual appearance of your images when you are annotating them. It doesn't change any of the images themselves.</p>
      </div>
  </div>
  `
  var options = [{"type":"brightness","label":"Brightness","min":0,"default":100,"max":200,"step":1},{"type":"contrast","label":"Contrast","min":0,"default":100,"max":200,"step":1},{"type":"grayscale","label":"Grayscale","min":0,"default":0,"max":100,"step":1},{"type":"invert","label":"Invert","min":0,"default":0,"max":100,"step":33.3},{"type":"opacity","label":"Opacity","min":0,"default":100,"max":100,"step":1},{"type":"saturate","label":"Saturate","min":0,"default":100,"max":200,"step":1}]
  var optionSettings = settings.querySelector(".settings-options")
  for(var option of options) {
    var optionElement = document.createElement("div")
    optionElement.classList.add("settings-option")
    optionElement.dataset.optiontype = option.type
    optionElement.innerHTML = `
    <span class="option-name">${option.label}:</span>
    <input type="range" min="${option.min}" max="${option.max}" value="${option.default}" step="${option.step}" class="option-slider">
    `
    var optionSlider = optionElement.querySelector(".option-slider")
    optionSlider.onchange = updateImage
    optionSettings.appendChild(optionElement)
  }
  function updateImage() {
      var optionElements = document.querySelectorAll(".settings-option")
      var cssFilters = Array.from(optionElements).map(optionElement=>{
          var optionSlider = optionElement.querySelector(".option-slider")
          localStorage.setItem(`annotate-option-${optionElement.dataset.optiontype}`,optionSlider.value)
          return `${optionElement.dataset.optiontype}(${optionSlider.value}%)`
      })
      var cssFilter = cssFilters.join(" ")
      document.querySelector(".annotation").style.filter = cssFilter
  }
  
  // SET OLD SETTINGS
  var optionElements = document.querySelectorAll(".settings-option")
  Array.from(optionElements).forEach(optionElement=>{
      var optionSlider = optionElement.querySelector(".option-slider")
      var saved = localStorage.getItem(`annotate-option-${optionElement.dataset.optiontype}`)
      if(saved) {
          optionSlider.value = saved
          updateImage()
      }
  })


  window.settingstippy = window.tippy(settings, {
    content: settings.querySelector(".settings").querySelector(".text"),
    allowHTML: true,
    placement: 'left',
    appendTo: 'parent',
    interactive: true
  })

  
  
  const css = `
  .settings {
      position: absolute;
      width: 300px;
  }
  
  .settings-heading {
      margin: 0;
      line-height: 1;
  }
  
  .settings-options {
      display: flex;
      flex-direction: column;
      gap: 5px;
  }
  
  .settings-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  
  .option-name {
      font-size: 10px;
  }
  
  .option-slider {
      -webkit-appearance: none;
      margin: 0;
      max-width: 75%;
      height: 5px;
      border-radius: 1rem;
      background: #d3d3d3;
  }
  
  .option-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12.5px;
    height: 12.5px;
    border-radius: 1rem;
    background-color: rgba(131,21,249);
    cursor: pointer;
  }
  
  .option-slider::-moz-range-thumb {
    width: 12.5px;
    height: 12.5px;
    border-radius: 1rem;
    background-color: rgba(131,21,249);
    cursor: pointer;
  }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}