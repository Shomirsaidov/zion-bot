// api/bot.js

const TOKEN = '7186220407:AAFbR2vuSlM83uYlo6hJkBlnHKKwqIJ6Hog';
const WEB_APP_URL = 'https://v0-ziontrade.vercel.app/'; // Replace with your actual Telegram Web App URL

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const data = req.body;

  if (data.message?.text === '/start') {
    const chatId = data.message.chat.id;

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Нажмите снизу чтоб открыть приложение:',
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Запустить', web_app: { url: WEB_APP_URL } }
          ]]
        }
      })
    });
  }

  res.status(200).send('OK');
}
