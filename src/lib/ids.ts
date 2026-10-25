import { customAlphabet } from "nanoid";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const createSlug = customAlphabet(ALPHABET, 8);

export const createToken = customAlphabet(ALPHABET, 32);
