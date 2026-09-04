import sharp from "sharp";
import { fileURLToPath } from "node:url";

const mark = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="220" fill="#F3EEE5"/>
  <path d="M246 208h444c64 0 116 52 116 116v278c0 64-52 116-116 116H462L286 844v-126h-40c-64 0-116-52-116-116V324c0-64 52-116 116-116z" fill="#24211D"/>
  <circle cx="746" cy="682" r="128" fill="#DE633D"/>
  <path d="M350 383h238c78 0 141 63 141 141s-63 141-141 141H476v-88h112c29 0 53-24 53-53s-24-53-53-53H438v238h-88V383z" fill="#FFFDF8"/>
</svg>`;

await sharp(Buffer.from(mark))
  .png()
  .toFile(fileURLToPath(new URL("../public/app-icon.png", import.meta.url)));
