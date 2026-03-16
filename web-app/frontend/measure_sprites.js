const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const spritesDir = 'web-app/frontend/public/sprites';
const characters = ['luffy', 'zoro', 'sanji', 'nami', 'chopper', 'robin', 'usopp'];

async function measure() {
  for (const char of characters) {
    const filePath = path.join(spritesDir, `${char}.png`);
    if (fs.existsSync(filePath)) {
      const img = await loadImage(filePath);
      console.log(`${char}: ${img.width}x${img.height}`);
    } else {
      console.log(`${char}: not found`);
    }
  }
}

measure();
