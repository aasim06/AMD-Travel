const { loadImage } = require('@napi-rs/canvas');

async function testFetch() {
  const urls = [
    'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&q=80',
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80',
    'https://raw.githubusercontent.com/public-media/makkah.jpg'
  ];

  for (const u of urls) {
    const start = Date.now();
    try {
      const img = await loadImage(u);
      console.log(`✅ SUCCESS (${Date.now() - start}ms): ${u.slice(0, 50)}... [${img.width}x${img.height}]`);
    } catch (err) {
      console.error(`❌ FAILED (${Date.now() - start}ms): ${u.slice(0, 50)}... Error: ${err.message}`);
    }
  }
}

testFetch();
