function addToneSettingsUI(advancedBox, character, tones, settings,builtInSpeechTones,tonedefinitions) {
  if (!tones || tones.size === 0) return;
  const showdef = (def = {}) => `(${Object.entries({...{pitch:1,speed:1,volume:0.5},...def}).map(([k, v]) => `${k}=${v}`).join(',')})`;
  tones.forEach(tone => {
    const toneDiv = document.createElement("fieldset");
    toneDiv.className = "tone-setting";
    toneDiv.innerHTML = tonedefinitions?.[character]?.[tone]
    ? `<legend><strong>${tone}</strong></legend>`+tonedefinitions[character][tone].map(def => `<p>${showdef(def)}</p>`).join('')
    : builtInSpeechTones?.[tone]
    ? `<legend><strong>${tone}</strong><small>(not defined yet!, using builtin (:${tone})</small></legend><p>${showdef(builtInSpeechTones[tone])}</p>`
    : `<legend><strong>${tone}</strong><small>(not defined yet!)</small></legend><p>${showdef()}</p>`;
    advancedBox.appendChild(toneDiv);
  });
}

function addVoiceSettingsUI(voiceMenu, character, voices, settings){
  voiceMenu.innerHTML = "";
  voiceMenu.dataset.char = character;
  voiceMenu.addEventListener("change", () => settings.__UI__.__voice__ = voiceMenu.value);
  voices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.voiceURI;
    option.textContent = `${voice.name} (${voice.lang})`;
    option.selected = voice.voiceURI === settings.__UI__.__voice__;
    voiceMenu.appendChild(option);
  });
}

function updateCharacters(characterList, voices, settings, builtInSpeechTones, parsedScript) {
  characterList.innerHTML = "";
  const {toneMap, tonedefinitions} = extractCharacterTones(parsedScript)
  Object.keys(toneMap).forEach(char => {
    const charSettings = settings[char] ??= {__UI__:{__voice__:null,__SettingsOpened__:false}};
    const wrapper = document.createElement("fieldset");
    wrapper.className = "char-box";
    wrapper.dataset.char = char;
    wrapper.innerHTML = `
      <div class="char-header">
        <legend><strong>${char ?? " "}</strong></legend>
        <select class="voice-select"></select>
        <label class="toggle-label">
          <input type="checkbox" class="advanced-toggle" style="display:none">
          <span class="toggle-icon" title="Advance Settings">▼</span>
        </label>
      </div>
      <small style="font-size:10.5px">this is the default voice of ${char ?? " "}. once overridden by script it won't work. (it is just a fallback)</small>
      <div class="char-advanced" style="display: none;"></div>
    `;
    const toggle = wrapper.querySelector(".advanced-toggle");
    const advancedBox = wrapper.querySelector(".char-advanced");
    addVoiceSettingsUI(wrapper.querySelector(".voice-select"), char, voices, charSettings)
    addToneSettingsUI(advancedBox, char, toneMap[char], charSettings, builtInSpeechTones,tonedefinitions);
    toggle.checked = charSettings.__UI__.__SettingsOpened__;
    const toggleHandler = () => {
      const opened = charSettings.__UI__.__SettingsOpened__ = toggle.checked;
      advancedBox.style.display = opened ? "block" : "none";
      wrapper.querySelector(".toggle-icon").textContent = opened ? "▲" : "▼";
    }
    toggle.oninput = toggleHandler;
    toggleHandler()
    characterList.appendChild(wrapper);
  });
}


function extractCharacterTones(parsedScript) {
  const toneMap = {}; // { character: Set(User defined Tones) }
  const tonedefinitions = {}; // { character: { tone : count } }

  for (const entry of parsedScript) {
    if (!toneMap[entry.character]) toneMap[entry.character] = new Set(["normal"]);

    for (const token of entry.speech) {
      if (token.type !== "parenthesis") continue;
      const val = token.value.trim();
      const toneName = val.includes(':') ? val.split(':')[0].trim() : val.includes('=') ? null : val;
      if (!toneName) continue;
      toneMap[entry.character].add(toneName);
      if (!val.includes(':')) continue;
      ((tonedefinitions[entry.character]??={})[toneName]??=[]).push(Object.fromEntries(val.split(':')[1].split(',').map(pair => pair.split('=').map(str => str.trim()))));
    }
  }
  return {toneMap,tonedefinitions}
}
