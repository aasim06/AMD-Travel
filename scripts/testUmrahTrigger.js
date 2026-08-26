const http = require('http');

const data = JSON.stringify({
  packageTitle: 'Economy 14 Days Umrah Package',
  packageCategory: 'Economy 3-Star',
  departureCity: 'Frankfurt Airport (FRA)',
  departureDate: '2026-09-10',
  adults: 2,
  totalPilgrims: 2,
  totalAmount: 1850,
  currency: 'EUR',
  customerName: 'Asim Ameer',
  customerEmail: 'asimameer06@gmail.com',
  customerPhone: '03060112606',
  passportNo: 'PAK-778899'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/bookings/umrah',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('UMRAH TEST RESPONSE:', body));
});

req.on('error', e => console.error('ERROR:', e));
req.write(data);
req.end();
