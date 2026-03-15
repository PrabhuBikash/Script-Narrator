function addTheRest(e) {
  const el = e.target;
  const val = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  
  function insertText(before = "", after = "", backspaces = 0, preserve = true) {
    e.preventDefault();
    el.value = val.slice(0, start-backspaces) + before + (preserve ? val.slice(start,end) : "") + after + val.slice(end);
    el.selectionStart = start + before.length;
    el.selectionEnd = end + before.length;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  switch (e.key) {
    case "(": insertText("(", ")"); break;
    case "[": insertText("[", "]"); break;
    case "{": insertText("{", "}"); break;
    case "*": insertText("*", "*"); break;
    case "_": insertText("_", "_"); break;
    case "'": insertText("'", "'"); break;
    case '"': insertText('"', '"'); break;
    case "Enter": {
      const lines = val.slice(0, start).split("\n");
      const lastLine = lines[lines.length - 1];
      const indentation = lastLine.match(/^\s*/)?.[0] ?? "";
      insertText("\n"+indentation,); break;
    }
    case "Tab": {
      const tab = '  ';
      const selectedLines = val.slice(start, end).split("\n");
      const updatedText = !e.shiftKey ? selectedLines.map(line => tab + line).join('\n') : 
      selectedLines.map(line => {
        const indentMatch = line.match(/^(\s+)/);
        return indentMatch ? line.slice(Math.min(tab.length,indentMatch[1].length)) : line;
      }).join('\n');
      el.value = val.substring(0, start) + updatedText + val.substring(end);
      e.preventDefault();
      el.selectionStart = start;
      el.selectionEnd = start + updatedText.length;
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      break;
    }
  }
}

function getCaretCoordinates(el) {
  const position = el.selectionStart;
  const div = document.createElement("div");
  const style = window.getComputedStyle(el);
  for (const prop of style) div.style[prop] = style[prop];
  div.style.position = "absolute";
  div.style.visibility = "hidden";

  const before = el.value.substring(0, position);
  const after = el.value.substring(position);
  div.textContent = before;

  const span = document.createElement("span");
  span.textContent = after.length ? after[0] : ".";
  div.appendChild(span);
  document.body.appendChild(div);

  const { offsetLeft: left, offsetTop: top } = span;
  document.body.removeChild(div);
  return { left, top };
}


function showSuggestions(prefix, editor, suggestBox, allSuggestions) {
  const filtered = allSuggestions.filter(suggestion => suggestion.label.startsWith(prefix) && suggestion.label !== prefix);
  if (filtered.length === 0) { suggestBox.style.display = "none"; return; }

  const caret = getCaretCoordinates(editor);
  suggestBox.style.left = `${caret.left}px`;
  suggestBox.style.top = `${caret.top + 20}px`;
  suggestBox.innerHTML = filtered.map(({ label, desc }) =>
    `<div class="suggestion" data-value="${label}">${escapeHTML(label)}<br><small>${desc || ""}</small></div>`
  ).join("");
  suggestBox.style.display = "block";

  const addSuggestion = (suggestion) => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const val = editor.value;
    editor.value = val.slice(0, start) + suggestion + val.slice(end);
    editor.selectionStart = editor.selectionEnd = start + suggestion.length;
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
    loadParseScript();
    editor.focus();
  };

  suggestBox.querySelectorAll(".suggestion").forEach(el => {
    el.onclick = () => {
      addSuggestion(el.dataset.value.slice(prefix.length));
      suggestBox.style.display = "none";
    };
  });

  inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && filtered.length > 0) {
      e.preventDefault();
      addSuggestion(filtered[0].label.slice(prefix.length));
    }
    suggestBox.style.display = "none";
  }, { once: true });
}

function suggestionHandler(inputBox, suggestBox) {
  const { value, selectionStart } = inputBox;
  const beforeCursor = value.slice(0, selectionStart);

  const Alldescriptions = {
    command: {
      "pause: ": "Pause script execution. e.g. [pause: 2s]",
      "load: ": "Load another script or sound. e.g. [load: name=./folder/file]",
      "run: ": "Run a scene. e.g. [run: scene1]",
      "synth: ": "Play background sound. e.g. [synth: dreamy]",
      "speak: ": "Speak text aloud. e.g. [speak: text=Hello there,tone=whisper]",
    },

    ambiance: {
      ...Object.fromEntries(Object.entries(builtInAmbience).map(([key, val]) => [`${key}`,`{${Object.entries(val).map(([k, v]) => `${k}=${v}`).join(',')}}`])),
      ...Object.fromEntries(Object.entries(builtInAmbience).map(([key, val]) => [`${key}:${Object.entries(val).map(([k, v]) => `${k}=${v}`).join(',')}`,`Try defining ${key} like this, You can later reuse it by {${key}}`]))
    },

    tone: (() => {
      const speakerMatch = beforeCursor.match(/^\s*([\w\-]+)\s*:/gm);
      const currentCharacter = speakerMatch ? speakerMatch[speakerMatch.length - 1].trim().replace(":", "") : null;
      const toneSuggestions = [];
      
      const {toneMap,tonedefinitions} = extractCharacterTones(parseScript(beforeCursor))
      if (currentCharacter && toneMap[currentCharacter]) {
        Array.from(toneMap[currentCharacter]).forEach(toneKey => {
          const toneVals = tonedefinitions[currentCharacter]?.[toneKey];
          if (toneVals) toneSuggestions.push([`${toneKey}`, `You defined it: (${Object.entries(toneVals[toneVals.length-1]).map(([k, v]) => `${k}=${v}`).join(',')})`]);
        })
      }
      for (const [key, val] of Object.entries(builtInSpeechTones)) {
        const alreadyUsed = toneMap?.[currentCharacter]?.has?.(key);
        if (alreadyUsed) toneSuggestions.push([`:${key}`,`Inbuilt tone: (${Object.entries(val).map(([k, v]) => `${k}=${v}`).join(',')})`])
        else toneSuggestions.push([`${key}:${Object.entries(val).map(([k, v]) => `${k}=${v}`).join(',')}`,`Try defining ${key} like this. You can later reuse it by (${key})`]);
      }
      return Object.fromEntries(toneSuggestions);
    })(),

    voice: Object.fromEntries(voices.map((v,i) => [v.voiceURI.replace(/:/g, '|').replace(/\(/g, '<').replace(/\)/g, '>') || '',`${i+1} - ${v.voiceURI}`])) 
  };

  const beforeCursorLines = beforeCursor.split('\n');
  const lastLine = beforeCursorLines[beforeCursorLines.length-1];
  const toSuggestionList = (regEx, suggestionList, defaultDesc = "description-not-available") => {
    const prefixmatch = lastLine.match(regEx);
    if (prefixmatch) showSuggestions(prefixmatch[1],inputBox,suggestBox,
      Object.keys(suggestionList).map((key) => ({label: key, desc: suggestionList[key] || defaultDesc})));
  };
  
  if (lastLine.includes("[")) toSuggestionList(/\[([^\[\]]*)$/, Alldescriptions.command);
  if (lastLine.includes("{")) toSuggestionList(/\{([^\{\}]*)$/, Alldescriptions.ambiance, 'Or try defining one like this!');
  if (lastLine.includes("(")) toSuggestionList(/\(([^\(\)]*)$/, Alldescriptions.tone, 'Or try defining one anonymous tone like this!');
  if (lastLine.includes("voice=")) toSuggestionList(/\([^\(\)]*voice\s*=\s*([^\(\)]*)$/, Alldescriptions.voice);
  
  document.addEventListener("click", (e) => { if (!suggestBox.contains(e.target)) suggestBox.style.display = "none"; }, { once: true });
}
