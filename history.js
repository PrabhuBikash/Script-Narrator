let MAX_HISTORY = 100;
let HISTORY_SAVE_INTERVAL = 400
let history_List = [{ value: "", cursor: { start: 0, end: 0 } }];
let historyIndex = 0;
let debounceTimer;

function updateHistory() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const value = inputBox.value;
    const lastEntry = history_List[historyIndex];
    if (lastEntry && lastEntry.value === value) return;
    history_List = history_List.slice(0, ++historyIndex);
    history_List.push({ value, start: inputBox.selectionStart, end: inputBox.selectionEnd });
    while(history_List.length >= MAX_HISTORY) { history_List.shift(); historyIndex--;}
  }, HISTORY_SAVE_INTERVAL);
}

function revertHistory(index) {
  if (index < 0 || index >= history_List.length) return;
  const { value, start, end } = history_List[index];
  inputBox.value = value;
  inputBox.focus();
  inputBox.setSelectionRange(start, end);
  loadParseScript(value);
}

function undoRedoHandler(e) {
  if (e.ctrlKey && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    if (historyIndex > 0) revertHistory(--historyIndex);
  } else if (e.ctrlKey && !e.shiftKey && (e.key === 'y' || e.key === 'Y')) {
    e.preventDefault();
    if (historyIndex < history_List.length - 1) revertHistory(++historyIndex);
  }
}
