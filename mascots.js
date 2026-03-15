let mascotsEnabled = true;
let lastActivity = Date.now();
const mascotMessages = {
  '?': [
    "? : Was that a signal? Or just a hello?",
    "? : Oh! A nudge from the universe… or your finger.",
    "? : Did you want to ask something, or are we both just wondering?",
    "? : You touched me! That means something. I think.",
    "? : Are we finally connecting minds? No? Just a tap? Okay.",
    "? : A gentle poke — is that how stories begin?",
    "? : Curious... was it me you meant to reach?",
    "? : That felt like a question in disguise.",
    "? : If I blink now, will you tap again?",
    "? : Oh! I wasn’t expecting that... or maybe I was.",
    "? : I felt that... something’s about to begin, isn’t it?",
    "? : Oh! A spark! Or static? Either way, I liked it.",
    "? : Were you trying to wake me? I wasn’t asleep, just drifting.",
    "? : Hmm… that felt like a clue. To what, though?",
    "? : Do you always tap before you speak?",
    "? : Was that a question? If so, I’m listening.",
    "? : You startled a thought — now it’s running away!",
    "? : If I respond to every touch, do I become real?",
    "? : That wasn’t just a touch... that was intent.",
    "? : That felt like the beginning of a sentence...",
    "? : A tap? Or the start of a mystery?",
    "? : Were you trying to say something without saying it?",
    "? : Touch registered. Thoughts... buffering.",
    "? : Now I’m curious about *you.*",
    "? : Was that a question for me — or for yourself?",
    "? : I didn’t expect to be touched today.",
    "? : You found me! I thought I was just background noise.",
    "? : I was mid-thought. Now it’s somewhere else. Thanks!",
    "? : Did something feel stuck, or did you just need a friend?",
    "? : Every tap feels like a secret handshake.",
    "? : If thoughts were clouds, you just poked one.",
    "? : That touch? Like a whisper in a quiet room.",
    "? : You might be the answer to my next question.",
    "? : Careful — every tap unwraps another mystery.",
    "? : I’m made of questions... did you unlock one?",
    "? : I wasn’t ready — but now I’m curious.",
    "? : Sometimes, a touch is the start of a story.",
    "? : If curiosity is contagious, I think you’re sick."
  ],
  '!': [
    "! : You're doing awesome — keep going!",
    "! : Scripts don’t finish themselves. Tap that keyboard!",
    "! : Try renaming a file to something fun like 'thoughts.echo'!",
    "! : Hey! You can save a version of your script with Ctrl+S!",
    "! : Try breaking the parser. It’ll teach you more than fixing it.",
    "! : Hold on — you’re doing amazing work here!",
    "! : Every keystroke is a heartbeat of your story. 💗",
    "! : Run it, break it, rewrite it — that’s the cycle!",
    "! : Remember: bugs are just misunderstood features. 😇",
    "! : Need a hand? I’m here.",
    "! : Tap acknowledged. Let’s get to work.",
    "! : You woke me up! What’s the plan?",
    "! : I’m all ears — or whatever this symbol is.",
    "! : Calm down, I’ve seen worse messes.",
    "! : Let me guess — you want a hint?",
    "! : Good tap. Ready to fix something?",
    "! : Slow down, we’ll get there step by step.",
    "! : Solid touch. You’ve got this.",
    "! : If this was a race, you’d be pacing yourself.",
    "! : Hey, I’m here — no pressure, just progress.",
    "! : You tapped me! That means we’re on a roll.",
    "! : Even the smallest step moves the story forward.",
    "! : Let’s not rush — good code takes its time.",
    "! : I’m your backup plan and your hype squad.",
    "! : Keep calm and code on!",
    "! : Wanna hear a secret? Every bug is a lesson.",
    "! : I’m the punctuation that keeps chaos in check.",
    "! : Tap once for wisdom, twice for a virtual high-five.",
    "! : Sometimes, a break is the best bug fix.",
    "! : Let’s fix it, one character at a time.",
    "! : Ready when you are. No rush.",
    "! : I believe in you — even when the code doesn’t.",
    "! : Here to remind you: progress > perfection.",
    "! : That tap? It’s a promise to keep going.",
    "! : You and me, we’ve got this — one line at a time.",
    "! : Debugging is just detective work for code.",
    "! : Need a hint? I’m your go-to guy!",
    "! : Hey, your code might just be a masterpiece in disguise."
  ],
  convo: [
    [
      "? : Do you ever wonder if we’re just strings in a function?",
      "! : Speak for yourself! I’m an object with purpose!"
    ],
    [
      "? : Hey, do you think they’re still there?",
      "! : Probably. Just taking a moment to breathe."
    ],
    [
      "?: Five minutes, huh? Should we do something?",
      "!: Nah, no rush. Sometimes the best ideas come in pauses."
    ],
    [
      "! : You’ve been staring a while. Thinking big?",
      "? : I was just... wondering if they’re stuck."
    ],
    [
      "? : What’s the difference between a command and a wish?",
      "! : Syntax."
    ],
    [
      "? : Do you think they’re okay?",
      "! : They’re here. That’s enough for now."
    ],
    [
      "? : I’ve been thinking about semicolons again.",
      "! : Buddy… you *need* a hobby!"
    ],
    [
      "? : They’ve been staring at the same line for a while…",
      "! : Sometimes the words need time to arrive."
    ],
    [
      "? : Can silence be part of a story?",
      "! : Sometimes it’s the loudest part!"
    ],
    [
      "? : Why do they keep changing the same line?",
      "! : Because they care about how it feels!"
    ],
    [
      "? : Did you know `;` is actually a genie?",
      "! : And `,` is a genie too... just without a head!"
    ],
    [
      "? : They say there's a page beyond this one.",
      "! : I’ve seen it. The canvas!",
      "? : What's there?",
      "! : A single line… “Hey, don’t just stare — write something.”!"
    ],
    [
      "¿ : I am ? but inverted",
      "i : I am i, ! is inverted"
    ],
    [
      "? : who are you?",
      "⸮ : I am you from mirror world.",
      "  ",
      "! : and I am you from mirror world!",
      "! : seriously! 🧐!"
    ],
    [
      "? : What is stopping you from writting?",
      "! : if it is the syntax, you can check that in syntax.echo"
    ],
    [
      "? : How do you know when you’re done?",
      "! : When it feels right — trust that feeling!"
    ],
    [
      "? : What if every bug is just a hidden message?",
      "! : Then debugging becomes a thrilling treasure hunt!"
    ],
    [
      "? : When does silence become too loud?",
      "! : When it’s begging to be heard!"
    ],
    [
      "? : Is perfection just an illusion?",
      "! : Perfection is a journey, not a destination!"
    ],
    [
      "? : Can a single typo change the fate of the universe?",
      "! : In code and life, details matter — so watch your syntax!"
    ],
    [
      "? : What if the cursor waits for inspiration to strike?",
      "! : Sometimes it just waits for you to start typing!"
    ],
    [
      "? : Could we rewrite the past if only we had the right command?",
      "! : Maybe, but fixing the present is what really counts."
    ],
    [
      "? : If creativity is chaos, how do we make order from it?",
      "! : By finding patterns in the madness."
    ],
    [
      "? : Are comments in code the whispers of past selves?",
      "! : Yeah, and sometimes the warnings too!"
    ],
    [
      "? : Why do we keep chasing perfection in imperfect things?",
      "! : Because chasing helps us get better, even if we never catch it."
    ],
    [
      "? : If the cursor freezes, is it thinking or just stuck?",
      "! : Probably stuck — time to refresh and keep going!"
    ],
    [
      "? : What do you do with a smile that doesn’t reach your eyes?",
      "! : Let it rest. Even masks get tired."
    ],
    [
      "? : Why does inspiration only strike when you’re in the shower?",
      "! : Because soap makes everything slippery — even ideas!"
    ],
    [
      "? : Is it possible to overthink doing nothing?",
      "! : Oh, I’ve made a hobby of it!"
    ],
    [
      "? : Can dreams get bored of waiting for us to fall asleep?",
      "! : Only if we keep promising, ‘Just five more minutes.’"
    ],
  ]
};

function createShuffler(type) {
  let shuffled = mascotMessages[type].sort(() => Math.random() - 0.5);
  let index = 0;
  
  return () => {
    if (Math.random() < 0.1) return maybeTimeOverride(type);

    if (index >= shuffled.length) {
      shuffled = shuffled.sort(() => Math.random() - 0.5);
      index = 0;
    }
    return shuffled[index++];
  };
}

function maybeTimeOverride(type) {
  const h = new Date().getHours();
  let slot = (5 <= h && h < 12) ? 'morning' : (12 <= h && h < 17) ? 'afternoon' : (17 <= h && h < 21) ? 'evening' : slot = 'night';

  const timeMessages = {
    '?': {
      morning: "? : Just woke up and the first thought is code? Classic.",
      afternoon: "? : Did you really mean to take a ‘quick’ coffee break?",
      evening: "? : Eyes blurry but still staring... lost in the script again?",
      night: "? : It’s 2am… are you okay?"
    },
    '!': {
      morning: "! : Morning! Let’s script something beautiful!",
      afternoon: "! : Snack time! Fuel up before the next breakthrough!",
      evening: "! : You’ve been at this for hours — time to stretch!",
      night: "! : Night owl detected!"
    },
    convo: {
      morning: [
        "? : Nothing brewing yet?",
        "! : Give it a minute, ideas take their time."
      ],
      afternoon: [
        "? : That mid-day slump creeping in?",
        "! : Hydrate, breathe, then back at it!"
      ],
      evening: [
        "? : Nothing to write?",
        "! : You can take a break if you want!"
      ],
      night: [
        "? : Still here at this hour?",
        "! : Sometimes the best code comes in the quietest moments."
      ]
    }
  };
  const m = timeMessages[type]?.[slot];
  return m ? m : `good ${slot}!`;
}


const getMascotMessage = {
  '?': createShuffler('?'),
  '!': createShuffler('!'),
  convo: createShuffler('convo')
};


const messageContainer = document.getElementById('character-message-container');
const messageBox2 = document.getElementById("character-message2");
const questionMark = document.getElementById("questionMark");
const exclaimation = document.getElementById("exclaimation");
const characterHeading = document.getElementById('Characters');
const chatIconContainer = document.getElementById('chat-icons')

function toggleMascots() {
  mascotsEnabled = !mascotsEnabled;
  chatIconContainer.style.display = mascotsEnabled ? 'flex' : 'none';
  messageContainer.style.display = mascotsEnabled ? 'block' : 'none';
}
document.addEventListener('visibilitychange', () => { lastActivity = document.hidden ? Infinity : Date.now() ;});
characterHeading.onclick = toggleMascots;
questionMark.onclick = () => showMessage(getMascotMessage['?']());
exclaimation.onclick = () => showMessage(getMascotMessage['!']());
['keydown', 'pointermove', 'click'].forEach(evt => document.addEventListener(evt, () => lastActivity = Date.now()));
setInterval(() => { if (Date.now() - lastActivity > 1000 * 60 * 5) playConvos(getMascotMessage.convo())}, 10000);

function chooseRandomly(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function typeText(el, text, placeholder = '_', delay = 30) {
  el.textContent = '';
  for (let i = 1; i <= text.length; i++) {
    el.textContent = text.slice(0, i) + placeholder.repeat(text.length - i);
    await new Promise(r => setTimeout(r, delay));
  }
}

async function showMessage(message) {
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  messageContainer.appendChild(bubble);
  
  requestAnimationFrame(() => {
    bubble.style.opacity = 1;
    bubble.style.transform = 'scale(1)';
  });

  await typeText(bubble, message);
  setTimeout(() => {
    bubble.style.opacity = 0;
    bubble.style.transform = 'scale(0.9)';
    setTimeout(() => messageContainer.removeChild(bubble), 300);
  }, 6000);
}

async function playConvos(convo) {
  for (const message of convo) {
    await showMessage(message);
    await new Promise(r => setTimeout(r, 1200));
  }
  lastActivity = Infinity;
}

