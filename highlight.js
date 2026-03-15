function highlightSyntax(text) {
  const lines = text.split('\n');
  let commentLevel = 0;

  return lines.map((line) => {
    const escaped = escapeHTML(line);
    if (/^\s*\[#\s*/.test(line)) {commentLevel++; return `<span class="comment-block">${escaped}</span>`;};
    if (/^\s*#\]\s*/.test(line)) {commentLevel = Math.max(0,commentLevel-1); return `<span class="comment-block">${escaped}</span>`;}
    if (commentLevel) return `<span class="comment-block">${escaped}</span>`;
    if (/^\s*#/.test(line)) return `<span class="comment">${escaped}</span>`;
    if (/^\s*@scene\s*/.test(line)) { return `<span class="scene-tag">${escaped}</span>`; }
    if (/^\s*@end(All)?\s*/.test(line)) { return `<span class="scene-end">${escaped}</span>`; }
    return escaped
      .replace(/&quot;(.*?)&quot;/g, `<span class="quotation">"$1"</span>`)
      .replace(/&#039;(.*?)&#039;/g, `<span class="quotation">'$1'</span>`)
      .replace(/^([^\s:[({]+\s*):/g, `<span class="character">$1</span>:`)
      .replace(/\((.*?)\)/g, `<span class="parenthesis">($1)</span>`)
      .replace(/\[(.*?)\]/g, `<span class="square">[$1]</span>`)
      .replace(/{(.*?)}/g, `<span class="curly">{$1}</span>`)
      .replace(/\*\*(.*?)\*\*/g, `<span class="bold">**$1**</span>`)
      .replace(/\*(.*?)\*/g, `<span class="italic">*$1*</span>`)
      .replace(/__(.*?)__/g, `<span class="bold">__$1__</span>`)
      .replace(/_(.*?)_/g, `<span class="italic">_$1_</span>`)
      .replace(/(\.{3,})/g, `<span class="elipses">$1</span>`);
  }).join('<br>');
}


function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function syncHighlight(inputBox,highlightLayer){
  const maxScroll = highlightLayer.scrollHeight - highlightLayer.clientHeight;
  if (inputBox.scrollTop > maxScroll) inputBox.scrollTop = maxScroll;
  highlightLayer.scrollTop = inputBox.scrollTop;
}