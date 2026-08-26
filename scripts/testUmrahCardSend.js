const http = require('http');

const data = JSON.stringify({
  packageTitle: 'Noor Economy Package',
  packageCategory: 'Economy 3-Star',
  packageImage: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&q=80',
  departureCity: 'Frankfurt, Germany',
  departureDate: '2026-09-09',
  adults: 1,
  totalPilgrims: 1,
  totalAmount: 1199,
  currency: 'EUR',
  customerName: 'Aasim Ameer',
  customerEmail: 'aasimameer06@gmail.com',
  customerPhone: '03060112606',
  passportNo: 'PAK-991122'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/bookings/umrah',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('DYNAMIC UMRAH KAABA PHOTO TEST RESPONSE:', body));
});

req.on('error', e => console.error('ERROR:', e));
req.write(data);
req.end();
