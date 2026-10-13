'use strict';

/* Vercel Node function: принимает событие с сайта и пересылает его в Telegram.
   Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
   Не читает и не пересылает IP, user agent и прочие заголовки. */

const EVENTS = {
  opened: '👀 Открыла сайт',
  gate_answer: '📝 Ответ на вопрос',
  gate_passed: '🔓 Прошла проверку личности',
  video_started: '▶️ Начала смотреть видео',
  video_ended: '🎬 Досмотрела видео до конца',
  contract_signed: '✍️ Подписала договор!',
  instagram_clicked: '📲 Нажала «Открыть профиль»',
  unblocked_clicked: '🔓 Нажала «Готово, разблокировала»',
  macaron_choice: '🍪 Гоу в Макаронную?',
  dm_clicked: '💬 Нажала «Написать в Direct»',
};

const MACARON_CHOICES = {
  now: 'Гоу! 🍪',
  later: 'Гоу, но в другой день 📅',
};

const MAX_TEXT = 200;
const TIME_ZONE = 'Asia/Bishkek';

function cleanString(value, max = MAX_TEXT) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatTime(ts) {
  const now = Date.now();
  // Время клиента принимаем, только если оно правдоподобно (±1 сутки)
  const time = Number.isFinite(ts) && Math.abs(now - ts) < 864e5 ? ts : now;
  return new Date(time).toLocaleString('ru-RU', { timeZone: TIME_ZONE });
}

function buildMessage(event, data, ts) {
  const lines = [`<b>${EVENTS[event]}</b>`];

  if (event === 'gate_answer') {
    const n = Number.isInteger(data.n) && data.n > 0 && data.n < 10 ? data.n : '?';
    const question = cleanString(data.question);
    const answer = cleanString(data.answer, 80);
    lines[0] = `<b>📝 Вопрос ${n}: ${data.correct === true ? '✅ верно' : '❌ мимо'}</b>`;
    if (question) lines.push(`<i>${escapeHtml(question)}</i>`);
    lines.push(`Ответ: «${escapeHtml(answer) || '—'}»`);
  }

  if (event === 'contract_signed') {
    const name = cleanString(data.name, 40);
    lines.push(`Имя в договоре: ${name ? `<i>${escapeHtml(name)}</i>` : '— (не вписала)'}`);
  }

  if (event === 'macaron_choice') {
    lines.push(`Выбрала: <b>${MACARON_CHOICES[data.choice] || '—'}</b>`);
  }

  lines.push(`🕒 ${formatTime(ts)}`);
  return lines.join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'bad_body' });
  }

  const event = body.event;
  if (typeof event !== 'string' || !Object.prototype.hasOwnProperty.call(EVENTS, event)) {
    return res.status(400).json({ ok: false, error: 'unknown_event' });
  }

  const data = body.data && typeof body.data === 'object' ? body.data : {};
  const text = buildMessage(event, data, Number(body.ts));

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!tg.ok) return res.status(502).json({ ok: false, error: 'telegram_error' });
  } catch (_) {
    return res.status(502).json({ ok: false, error: 'telegram_unreachable' });
  }

  return res.status(200).json({ ok: true });
};
