const path = require('path');

const projectPath = process.cwd();
const { sendCarBookingWhatsApp } = require(path.join(projectPath, 'src/lib/whatsappService'));

async function testNewCard() {
  console.log('Testing new generateCarBookingCard integration...');

  const result = await sendCarBookingWhatsApp({
    pnr: 'AMD-CAR-991122',
    driverName: 'Ahmad Raza',
    phone: '03060112606',
    carName: 'BMW X5',
    carCategory: 'Luxury SUV',
    carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    pickupLocation: 'Frankfurt Airport Terminal 1',
    pickupDate: '26 Aug 2026 10:00 AM',
    returnDate: '29 Aug 2026 10:00 AM',
    totalDays: 3,
    totalAmount: 360,
    currency: 'EUR',
    driverLicense: 'PAK-998877'
  });

  console.log('NEW CAR VOUCHER CARD DISPATCH RESULT:', result);
}

testNewCard().catch(console.error);
