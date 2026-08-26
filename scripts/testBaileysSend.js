const path = require('path');

const projectPath = process.cwd();
const baileys = require(path.join(projectPath, 'node_modules/@whiskeysockets/baileys'));
const makeWASocket = baileys.default || baileys;
const { useMultiFileAuthState, fetchLatestBaileysVersion } = baileys;
const pino = require(path.join(projectPath, 'node_modules/pino'));

async function testBaileysDirectSend() {
  const authFolder = path.join(projectPath, 'auth_info_baileys');
  console.log('Reading auth state from:', authFolder);

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['AMD Global Travel Gateway', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection } = update;

    if (connection === 'open') {
      console.log('🟢 Socket OPEN! Sending test WhatsApp message to 923060112606@s.whatsapp.net...');

      try {
        const result = await sock.sendMessage('923060112606@s.whatsapp.net', {
          text: '*AMD Global Travel - Baileys Gateway Test*\n\nYour self-hosted WhatsApp socket gateway is connected & sending live messages successfully! 🚀'
        });

        console.log('✅ TEST MESSAGE SENT SUCCESSFULLY! Message ID:', result?.key?.id);
        setTimeout(() => process.exit(0), 2000);
      } catch (err) {
        console.error('❌ Error sending message:', err);
        process.exit(1);
      }
    }
  });
}

testBaileysDirectSend().catch(console.error);
