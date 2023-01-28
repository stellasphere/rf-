console.log("Remap Options")
window.applyremapoptions = setInterval(checkAndApplyRemapOptions,500);
window.appliedremapoptions = false
function checkAndApplyRemapOptions() {
    if(window.appliedremapoptions) {
      clearInterval(window.applyremapoptions)
      return
    }
    var signal = document.querySelector(".remap")
    if(signal) {
      console.log("Signal activated")
      window.appliedremapoptions = true
      clearInterval(window.applyremapoptions)
      remapOptions()
    }
}


async function remapOptions() {
  var remap = document.querySelector(".remap")
  
  var actions = document.createElement("div")
  remap.appendChild(actions)
  actions.classList.add("settings-actions")
  actions.innerHTML = `
  <h3>Include/Exclude</h3>
  <p>You can include, exclude or toggle the inclusion of all your classes at once.</p>
  <div class="actions">
      <a onclick="includeAll()">Include All</a>
      <a onclick="excludeAll()">Exclude All</a>
      <a onclick="toggleAll()">Toggle (Flip) All</a>
  </div>
  <h3>Rename (Override)</h3>
  <p>Quickly rename all your classes, or rename the ones that are empty/not empty. Find and replace on your class name overrides.</p>
  <div class="actions">
      <input type="text" id="changeto" placeholder="Rename All To">
      <a onclick="changeAll()">Change All</a>
      <a onclick="changeEmpty()">Change Empty</a>
      <a onclick="changeNotEmpty()">Change Not Empty</a>
  </div>
  <div class="actions">
      <input type="text" id="find" placeholder="Find (Regex Enabled)">
      <input type="text" id="replace" placeholder="Replace With">
      <a onclick="findReplace()">Replace</a>
  </div>
  <h3>Save Configuration</h3>
  <p>Want to create datasets with different remap settings? Load in a one you save before or save this one for later.</p>
  <div class="actions">
      <select id="configselect" placeholder="No Saved Configs">
      </select>
      <a onclick="loadSavedConfig()">Load Saved Config</a>
  </div>
  <div class="actions">
      <input type="text" id="configname" placeholder="Name Your Current Configuration">
      <a onclick="saveConfig()">Save Current Config As</a>
  </div>
  `
  actions.querySelectorAll("button").forEach(e=>{
      e.parentNode.replaceChild(e.cloneNode(true), e);
  })

  updateSavedConfigs()

  remap.scrollTop=-100000
}



function includeAll() {
    document.querySelectorAll('.remap input[type="checkbox"]').forEach(el=>{el.checked=true})
}
function excludeAll() {
    document.querySelectorAll('.remap input[type="checkbox"]').forEach(el=>{el.checked=false})
}
function toggleAll() {
    document.querySelectorAll('.remap input[type="checkbox"]').forEach(el=>{el.checked=!el.checked})
}
function changeAll() {
    var changeto = document.querySelector("#changeto").value
    document.querySelectorAll('.remap tr').forEach(el=>{
        var name = el.getAttribute("data-class")
        if(!name) return
        var override = el.querySelector('input[type="text"]').value
        el.querySelector('input[type="text"]').value = changeto
    })
}
function changeEmpty() {
    var changeto = document.querySelector("#changeto").value
    document.querySelectorAll('.remap tr').forEach(el=>{
        var name = el.getAttribute("data-class")
        if(!name) return
        var override = el.querySelector('input[type="text"]').value
        if(override !== "") return
        el.querySelector('input[type="text"]').value = changeto
    })
}
function changeNotEmpty() {
    var changeto = document.querySelector("#changeto").value
    document.querySelectorAll('.remap tr').forEach(el=>{
        var name = el.getAttribute("data-class")
        if(!name) return
        var override = el.querySelector('input[type="text"]').value
        if(override == "") return
        el.querySelector('input[type="text"]').value = changeto
    })
}
function findReplace() {
    var find = document.querySelector("#find").value
    var regex
    try {
        var testregex = new RegExp(find.match(/\/(.*?)\//)[1])
        testregex.test("")
        regex = testregex
    } catch(e) {console.log("Not a regex",e)}
    var replace = document.querySelector("#replace").value
    document.querySelectorAll('.remap tr').forEach(el=>{
        var name = el.getAttribute("data-class")
        if(!name) return
        var override = el.querySelector('input[type="text"]').value
        if(override !== find) {
            if(regex) {
                if(!regex.test(override)) return
            } else return
        }
        el.querySelector('input[type="text"]').value = replace
    })
}
function saveConfig() {
    var savename = encodeURI(document.querySelector("#configname").value)
    if(savename == "") return alert("No name entered for saving the configuration")
    var settings = {}
    document.querySelectorAll('.remap tr').forEach(el=>{
        var name = el.getAttribute("data-class")
        if(!name) return
        var include = el.querySelector('input[type="checkbox"]').checked
        var remap = el.querySelector('input[type="text"]').value
        settings[name] = {name,include,remap}
    })
    console.log("saving config",`remapconfig-${savename}`,settings)
    localStorage.setItem(`rf++remapconfig-${savename}`,JSON.stringify(settings))
    updateSavedConfigs()
    document.querySelector("#configname").value = ""
}
function getAllConfigs() {
    var keys = {}
    Object.entries(localStorage).forEach(arr=>{
        var [key, value] = arr
        if(!key.startsWith("rf++remapconfig-")) return
        key=key.replace("rf++remapconfig-","")
        try {keys[key]=JSON.parse(value)} catch(e){console.error("getting all configs error",e,key)}
    })
    return keys
}
function updateSavedConfigs() {
    var configs = getAllConfigs()
    var configselector = document.querySelector("#configselect")
    if(configselector.options) Array.from(configselector.options).forEach(o=>{o.remove()})
    for(var name in configs) {
        var option = document.createElement("option")
        option.value = name
        option.innerText = decodeURI(name)
        configselector.appendChild(option)
    }
}
function loadSavedConfig() {
    var configs = getAllConfigs()
    var configselector = document.querySelector("#configselect")

    var selectedconfigid = configselector.value
    var selectedconfig = configs[selectedconfigid]

    document.querySelectorAll('.remap tr').forEach(el=>{
        var name = el.getAttribute("data-class")
        if(!name) return
        if(!selectedconfig[name]) return
        el.querySelector('input[type="checkbox"]').checked = selectedconfig[name].include
        el.querySelector('input[type="text"]').value = selectedconfig[name].remap
    })
}


var remapcss = `
.remap {
    flex-direction: column-reverse !important;
    justify-content: unset !important;
}

.settings-actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 20px;
}

.settings-actions > h3 {
    font-size: 12px;
    font-weight: bold;
    margin: 0;
    margin-top: 15px;
}

.settings-actions > p {
    margin: 0;
}

.actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.actions > a {
    background-color: #5e6dc6;
    border: 1px solid #4f5dba;
    border-radius: 4px;
    color: #fff !important;
    cursor: pointer;
    display: inline-block;
    font-size: .9em;
    overflow: hidden;
    padding: 6px 15px 7px;
    position: relative;
}

.actions > input[type="text"], .actions > select {
    padding: 3px;
    width: 250px;
    max-width: 35%;
}
`;
var style = document.createElement("style");
style.textContent = remapcss;
document.head.appendChild(style);