const squareCommands = {
  pause: (args) => {
    const time = args.split(',').find(arg => /^time\s*=/.test(arg))?.split('=')[1].trim() ?? args.trim();
    ms = time.endsWith('ms') ? parseFloat(time.slice(0,-2)) : parseFloat(time.endsWith('s') ? time.slice(0,-1) : time ) * 1000;
    console.log(args,time,ms)
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  load: (args) => {
    const [key, path] = args.split('=').map(s => s.trim());
    const [folder, file] = path.replace('./', '').split('/');
    if (folder === "Sounds") curlySounds[key] = vfs.Sounds.get(file);
    else {
      const fileText = vfs[folder].get(file)
      if (!fileText) throw new Error(`No such file or directory: '${path}'`)
      if (!typeof fileText === "string") throw new Error(`incorrect filetype: '${path}'`)
      const fileLines = fileText.replace(/^\s*@(scene|end)\s+(.*?)\s*$/g, (_, directive, name) => `@${directive} ${key}.${name}`).split('\n');
      scenes[key] = fileLines;
      scenes = {...scenes,...moduleHandler(fileLines,key)};
    }
  },
  run: (args) => {
    args.split(',').forEach(arg => {
      speakScript(errorBox, parseScript(scenes[arg].join('\n')), voices, settings, squareCommands, curlySounds)
    });
  },
  synth: (args,define=false) => {
    if (define) {
      builtInAmbience[define] = builtInAmbience[define] || {};
      args.split(',').forEach(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        if (key && val) builtInAmbience[define][key] = isNaN(val) ? val : parseFloat(val);
      });
    }
    let tone = {};
    if (builtInAmbience[args.trim()]) tone = builtInAmbience[args.trim()];
    else args.split(',').forEach(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        if (key && val) tone[key] = isNaN(val) ? val : parseFloat(val);
      });

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tone.type || "sine";
    osc.frequency.value = tone.frequency ?? 440;
    gain.gain.value = tone.volume ?? 0.3;

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (tone.duration ?? 1));
  },
  speak: (args) => {
    const params = args.split(',').map(p => p.trim());
    const found_text = params.find(param => /^text\s*=/.test(param))
    const text = found_text?.split('=')[1] ?? params[0];
    const tone = params.find(param => /^tone\s*=/.test(param))?.split('=')[1] ?? (!found_text ? params[1] ?? "normal" : "normal");
    const utterance = new SpeechSynthesisUtterance(text);
    Object.assign(utterance, builtInSpeechTones[tone.trim()]);
    speechSynthesis.speak(utterance);
  }
};

const builtInAmbience = {
  dreamy: { type: "sine", frequency: 440, duration: 2, volume: 0.3 },
  glitch: { type: "square", frequency: 880, duration: 0.3, volume: 0.5 },
  soft:   { type: "triangle", frequency: 220, duration: 4, volume: 0.2 },
  dark:   { type: "sawtooth", frequency: 110, duration: 1.5, volume: 0.4 },
};

const builtInSpeechTones = {
  normal: { pitch: 1, speed: 1, volume: 1 },
  whisper: { pitch: 1.2, speed: 0.8, volume: 0.3 },
  aloud: { pitch: 1.1, speed: 1.2, volume: 1.5 },
  slow: { speed: 0.7 },
  fast: { rate: 2.5 },
  sad: { pitch: 0.9, rate: 0.6, volume: 0.6 },
  angry: { pitch: 1.5, rate: 1.5, volume: 1.4 },
  dreamy: { pitch: 1.4, rate: 0.6, volume: 0.8 }
};


let scenes = {}

const curlySounds = {
  //rain: new Audio('sounds/rain.mp3'), 
  //door: new Audio('sounds/door.mp3'),
};

const vfs = {
  Sounds: new Map(),
  Scripts: new Map([
    ["Syntax.echo",`
#scenes : 
@scene sceneName
# this ^ is how to start a scene, a scene is like a function you can call again and again
@scene anotherScene
# you can nest scenes like this
# to end you can do this:
@end sceneName
# or just this to end latest scene  if any
@end
# you can also
@endAll
# the scene at once


# Commands : 
[pause: 5s]
# 5 | 5s | 5000ms

# you can load another script like this:
[load: name=./Scripts/Syntax.echo]
# to run them do this:
[run: name]
# or if you want to run a specific scene
[run: name.sceneName]
# if the scene is in the current file do this:
[run: sceneName]

[synth: dreamy]
# synth: dreamy | glitch | soft | dark
[synth: type=sine, frequency=440, duration=2, volume=0.3]
# type = sine | square | triangle | sawtooth

# you may instead do this
{dreamy}
# or this
{type=sine, frequency=440, duration=2, volume=0.3}
# you may even choose to define one by
{dark: type=sawtooth, frequency=110, duration=1.5, volume=0.4}

[speak: text=text, tone=whisper]
# tone = normal | whisper | aloud | slow | fast | sad | angry | dreamy
      `],
    ["The_Lore.echo",
      "# ..."
    ],
["?'s_Diary", `
# ?'s Diary
# Write your questions, thoughts, or anything that makes you wonder...
# This is your quiet corner to explore ideas and whispers.
`],
    ["!'s_Notes",`
# !'s Notes
# Jot down your sparks, surprises, or random bursts of genius!
# No rules here — just your own noisy little brainstorm.
`]
  ]),
  Versions: new Map(),
};


function moduleHandler(fileLines){
  const AllScenes = {};
  let current_Scenes = [];
  let commentLevel = 0;
  fileLines.forEach(line => {
    if (/^\s*\[#\s*/.test(line)) {commentLevel++; return;};
    if (/^\s*#\]\s*/.test(line)) {commentLevel = Math.max(0,commentLevel-1); return;}
    if (commentLevel) return;
    if (/^\s*#/.test(line)) return;
    const sceneMatch = line.match(/^\s*@scene\s+(.*?)\s*$/);
    if (sceneMatch) {
      const sceneName = sceneMatch[1];
      if (!AllScenes[sceneName]) AllScenes[sceneName] = [];
      current_Scenes.push(sceneName);
      return;
    };
    const EndMatch = line.match(/^\s*@end\s+(.*?)\s*$/);
    if (EndMatch && current_Scenes.length > 0) {
      EndMatch[1] ? current_Scenes = current_Scenes.filter(scene => scene !== EndMatch[1]) : current_Scenes.pop();
      current_Scenes.forEach(scene => AllScenes[scene].push(line));
      return;
    };
    const EndAllMatch = line.match(/^\s*@endAll\s*$/);
    if (EndAllMatch){
      current_Scenes = [];
      return;
    };
    if (current_Scenes.length > 0) current_Scenes.forEach(scene => AllScenes[scene].push(line));
  })
  return AllScenes;
}