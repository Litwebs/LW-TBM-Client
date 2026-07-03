import sharp from "sharp";

const SRC = "public/images/tbm-logo.png";
const OUT = "public/images/header-texture.png";

// 1) Extract a fabric-only corner from the real logo (crest is centered).
const TILE = 300;
const corner = await sharp(SRC)
  .extract({ left: 24, top: 24, width: TILE, height: TILE })
  .toBuffer();

// 2) Build a seamless 2xTILE tile by mirror-tiling the corner.
const flop = await sharp(corner).flop().toBuffer(); // mirror horizontally
const flip = await sharp(corner).flip().toBuffer(); // mirror vertically
const flipflop = await sharp(corner).flip().flop().toBuffer();

const seamless = await sharp({
  create: {
    width: TILE * 2,
    height: TILE * 2,
    channels: 3,
    background: { r: 7, g: 24, b: 51 },
  },
})
  .composite([
    { input: corner, left: 0, top: 0 },
    { input: flop, left: TILE, top: 0 },
    { input: flip, left: 0, top: TILE },
    { input: flipflop, left: TILE, top: TILE },
  ])
  .png()
  .toBuffer();

// 3) Tile the seamless texture across a wide header strip and unify the tone.
const W = 2400;
const H = 600;

const navyWash = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <radialGradient id="g" cx="50%" cy="42%" r="60%">
         <stop offset="0%" stop-color="#12305a" stop-opacity="0.35"/>
         <stop offset="60%" stop-color="#0a1f3d" stop-opacity="0.18"/>
         <stop offset="100%" stop-color="#050f1f" stop-opacity="0.55"/>
       </radialGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
   </svg>`,
);

await sharp({
  create: { width: W, height: H, channels: 3, background: { r: 7, g: 24, b: 51 } },
})
  .composite([
    { input: seamless, tile: true, blend: "over" },
    { input: navyWash, blend: "over" },
  ])
  .png({ quality: 90 })
  .toFile(OUT);

console.log("[texture] wrote", OUT);
