const { loadImage, createCanvas } = require('@napi-rs/canvas');
const path = require('path');

async function testLogo() {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo', 'logo.svg');
  console.log('Testing logo load from:', logoPath);
  try {
    const img = await loadImage(logoPath);
    console.log(`✅ LOGO LOADED SUCCESSFULLY! Dimensions: ${img.width}x${img.height}`);
  } catch (err) {
    console.error('❌ LOGO LOAD FAILED:', err.message);
  }
}

testLogo();
