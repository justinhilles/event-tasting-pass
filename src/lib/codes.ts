const MANUAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createManualCode(length = 6) {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += MANUAL_CODE_ALPHABET[Math.floor(Math.random() * MANUAL_CODE_ALPHABET.length)];
  }

  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

