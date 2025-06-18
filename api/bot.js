// api/bot.js


const TOKEN = '7883351227:AAELRDLaZLimPbLVZVAV0I4ZRYP1c6tQMH8';
const WEB_APP_URL = 'https://v0-ziontrade1.vercel.app/';
const SUPABASE_URL = 'https://ytuiwwlkkqsuhbohywfb.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dWl3d2xra3FzdWhib2h5d2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDkwNTEsImV4cCI6MjA2NTI4NTA1MX0.TeGoGVt40_jC5kE9tWv39_WX0mRn2qbM1wGRb862Ct8';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const data = req.body;
  const message = data.message;

  if (!message || !message.chat || !message.from) {
    return res.status(400).send('Invalid message structure');
  }

  const chatId = message.chat.id;
  const fromId = message.from.id?.toString();
  const fromUsername = message.from.username || 'unknown';

  const text = message.text || '';
  const isStartWithReferral = text.startsWith('/start ref_');

  if (isStartWithReferral) {
    const referralCode = text.split(' ')[1].replace('ref_', '');

    // 🔎 1. Get referrer's username from user_agreements table
    let referrerUsername = null;

    try {
      const queryUrl = `${SUPABASE_URL}/rest/v1/user_agreements?telegram_id=eq.${referralCode}&select=tg_username`;
      const lookup = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Authorization': `Bearer ${SUPABASE_API_KEY}`
        }
      });

      const refData = await lookup.json();
      if (Array.isArray(refData) && refData.length > 0) {
        referrerUsername = refData[0].tg_username;
      }
    } catch (err) {
      console.error('Failed to look up referrer username:', err);
    }

    // ✅ 2. Insert referral record if username was found
    if (referrerUsername) {
      try {
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/user_referrals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            referrer_telegram_id: referralCode,
            referrer_username: referrerUsername,
            referred_telegram_id: fromId,
            referred_username: fromUsername,
            referral_code: referralCode
          })
        });

        if (!insertRes.ok) {
          console.error('Failed to insert referral:', await insertRes.text());
        }
      } catch (err) {
        console.error('Referral insert error:', err);
      }
    } else {
      console.warn('No matching username found for referrer, skipping insert.');
    }
  }

  // 📦 Send Web App Button
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

  res.status(200).send('OK');
}



