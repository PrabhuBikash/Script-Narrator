function normalizeScript(rawScript) {
  const lines = rawScript.split("\n");
  const mergedLines = [];
  let current_Scenes = [];
  let commentLevel = 0;
  function processLine(line) {
    if (/^\s*\[#\s*/.test(line)) {commentLevel++; return;};
    if (/^\s*#\]\s*/.test(line)) {commentLevel = Math.max(0,commentLevel-1); return;}
    if (commentLevel) return;
    if (/^\s*#/.test(line)) return;
    const sceneMatch = line.match(/^\s*@scene\s+(.*?)\s*$/);
    if (sceneMatch) {
      const sceneName = sceneMatch[1];
      current_Scenes.forEach(scene => scenes[scene].push(line));
      if (!scenes[sceneName]) scenes[sceneName] = [];
      current_Scenes.push(sceneName);
      return;
    };
    const EndMatch = line.match(/^\s*@end\s+(.*?)\s*$/);
    if (EndMatch && current_Scenes.length > 0) {
      EndMatch[1] ? current_Scenes = current_Scenes.filter(scene => scene !== EndMatch[1]) : current_Scenes.pop();
      current_Scenes.forEach(scene => scenes[scene].push(line));
      return;
    };
    const EndAllMatch = line.match(/^\s*@endAll\s*$/);
    if (EndAllMatch){
      current_Scenes = [];
      return;
    };
    if (current_Scenes.length > 0) current_Scenes.forEach(scene => scenes[scene].push(line));
    else if (/^\s/.test(line) && mergedLines.length > 0) mergedLines[mergedLines.length - 1] += " " + line.trim();
    else mergedLines.push(line.trim());
  }
  lines.forEach(line => processLine(line))
  return mergedLines;
}




function parseTokens(text) {
  const tokenRegex = /(\((.*?)\)|\[(.*?)\]|\{(.*?)\}|\.{3,}|\*\*\*(.*?)\*\*\*|\*\*(.*?)\*\*|\*(.*?)\*|___(.*?)___|__(.*?)__|_(.*?)_|"(.*?)"|'(.*?)')/g;
  let result = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) result.push({ type: "text", value: text.slice(lastIndex, match.index) });

    bracket = match[0];
    const starters = {
      "(": "parenthesis",
      "[": "square",
      "{": "curly",
      ".": "elipses",
      "*": "asterics",
      "_": "underscore",
      "'": "quotation1",
      '"': "quotation2"
    };
    result.push({ type:starters[bracket[0]] ?? "unknown", value:bracket.slice(1, -1).trim() });
    lastIndex = match.index + bracket.length;
  }

  if (lastIndex < text.length) result.push({ type: "text", value: text.slice(lastIndex) });

  return result;
}




function parseScript(rawScript) {
  const normalizedLines = normalizeScript(rawScript)
  const parsed = [];
  normalizedLines.forEach(line => {
    const charMatch = line.match(/^([^\s:[({]+)\s*:(.*)$/);
    if (charMatch) {
      parsed.push({ character:charMatch[1],speech: parseTokens(charMatch[2].trim()) });
    } else if (line.trim() !== "") {
      parsed.push({ character:null, speech: parseTokens(line.trim()) });
    }
  });
  return parsed;
}