const inputBox = document.getElementById('script-input');
const runButton = document.getElementById('run-script');
const stopButton = document.getElementById('stop-script');
const openFolderBtn = document.getElementById('open-folder');
const shareBtn = document.getElementById('share-btn');
const timer = document.getElementById('timer');
const errorBox = document.getElementById('error-box');
const characterList = document.getElementById('character-list');
const highlight = document.getElementById('highlight');
const suggestBox = document.getElementById("suggest-box");

let parsedScript = null;
let toneMap = {};
let redefinedTones = [];
let voices = [];
let settings = {};

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length) loadParseScript();
}
speechSynthesis.onvoiceschanged = loadVoices;

function loadParseScript(rawtext = inputBox.value) {
  try {
    scenes = {};
    parsedScript = parseScript(rawtext);
    updateCharacters(characterList, voices, settings, builtInSpeechTones, parsedScript);
    highlight.innerHTML = highlightSyntax(rawtext);
  } catch (err) {
    errorBox.innerText = `Parsing Error: ${err}`;
  }
}


const timerInfo = {startTime:0, elapsed:0, intervalId:null};
function updateTimerDisplay() {
  let ms = timerInfo.elapsed + (Date.now() - timerInfo.startTime);
  const parts = [];
  const units = [
    { label: 'h',   mod: 3600000 },
    { label: 'm',   mod: 60000 },
    { label: 's',   mod: 1000 }
  ];
  for (const { label, mod } of units) {
    if (ms > mod || parts.length > 0 || label === 's') parts.push(`${String(Math.floor(ms / mod)).padStart(2,0)}${label}`);
    ms %= mod;
  }

  timer.textContent = `${parts.join(':')}:${String(ms).padStart(3,0)}ms`;
}

const activeAmbients = {};
runButton.addEventListener('click', async () => {
  try {
    switch (runButton.textContent){
      case "▶ play": {
        if (!parsedScript) loadParseScript();
        if (!parsedScript?.length) throw new Error("Script is empty or not parsed.");
      
        for (const [key, ambient] of Object.entries(activeAmbients)) {
          ambient.pause();
          ambient.currentTime = 0;
          delete activeAmbients[key];
        }
      
        stopButton.style.display = '';
        openFolderBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        runButton.textContent = '⏸ pause';
        timer.style.display = '';
        timerInfo.startTime = Date.now();
        timerInfo.elapsed = 0;
        timerInfo.intervalId = setInterval(updateTimerDisplay, 0);
        speakScript(errorBox, parsedScript, voices, settings, squareCommands, curlySounds).then(() => stopButton.click()).catch(err => {errorBox.innerText = `Speech error: ${err.message}`;});
        break;
      }      
      case "⏸ pause":{
        speechSynthesis.pause();
        Object.values(activeAmbients).forEach(ambient => ambient.pause());
        runButton.textContent = '▶ resume';
        clearInterval(timerInfo.intervalId);
        timerInfo.elapsed += Date.now() - timerInfo.startTime;
        break;
      }
      case "▶ resume":{
        speechSynthesis.resume();
        Object.values(activeAmbients).forEach(ambient => ambient.resume());
        runButton.textContent = '⏸ pause';
        timerInfo.startTime = Date.now();
        timerInfo.intervalId = setInterval(updateTimerDisplay, 0);
      }
    }
  } catch (err) {
    errorBox.innerText = `Can't run: ${err.message}`;
  }
});

stopButton.addEventListener('click', () => {
  speechSynthesis.cancel();
  for (const [key, ambient] of Object.entries(activeAmbients)) {
    ambient.pause();
    ambient.currentTime = 0;
    delete activeAmbients[key];
  }
  runButton.textContent = '▶ play';
  stopButton.style.display = 'none';
  openFolderBtn.style.display = '';
  shareBtn.style.display = '';
  timer.style.display = 'none';
});

function saveFiles() {
  sessionStorage.setItem('Text-To-Speech:scriptEditor:data', JSON.stringify(inputBox.value))
  const raw = JSON.stringify({
    Scripts: Object.fromEntries(vfs.Scripts),
    Sounds: Object.fromEntries(vfs.Sounds),
    Versions: Object.fromEntries(vfs.Versions),
  });
  localStorage.setItem("TextToSpeech:VFS", raw);
}
function loadFiles() {
  inputBox.value = JSON.parse(sessionStorage.getItem('Text-To-Speech:scriptEditor:data')) || "";
  const raw = localStorage.getItem("TextToSpeech:VFS");
  if (raw) {
    const data = JSON.parse(raw);
    vfs.Scripts = new Map(Object.entries(data.Scripts || {}));
    vfs.Sounds = new Map(Object.entries(data.Sounds || {}));
    vfs.Versions = new Map(Object.entries(data.Versions || {}));
  }
}

loadVoices();
loadFiles();
let shouldSave = true;
inputBox.addEventListener('input', () => {
  loadParseScript();
  updateHistory();
  const lineHeight = parseFloat(getComputedStyle(inputBox).lineHeight);
  const caretY = inputBox.value.substr(0, inputBox.selectionStart).split("\n").length * lineHeight;

  if (caretY < inputBox.scrollTop || caretY > inputBox.scrollTop + inputBox.clientHeight - lineHeight) {
    inputBox.scrollTop = caretY - inputBox.clientHeight / 2;
  }
});
inputBox.addEventListener('keydown', (e) => { addTheRest(e); undoRedoHandler(e); keyboardShortcuts(e); });
inputBox.addEventListener("scroll", () => { syncHighlight(inputBox,highlight) });
window.addEventListener('beforeunload', () => {if (shouldSave) saveFiles()});
inputBox.addEventListener("keyup", () => {suggestionHandler(inputBox, suggestBox)});
if (inputBox.value) history_List.push({ value: inputBox.value, cursor: { start: 0, end: inputBox.selectionEnd } })



