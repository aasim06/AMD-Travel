const fs = require('fs');
const https = require('https');
const path = require('path');

const targetPath = path.join(process.cwd(), 'public', 'images', 'umrah_kaaba.jpg');
const imageUrl = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1000&q=85';

console.log('Downloading high-resolution Holy Kaaba image to local disk:', targetPath);

const file = fs.createWriteStream(targetPath);
https.get(imageUrl, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, (res2) => {
      res2.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ Local Holy Kaaba image downloaded successfully! Size:', fs.statSync(targetPath).size, 'bytes');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✅ Local Holy Kaaba image downloaded successfully! Size:', fs.statSync(targetPath).size, 'bytes');
    });
  }
}).on('error', (err) => {
  console.error('Error downloading image:', err);
});
