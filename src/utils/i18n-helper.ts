export const replaceBold = {
  pattern: /\{b\}(.*?)\{\/b\}/g,
  replacement: '<strong>$1</strong>'
}

export const replaceLink = {
  pattern: /\{a\}text="(.*?)" url="(.*?)"\{\/a\}/g,
  replacement: '<a href="$2" style="text-decoration: underline" target="_blank">$1</a>'
}

export const replaceItalicizedAside = {
  pattern: /\{i\}(.*?)\{\/i\}/g,
  replacement: '<i>$1</i>'
}

export const replaceItalicizedEmphasis = {
  pattern: /\{i\}(.*?)\{\/i\}/g,
  replacement: '<em>$1</em>'
}

export const replaceItalicizedOther = {
  pattern: /\{i\}(.*?)\{\/i\}/g,
  replacement: '<span class="italic">$1</span>'
}
