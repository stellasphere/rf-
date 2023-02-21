console.log(window, document)
window.onload = async function() {
  document.querySelector("#apikeyupdate").addEventListener("click", async function() {
    var apikey = document.querySelector("#apikey").value
    if (apikey == "") return alert("API key empty")
    var saved = await chrome.storage.sync.set({ rfapikey: apikey })
    console.log(saved)
    updateOptions()
  })
  document.querySelector("#projectselectupdate").addEventListener("click", async function() {
    var projectid = document.querySelector("#projectselect").value
    if (projectid == "") return alert("A valid project wasn't selected")
    var saved = await chrome.storage.sync.set({ rfprojectid: projectid })
    console.log(saved)
    updateOptions()
  })
  document.querySelector("#versionselectupdate").addEventListener("click", async function() {
    var versionid = document.querySelector("#versionselect").value
    if (versionid == "") return alert("A valid project wasn't selected")
    var saved = await chrome.storage.sync.set({ rfversionid: versionid })
    console.log(saved)
    updateOptions()
  })
  updateOptions()
}
async function updateOptions() {
  // UPDATE API KEY
  if (await getSync("rfapikey")) document.querySelector("#apikey").value = await getSync("rfapikey")

  // UPDATE PROJECTS LIST
  var projectselect = document.querySelector("#projectselect")
  Array.from(projectselect.options).forEach(e => { e.remove() })
  var rfapikey = await getSync("rfapikey")

  if (!rfapikey) {
    var option = document.createElement("option")
    option.value = ""
    option.disabled = true
    option.selected = true
    option.innerText = "API Key Not Set"
    projectselect.appendChild(option)
    return
  }

  var profile = await rfAPI("", rfapikey)
  console.log("rf profile:", profile)
  var workspaceid = profile.workspace
  var workspace = await rfAPI(`${workspaceid}`, rfapikey)
  console.log("rf workspace:", profile)
  if (!workspace.workspace) {
    var option = document.createElement("option")
    option.value = ""
    option.disabled = true
    option.selected = true
    option.innerText = "Invalid API Key"
    projectselect.appendChild(option)
    return
  }
  var projects = workspace.workspace.projects

  projects.forEach(project => {
    var option = document.createElement("option")
    var projectid = project.id.split("/")[1]
    option.id = encodeURIComponent(`projectselect-${(project.id)}`)
    option.value = project.id
    option.innerText = `${project.name} (${projectid})`
    projectselect.appendChild(option)
  })


  var selectedprojectid = await getSync("rfprojectid")
  if (selectedprojectid) {
    document.getElementById(encodeURIComponent(`projectselect-${selectedprojectid}`)).selected = true
  } else {
    var option = document.createElement("option")
    option.value = ""
    option.disabled = true
    option.selected = true
    option.innerText = "No Project Selected (Pick One!)"
    projectselect.appendChild(option)
  }


  // UPDATE VERSION LIST
  var versionselect = document.querySelector("#versionselect")
  Array.from(versionselect.options).forEach(e => { e.remove() })
  var selectedproject = await rfAPI(selectedprojectid, rfapikey)
  if (selectedproject) {
    var versions = selectedproject.versions
    for (v in versions) {
      var version = versions[v]
      var versionnumber = version.id.split("/")[2]
      var option = document.createElement("option")
      option.id = encodeURIComponent(`versionselect-${(version.id)}`)
      option.value = version.id
      option.innerText = `v${versionnumber}: ${version.name}`
      if (v + 1 == versions.length) option.selected = true
      versionselect.appendChild(option)
    }
  } else {
    var option = document.createElement("option")
    option.value = ""
    option.disabled = true
    option.selected = true
    option.innerText = "No Versions Available"
    versionselect.appendChild(option)
  }

  var selectedversionid = await getSync("rfversionid")
  if (selectedversionid) {
    document.getElementById(encodeURIComponent(`versionselect-${selectedversionid}`)).selected = true
  } else if (selectedproject && (selectedproject.versions.length > 0)) {
    var option = document.createElement("option")
    option.value = ""
    option.disabled = true
    option.selected = true
    option.innerText = "No Version Selected (Pick One!)"
    versionselect.appendChild(option)
  } else {
    var option = document.createElement("option")
    option.value = ""
    option.disabled = true
    option.selected = true
    option.innerText = "No Versions Available"
    versionselect.appendChild(option)
  }


  // SEND UPDATED MESSAGE
  chrome.runtime.sendMessage({ message: "updatedOptions" })
}

async function getSync(key) {
  var data = await chrome.storage.sync.get(key)
  return data[key]
}

async function rfAPI(route, apikey) {
  var url = new URL(`https://api.roboflow.com/${route}`)
  url.searchParams.set("api_key", apikey)
  var req = await fetch(url.href)
  var res = await req.json()
  return res
}
