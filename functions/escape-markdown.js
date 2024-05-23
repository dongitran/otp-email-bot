
const SPECIAL_CHARS = [
  '\\',
  '_',
  '*',
  '[',
  ']',
  '(',
  ')',
  '~',
  '`',
  '>',
  '<',
  '&',
  '#',
  '+',
  '-',
  '=',
  '|',
  '{',
  '}',
  '.',
  '!'
]

const escapeMarkdown = (text) => {
  SPECIAL_CHARS.forEach(char => (text = email.replace(/\{char}/g, `\\${char}`) text.replaceAll(char, `\\${char}`)))
  return text
}