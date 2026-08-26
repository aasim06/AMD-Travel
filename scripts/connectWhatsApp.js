const path = require('path');

const projectPath = process.cwd();
const baileys = require(path.join(projectPath, 'node_modules/@whiskeysockets/baileys'));
const makeWASocket = baileys.default || baileys;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;
const qrcodeTerminal = require(path.join(projectPath, 'node_modules/qrcode-terminal'));
const pino = require(path.join(projectPath, 'node_modules/pino'));

async function startWhatsAppGatewayCLI() {
  const authFolder = path.join(projectPath, 'auth_info_baileys');
  console.log('\n🚀 Starting Baileys WhatsApp Gateway CLI...');
  console.log(`📁 Auth Directory: ${authFolder}\n`);

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`⚡ Baileys Version: [${version.join('.')}]`);
  console.log('⏳ Initializing socket & generating QR Code...\n');

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['AMD Global Travel Gateway', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('==================================================');
      console.log('📲 SCAN THIS QR CODE WITH YOUR WHATSAPP PHONE:');
      console.log('==================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('\n==================================================');
      console.log('Waiting for QR scan... (WhatsApp -> Linked Devices -> Link a Device)');
      console.log('==================================================\n');
    }

    if (connection === 'open') {
      console.log('\n🟢 [WhatsApp Baileys] GATEWAY CONNECTED SUCCESSFULLY!');
      console.log('✅ Session saved to auth_info_baileys/');
      console.log('You can now close this script (Ctrl+C). Automated notifications are active!\n');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.warn(
        `\n⚠️ Connection closed (Status: ${statusCode || 'unknown'}). Reconnecting: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        console.log('🔄 Attempting automatic reconnection in 3 seconds...');
        setTimeout(startWhatsAppGatewayCLI, 3000);
      } else {
        console.log('❌ Logged out. Session cleared. Please run npm run whatsapp:connect again.');
      }
    }
  });
}

startWhatsAppGatewayCLI().catch(console.error);
