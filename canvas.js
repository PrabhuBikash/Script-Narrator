const inputBox = document.getElementById("real-editor");
const highlightLayer = document.getElementById("highlight-layer");
const ReadWriteBtn = document.getElementById("ReadWrite-btn");
const highlight = () => {
  highlightLayer.innerHTML = highlightSyntax(inputBox.value)
  const lineHeight = parseFloat(getComputedStyle(inputBox).lineHeight);
  const caretY = inputBox.value.substr(0, inputBox.selectionStart).split("\n").length * lineHeight;
  if (caretY < inputBox.scrollTop || caretY > inputBox.scrollTop + inputBox.clientHeight - lineHeight) {
    inputBox.scrollTop = caretY - inputBox.clientHeight / 2;
  }
};


function toggleEditMode(force = null) {
  inputBox.readOnly = (force === null) ? !inputBox.readOnly : force;
  if (inputBox.readOnly) { inputBox.removeEventListener("input", highlight); ReadWriteBtn.textContent = "📖 READ"; }
  else { inputBox.addEventListener("input", highlight); ReadWriteBtn.textContent = "✏️ EDIT"; }
  inputBox.focus()
}



let themes = [,"light", "sepia","dark"];
let currentTheme = 0;
function toggleTheme() {
  document.body.classList.remove(themes[currentTheme]);
  currentTheme = (currentTheme + 1) % themes.length;
  document.body.classList.add(themes[currentTheme]);
}


if (window.name !== '') {
  const parsedValue = JSON.parse(window.name)
  inputBox.value = typeof parsedValue === 'object' ? window.name : parsedValue;
  window.name = '';
} else {
  inputBox.value = JSON.parse(sessionStorage.getItem('Text-To-Speech:ZenEditor:data'));
  if (inputBox.value === "") toggleEditMode(false);
}
highlight();
inputBox.addEventListener("scroll", () => { syncHighlight(inputBox,highlightLayer) });
window.addEventListener('beforeunload', sessionStorage.setItem('Text-To-Speech:ZenEditor:data', JSON.stringify(inputBox.value)))