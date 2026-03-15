const vfsContents = document.getElementById("vfsContents");
const vfsmodal = document.getElementById("vfsModal");
const titleBars = document.querySelectorAll(".vfs-header");
function showModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.style.opacity = 1;
    modal.style.width = '100%';
    modal.style.transform = 'translate(0%, 0%) scale(1)';
  });
}

function hideModal(id) {
  const modal = document.getElementById(id);
  modal.style.transform = 'translateY(40%) scaleX(0.9) scaleY(0.6)';
  modal.style.opacity = 0;
  modal.style.width = 0;
  setTimeout(() => { modal.style.display = 'none'; }, 250);
}


let MAX_VERSIONS = 20;
function keyboardShortcuts(e) {
  if (e.ctrlKey && !e.shiftKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    while(vfs.Versions.size >= MAX_VERSIONS) vfs.Versions.delete(vfs.Versions.keys().next().value);
    const key = new Date().toLocaleString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/[./\s,:]/g,'_');
    vfs.Versions.set(key,inputBox.value);
    flashText(key+' Saved to Versions in vfs', e.clientX + 10, e.clientY, 5000);
  } else if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    const lastVersionKey = [...vfs.Versions.keys()].pop();
    if (lastVersionKey) {
      inputBox.value = vfs.Versions.get(lastVersionKey);
      flashText(lastVersionKey+' is retrived from Versions', e.clientX + 10, e.clientY, 5000);
      inputBox.dispatchEvent(new InputEvent("input", { bubbles: true }));
    } else flashText('There are no versions saved in the VFS', e.clientX + 10, e.clientY, 5000);
  } else if (e.ctrlKey && !e.shiftKey && (e.key === 'o' || e.key === 'O')) {
    e.preventDefault();
    showModal("vfsModal");
  } else if (e.ctrlKey && !e.shiftKey && e.key === ' ') {
    e.preventDefault();
    runButton.click()
  } else if (e.ctrlKey && !e.shiftKey && (e.key === 'i' || e.key === 'I')) {
    e.preventDefault();
    window.open('canvas.html', JSON.stringify(parseScript(inputBox.value),null,2))
  }
}

function handleFileUpload(file) {
  const ext = file.name.split('.').pop();
  if (['mp3', 'wav'].includes(ext)) vfs.Sounds.set(file.name, URL.createObjectURL(file));
  else {
    const reader = new FileReader();
    reader.onload = () => vfs.Scripts.set(file.name, reader.result);
    reader.readAsText(file);
  }
}


let selectedFolder = null;
let selectedFile = null;
let lastselected = null;
function openFolder(folderName) {
  document.querySelectorAll('.folder,.file').forEach(f => f.classList.remove("selected"))
  if (selectedFolder === folderName) {
    selectedFolder = null;
    vfsContents.innerHTML = '';
    return;
  }
  selectedFolder = folderName;
  document.getElementById(folderName).classList.add("selected");
  vfsContents.innerHTML = `<h3>${folderName}/</h3>`;
  
  const folder = vfs[folderName];
  const folderSymbols = {
    'Sounds': '🎵',
    'Scripts': '📜',
    'Versions': '📄',
  }
  if (!folder) { vfsContents.innerHTML += `<p>Folder not found.</p>`; return; }
  for (const [fileName] of folder.entries()) {
    const file = document.createElement('div');
    file.innerText = `${folderSymbols[folderName] ?? '??'} ${fileName}`;
    file.className = 'file';
    file.onclick = e => {
      selectedFile = fileName;
      document.querySelectorAll('.file').forEach(file => file.classList.remove("selected"))
      file.classList.add("selected");
      lastselected = {folderName,fileName}
      showContextMenu(e.clientX, e.clientY);
    };
    vfsContents.appendChild(file);
    }
}

titleBars.forEach(titleBar => {
  const modal = titleBar.closest('.vfs-modal')
  let offsetX = 0, offsetY = 0, isDragging = false;
  titleBar.addEventListener("pointerdown", (e) => {
    isDragging = true;
    offsetX = e.clientX - modal.offsetLeft;
    offsetY = e.clientY - modal.offsetTop;
    modal.style.transition = 'none';
  });

  document.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    modal.style.left = `${e.clientX - offsetX}px`;
    modal.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("pointerup", () => {
    isDragging = false;
    modal.style.transition = '';
  });
});

function showContextMenu(x, y) {
  const menu = document.getElementById("contextMenu");
  menu.style.display = "block";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.file')) {
      menu.style.display = "none";
      document.querySelectorAll('.file').forEach(file => file.classList.remove("selected"))
    }
  });
}


function handleViewOrPlay() {
  if (selectedFolder === "Sounds") new Audio(URL.createObjectURL(vfs.Sounds.get(selectedFile))).play();
  else window.open('canvas.html', JSON.stringify(vfs[selectedFolder].get(selectedFile)));
}

function flashText(text, x = window.innerWidth / 2, y = window.innerHeight / 2, duration = 1000) {
    const toast = document.getElementById("flashToast");
    toast.textContent = text;
    toast.style.left = x + "px";
    toast.style.top = y + "px";
    toast.style.opacity = 1;

    setTimeout(() => toast.style.opacity = 0 , duration);
}

document.getElementById('ctxCopy').onclick = e => {
  const syntax = `[load: name=./${selectedFolder}/${selectedFile}]`;
  navigator.clipboard.writeText(syntax);
  flashText("Copied!\n"+syntax, e.clientX + 10, e.clientY);
};


function showRenameModal() {
  showModal("renameModal");
  const {folderName, fileName:oldName} = lastselected;
  document.getElementById("renameOldName").textContent = oldName;
  const input = document.getElementById("renameInput");
  const renameBtn = document.getElementById("rename-btn")
  input.focus();
  input.oninput = () => {
    const newName = sanitizeName(input.value.trim());
    renameBtn.textContent = `Rename to "${newName}"`;
    renameBtn.style.backgroundColor = 'green';
    renameBtn.style.color = 'white';
    if (!newName){
      renameBtn.textContent = `Delete "${oldName}"`;
      renameBtn.style.backgroundColor = 'red';
      renameBtn.style.color = 'white';
    } else if (newName === oldName){
      renameBtn.textContent = 'do Nothing';
      renameBtn.style.backgroundColor = 'transparent';
      renameBtn.style.border = '2px solid gray';
      renameBtn.style.color = 'black';
    } else if (vfs[folderName].has(newName)){
      renameBtn.textContent = `replace ${newName}`;
      renameBtn.style.backgroundColor = 'Yellow';
      renameBtn.style.color = 'black';
    };
    renameBtn.onclick = () => confirmRename(folderName, newName, oldName);
  }
  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
}


function confirmRename(folderName, newName, oldName) {
  hideModal("renameModal");
  if (newName === oldName) return;
  const files = vfs[folderName];
  const content = files.get(oldName)
  files.delete(oldName);
  if (newName !== "") files.set(newName, content);
  selectedFolder = null;
  openFolder(folderName);
}


const dummyModalHeading = document.getElementById('dummy-modal-heading');
const dummyModalText = document.getElementById('dummy-modal-text');
const dummyModalInput = document.getElementById('dummy-modal-input');
const dummyModalBtn = document.getElementById('dummy-modal-btn');
function downloadScript() {
  dummyModalHeading.textContent = "Download Now";
  dummyModalInput.value = "";
  dummyModalInput.placeholder = 'What you want to name your creation?';
  dummyModalText.innerHTML = `file will be installed as an .echo file!
  <br>what's that? Nothing just a sign that it's fom here. you can change that freely!`;
  dummyModalBtn.textContent = "Save";
  dummyModalBtn.onclick = () => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([inputBox.value], { type: "text/plain" }));
    a.href = url;
    a.download = dummyModalInput.value.trim() === "" ? "script.echo" : sanitizeName(dummyModalInput.value.trim());
    a.click();
    URL.revokeObjectURL(url);
  }
  showModal('dummy-modal');
}



function recordingHandler() {
  dummyModalHeading.textContent = "Record Audio";
  dummyModalInput.value = "How to record Screen?";
  dummyModalInput.placeholder = 'Input your querry!';
  dummyModalText.innerHTML = `Want to save the audio?
  <br>You can record it using any screen recorder.`;
  dummyModalBtn.textContent = "Search";
  dummyModalBtn.onclick = () => {
  const query = dummyModalInput.value.trim();
  if (!query) return;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };
  showModal('dummy-modal');
}

function shareLink() {
  const shareURL = `${location.origin}${location.pathname}?shared=${encodeURIComponent(inputBox.value)}`;
  dummyModalHeading.textContent = "Share Link";
  dummyModalText.innerHTML = `It is as long as your script If you still want it then
  <br>Here is your shareable link:
  <br>(else you can just share your script and this site)`;
  dummyModalInput.value = shareURL;
  dummyModalInput.placeholder = 'why did you removed the link?';
  dummyModalBtn.textContent = "Copy Link";
  dummyModalBtn.onclick = () => {
    dummyModalBtn.textContent = "✅ Copied!";
    flashText("Copied!\n"+shareURL);
    hideModal("dummy-modal");
    setTimeout(() => dummyModalBtn.textContent = "Copy Link",1000);
  };
  showModal('dummy-modal');
}

function sanitizeName(str){
  return str.replace(/\s/g, '_')
  .replace(/[:,=(){}[\]]/g, '?')
}
function clearVFSData() {
  shouldSave = false;
  localStorage.removeItem("TextToSpeech:VFS");
  location.reload();
}


const openhelp = () => {
  const helpFile = `\
Welcome to the Echo Script Help Guide! I am the default character null, I am the one who speaks if no one else does
# Anyline that starts with (some space before is allowed) '#' is a comment — it won’t be read aloud.

Want multiline comments?
Use [# to begin and #] to stop — like this: why it didn't comment in this line? because
[# <- in a new line is a multiline comment starter
if something is before it then it's not a comment like #[
This block is ignored during playback.
Write your notes, drafts, or disable sections here.
#] <- in a new line ends latest comment

  # if something is before then not
  [# like #]
  #]
  or # this is also not a comment
  i.e., ^\s*[# starts comment from that line onwards and ^\s*#] ends last multiline comment from the next line onwards
[#  but you don't need worry about that
  just write like this no problem!
  [#
    nested comment!
  #]
#]


! : Have you ever wondered if you could just type your script... and make us talk?
? : No. 😂

! : Now you can! Just like this.
? : I’m ignoring the fact that emojis are read out by their names. 😅

! : Want to change tone mid-sentence? Try this:
  (whisper: pitch=1, speed=1, volume=0.25) Just like this... (normal) back to normal again!

? : What if I want a... pause?
! : Use ellipses ... or a manual one: [pause: 1s]

? : Are there ambient sounds too? Like {wind}?
! : Yep! Just load an audio file into the VFS, then:
  [load: wind=path/to/file]
  Then use it like: {wind}

? : Any other commands?
! : You can explore, but here’s a hint: not many are defined yet! 😜

? : What about **bold**, *italic*, and "quotes"?
! : Supported! You can also use __bold__, _italic_, and 'quotes' as alternatives.

? : Can I define scenes to reuse?
! : Absolutely!

@scene scene1
! : This is Scene 1.
? : You name scenes like this, and they can be nested too.

@scene scene2
! : Scene 2 begins.
@scene innerScene
! : This is a nested scene!
@end innerScene
@end scene2

@endAll

? : Whoa, so @end without a name ends the latest scene,
    and @endAll clears everything?
! : Exactly!

? : And how do I run a scene?
! : Like this → [run: scene2]

? : That’s it?
! : That’s it! 🎉 You’re now ready to write scripts that *talk back*.
`;
  window.open('canvas.html',JSON.stringify(helpFile));
}
function helpHandler() {
  dummyModalHeading.textContent = "Settings";
  dummyModalText.innerHTML = `<button style="background: green; color:white; margin:0.5rem; padding:0.5rem; border-radius: 25px"
  onclick="openhelp()">Click here if you want to know about syntaxes</button>
  <br>Are you bothered by these: !?
  <br>you can on/off them by clicking on <p style="background:var(--bg);color:var(--text)" onclick="toggleMascots()">🎭 Characters</p>
  <br><br>Input what you want to see parsed?
  <br>(default: your code in the editor)`;
  const errorLine = document.createElement('p');
  dummyModalText.appendChild(errorLine)
  dummyModalInput.value = "";
  dummyModalInput.placeholder = 'Enter the code you want to see parsed';
  dummyModalBtn.textContent = "See Parsed Code";
  dummyModalBtn.onclick = () => {
    let parsedContent;
    try { parsedContent = parseScript(dummyModalInput.value === "" ? inputBox.value : dummyModalInput.value); }
    catch (error) { errorLine.innerText += `\nThere are error in the code:\n${error}`; return; }
    window.open('canvas.html', JSON.stringify(parsedContent,null,2))
  };
  showModal('dummy-modal');
}



function HistoryControl(folderName = "HistorySettings") {
  document.querySelectorAll('.folder,.file').forEach(f => f.classList.remove("selected"))
  if (selectedFolder === folderName) {
    selectedFolder = null;
    vfsContents.innerHTML = '';
    return;
  }
  selectedFolder = folderName;
  document.getElementById(folderName).classList.add("selected");
  vfsContents.innerHTML = `<h3>${folderName}/</h3>`;
  
  const ghostFile = document.createElement('div');
  ghostFile.innerText = `🎵 ghost.mp3 --- 🚨 Don't Click`;
  ghostFile.className = 'file';
  ghostFile.onclick = () => {
    selectedFile = fileName = "Ghost.mp3";
    document.querySelectorAll('.file').forEach(file => file.classList.remove("selected"))
    ghostFile.classList.add("selected");
    lastselected = {folderName,fileName}
    squareCommands.synth(`type=${['sine', 'square', 'sawtooth', 'triangle'][Math.floor(Math.random() * 4)]},frequency=${Math.random() * 1000 + 100},volume=${Math.random()},duration=${Math.random() + 0.5}`)
    ghostFile.classList.remove("selected");
    ghostFile.remove()
  };

  const historyCount = document.createElement('div');
  historyCount.innerHTML = `🕰️ Current_History_Count = ${history_List.length}/<input type="number" value="${MAX_HISTORY}" style="width:50px"/><button style="background:red;color:white">Update</button><span style="color:green">View</span>`;
  historyCount.className = 'file';
  historyCount.querySelector('span').title = JSON.stringify(history_List,null,2);
  historyCount.querySelector('button').onclick = () => {
    selectedFile = fileName = 'historyCount';
    document.querySelectorAll('.file').forEach(file => file.classList.remove("selected"))
    historyCount.classList.add("selected");
    lastselected = {folderName,fileName};
    MAX_HISTORY = historyCount.querySelector('input').value;
    flashText(`History Capacity changed to ${MAX_HISTORY}`);
    historyCount.classList.remove("selected");
  };
  historyCount.querySelector('span').onclick = () => window.open('canvas.html', JSON.stringify(history_List,null,2))

  const versionCount = document.createElement('div');
  versionCount.innerHTML = `🕰️ Current_Version_Count = ${vfs.Versions.size}/<input type="number" value="${MAX_VERSIONS}" style="width:50px"/><button style="background:red;color:white">Update</button><span style="color:green">View</span>`;
  versionCount.className = 'file';
  versionCount.querySelector('span').title = JSON.stringify(Object.fromEntries(vfs.Versions),null,2);
  versionCount.querySelector('button').onclick = () => {
    selectedFile = fileName = 'historyCount';
    document.querySelectorAll('.file').forEach(file => file.classList.remove("selected"))
    versionCount.classList.add("selected");
    lastselected = {folderName,fileName};
    MAX_VERSIONS = versionCount.querySelector('input').value;
    flashText(`Version Capacity changed to ${MAX_VERSIONS}`);
    versionCount.classList.remove("selected");
  };
  versionCount.querySelector('span').onclick = () => window.open('canvas.html', JSON.stringify(Object.fromEntries(vfs.Versions),null,2))

  const historyGap = document.createElement('div');
  historyGap.innerHTML = `🕰️ History_Save_Interval (ms) = <input type="number" value="${HISTORY_SAVE_INTERVAL}" style="width:50px"/><button style="background:red;color:white">Update</button>`;
  historyGap.className = 'file';
  historyGap.querySelector('button').onclick = () => {
    selectedFile = fileName = 'historyGap';
    document.querySelectorAll('.file').forEach(file => file.classList.remove("selected"))
    historyGap.classList.add("selected");
    lastselected = {folderName,fileName};
    HISTORY_SAVE_INTERVAL = historyGap.querySelector('input').value;
    flashText(`History_Save_Interval changed to ${HISTORY_SAVE_INTERVAL}`);
    historyGap.classList.remove("selected");
  };

  const ClearAll = document.createElement('div');
  ClearAll.innerHTML = `🗑️ ClearAll --- <small>🚨 Everything will get deleted (Except the text on the editor)</small>`;
  ClearAll.className = 'file';
  ClearAll.onclick = clearVFSData
  
  vfsContents.appendChild(historyCount);
  vfsContents.appendChild(versionCount);
  vfsContents.appendChild(historyGap);
  vfsContents.appendChild(ClearAll);
  vfsContents.appendChild(ghostFile);
}

