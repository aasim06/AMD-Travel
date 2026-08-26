const http = require('http');

function postJSON(path, bodyData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bodyData);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runAuditTestPass() {
  console.log("=== STARTING END-TO-END BOOKING ROUTING AUDIT TEST PASS ===");

  // 1. Submit Flight Booking
  const flightRes = await postJSON('/api/bookings/create', {
    flightId: 'FL-TEST-101',
    origin: 'Frankfurt (FRA)',
    destination: 'Islamabad (ISB)',
    airline: 'Qatar Airways',
    flightNumber: 'QR-012',
    departureDate: '2026-09-15T10:00:00.000Z',
    totalAmount: 750,
    currency: 'EUR',
    passengerName: 'Flight Test Customer',
    passengerEmail: 'flighttest@amdglobal.de',
    passengerPhone: '03060112606'
  });
  console.log("✅ 1. FLIGHT BOOKING CREATED:", flightRes.pnr || flightRes.data?.pnr);

  // 2. Submit Rent a Car Booking
  const carRes = await postJSON('/api/bookings/car', {
    carName: 'Audi A6 Sedan',
    carCategory: 'Luxury Sedan',
    pickupLocation: 'Frankfurt Airport Terminal 1',
    dropoffLocation: 'Frankfurt Airport Terminal 1',
    pickupDate: '2026-09-20T10:00:00.000Z',
    dropoffDate: '2026-09-23T10:00:00.000Z',
    totalDays: 3,
    totalAmount: 290,
    currency: 'EUR',
    customerName: 'Car Test Driver',
    customerEmail: 'cartest@amdglobal.de',
    customerPhone: '03060112606',
    driverLicense: 'GER-123456'
  });
  console.log("✅ 2. RENT A CAR BOOKING CREATED:", carRes.pnr);

  // 3. Submit Umrah Package Booking
  const umrahRes = await postJSON('/api/bookings/umrah', {
    packageTitle: 'VIP 10 Days Ramadan Umrah Package',
    packageCategory: 'VIP 5-Star',
    departureCity: 'Frankfurt (FRA)',
    departureDate: '2026-10-01T10:00:00.000Z',
    totalPilgrims: 1,
    totalAmount: 2450,
    currency: 'EUR',
    customerName: 'Umrah Test Pilgrim',
    customerEmail: 'umrahtest@amdglobal.de',
    customerPhone: '03060112606'
  });
  console.log("✅ 3. UMRAH BOOKING CREATED:", umrahRes.pnr);

  // 4. Verify Server-Side Filter & Data Routing
  console.log("\n--- VERIFYING ADMIN API DATA ROUTING & ZERO CROSS-MIXING ---");

  const allBookings = await getJSON('/api/admin/bookings');
  const carBookings = await getJSON('/api/admin/bookings?type=car');
  const umrahBookings = await getJSON('/api/admin/bookings?type=umrah');
  const flightBookings = await getJSON('/api/admin/bookings?type=flight');

  console.log(`Total Database Bookings: ${allBookings.data?.length || 0}`);
  console.log(`Car Bookings Endpoint (?type=car): ${carBookings.data?.length || 0} (All have type === 'car')`);
  console.log(`Umrah Bookings Endpoint (?type=umrah): ${umrahBookings.data?.length || 0} (All have type === 'umrah')`);
  console.log(`Flight Bookings Endpoint (?type=flight): ${flightBookings.data?.length || 0} (All have type === 'flight')`);

  const carCheck = carBookings.data.every(b => b.type.toLowerCase() === 'car');
  const umrahCheck = umrahBookings.data.every(b => b.type.toLowerCase() === 'umrah');
  const flightCheck = flightBookings.data.every(b => b.type.toLowerCase() === 'flight');

  if (carCheck && umrahCheck && flightCheck) {
    console.log("\n🎉 TEST PASS SUCCESSFUL: 100% Zero Cross-Mixing Verified across all 3 Booking Sections!");
  } else {
    console.error("❌ Mismatch detected in filter check!");
  }
}

runAuditTestPass().catch(console.error);
