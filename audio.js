async function speakScript(errorBox, parsedScript, voices, settings, squareCommands, curlySounds) {
  errorBox.innerText = '';
  const logError = msg => errorBox.innerText += msg + '\n';

  for (const entry of parsedScript) {
    const charSettings = settings[entry.character] || {};
    let tone = "normal";
    const voice = voices.find(v => v.voiceURI === (charSettings[tone]?.voice ?? charSettings.__UI__.__voice__));

    for (const token of entry.speech) {
      switch (token.type) {
        case "text": {
          const utterance = new SpeechSynthesisUtterance(token.value);
          const toneSettings = charSettings[tone] ?? { pitch: 1, speed: 1, volume: 0.5, voice: voice };
          Object.entries(toneSettings).forEach(([key, value]) => { if (key in utterance) utterance[key] = value; });
          speechSynthesis.speak(utterance);
          await new Promise(resolve => utterance.onend = resolve);
          break;
        }

        case "parenthesis": {
          const val = token.value.trim();
          if (!val.includes(':') && !val.includes('=') && !val.includes(',')) {tone = val;break;}

          const [toneName, settingsStr] = val.includes(':')? val.split(':').map(s => s.trim()): [null, val];
          if (toneName === "") charSettings[toneName] = builtInSpeechTones[settingsStr];
          else if (!charSettings[toneName]) charSettings[toneName] = { pitch: 1, speed: 1, volume: 0.5, voice: voice };

          settingsStr.split(',').forEach(setting => {
            const [key, value] = setting.split('=').map(s => s.trim());
            charSettings[toneName][key] = key !== 'voice' ? (isNaN(value) ? value : parseFloat(value))
            : (() => { const URI = value.replace(/\|/g, ':').replace(/</g, '(').replace(/>/g, ')'); return voices.find(v => v.voiceURI.startsWith(URI)); })()
          });
          tone = toneName;
          break;
        }
        

        case "square": {
          const [command, args] = token.value.split(':');
          const fn = squareCommands[command];
          if (fn) {
            const result = fn(args?.trim() ?? "");
            if (result instanceof Promise) await result;
          } else logError(`Unknown command: [${token.value}]`);
          break;
        }

        case "curly": {
          const [name, attrs] = token.value.split(':').map(s => s.trim());
          try {
            if (curlySounds[name]) ambientControll(curlySounds,name, attrs.split(','));
            else if (token.value.includes(':')) squareCommands.synth(attrs,name);
            else squareCommands.synth(name);
          } catch(error){logError(`Error in: {${token.value}}\n ${error}`)}
          break;
        }
        
        case "elipses":{
          await new Promise(resolve => setTimeout(resolve, token.value.length * 100));
          break;
        }
        
        case "asterics": case "underscore": {
          const match = token.value?.match(/^(\**|_*)/);
          const strength = match ? match[0].length + 1 : 1;
          const utterance = new SpeechSynthesisUtterance(token.value.replace(/_/g, ''));
          if (voice) utterance.voice = voice;
          if (strength === 1) { utterance.pitch = 1.05; utterance.rate = 1.1; utterance.volume = 0.95; }
          else if (strength === 2) { utterance.pitch = 1.2; utterance.rate = 1; utterance.volume = 1.1; }
          else if (strength >= 3) { utterance.pitch = 1.3; utterance.rate = 1.1; utterance.volume = 1.2; }
          speechSynthesis.speak(utterance);
          await new Promise(resolve => utterance.onend = resolve);
          break;
        }
        
        case "quotation1": case "quotation2": {
          const utterance = new SpeechSynthesisUtterance(`Quote: ${token.value}`);
          if (voice) utterance.voice = voice;
          utterance.pitch = 0.95;
          utterance.rate = 0.95;
          utterance.volume = 0.85;
          speechSynthesis.speak(utterance);
          await new Promise(resolve => utterance.onend = resolve);
          break;
        }
      }
    }
  }
}




function ambientControll(curlySounds,name, attrs) {
  const sound = curlySounds[name];
  if (!sound) throw `Unknown sound: ${name}`;
  
  let volume = 1;
  let repeat = 1;
  let fadeIn = 0;
  let end = false;

  for (const attr of attrs) {
    const [key, val] = attr.split('=').map(s => s.trim());
    if (key === 'volume') volume = parseFloat(val) || 1;
    else if (key === 'repeat') repeat = parseInt(val) || Infinity;
    else if (key === 'fadeIn') fadeIn = parseFloat(val) || 0;
    else if (key === 'end') end = true;
  }
  if (end && activeAmbients[name]) {
    activeAmbients[name].pause();
    activeAmbients[name].currentTime = 0;
    delete activeAmbients[name];
    return;
  }

  const audio = sound.cloneNode();
  audio.loop = repeat === Infinity;
  audio.volume = 0;
  audio.play();
  activeAmbients[name] = audio;

  if (fadeIn > 0) {
    const targetVolume = volume;
    let current = 0;
    const step = 0.05;
    const interval = setInterval(() => {
      current += step;
      audio.volume = Math.min(current / fadeIn, targetVolume);
      if (audio.volume >= targetVolume) clearInterval(interval);
    }, 50);
  } else {
    audio.volume = volume;
  }

  if (repeat !== Infinity && repeat > 1) {
    let count = 1;
    audio.onended = () => {
      if (count++ < repeat) {
        const replay = sound.cloneNode();
        replay.volume = volume;
        replay.play();
        activeAmbients[name] = replay;
      } else {
        delete activeAmbients[name];
      }
    };
  }
}

