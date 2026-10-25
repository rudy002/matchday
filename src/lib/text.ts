const TAB = 9;
const FIRST_PRINTABLE = 32;
const DELETE = 127;

function isControlCharacter(character: string): boolean {
  const code = character.codePointAt(0) ?? FIRST_PRINTABLE;
  return code !== TAB && (code < FIRST_PRINTABLE || code === DELETE);
}

export function hasControlCharacters(value: string): boolean {
  return [...value].some(isControlCharacter);
}

export function stripControlCharacters(value: string): string {
  return [...value]
    .filter((character) => !isControlCharacter(character))
    .join("");
}
