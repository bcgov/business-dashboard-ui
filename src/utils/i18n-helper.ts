export const replaceBold = {
  pattern: /\{b\}(.*?)\{\/b\}/g,
  replacement: '<strong>$1</strong>'
}

export const replaceLink = {
  pattern: /\{a\}text="(.*?)" url="(.*?)"\{\/a\}/g,
  replacement: '<a href="$2" style="text-decoration: underline" target="_blank">$1</a>'
}
