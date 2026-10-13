'use strict';

/* =====================================================================
   CONFIG — все тексты, вопросы и ник. Правь только здесь.
   {nick} в строках заменяется на @ник (или «автора этого сайта», если ник пустой).
   ===================================================================== */
const CONFIG = {
  instagramNick: 'alizher.zhx', // твой ник в Instagram без @ — для кнопок «Открыть профиль» и «Написать в Direct»

  // Регистр, лишние пробелы, ё/е и знаки препинания при проверке не важны.
  // hint показывается после 2 неверных попыток.
  questions: [
    {
      question: 'Кто заблокировал одного хорошего человека в Instagram?',
      answers: ['я', 'это я', 'ну я', 'ну это я', 'я заблокировала', 'я же', 'мен', 'виновата'],
      hint: 'Посмотри в зеркало 🪞',
    },
    {
      question: 'Самый вкусный десерт на свете — это…',
      answers: ['макаронс', 'макарон', 'макароны', 'макаронсы', 'макаруны', 'макарунс', 'macarons', 'macaron'],
      hint: 'Маленькие, круглые, разноцветные и французские 🇫🇷',
    },
    {
      question: 'Обещаешь не злиться хотя бы следующие 2 минуты?',
      answers: ['да', 'обещаю', 'да обещаю', 'ок', 'окей', 'ok', 'okay', 'хорошо', 'ладно', 'ну ладно', 'так и быть', 'попробую', 'давай', 'ооба'],
      hint: 'Правильный ответ короткий и начинается на «д» 😉',
    },
  ],

  text: {
    gate: {
      org: 'Министерство сердечных дел',
      system: 'Система идентификации «Та самая», v1.0',
      badge: '🔒 Доступ только для одного человека',
      title: 'Проверка личности',
      subtitle: 'Этот сайт сделан для одного-единственного человека. Сейчас проверим, вы ли это.',
      step: 'Вопрос {n} из {total}',
      placeholder: 'Ваш ответ…',
      check: 'Проверить',
      correct: 'Верно ✓',
      empty: 'Пустой ответ система не принимает 🙂',
      hintPrefix: '💡 Подсказка: ',
      wrong: [
        'Система подозревает, что вы не Она 🤨',
        'Хм… Такого ответа система не ожидала 🧐',
        'Почти! Хотя нет, совсем не почти 😅',
        'Обмануть систему не получится 🕵️‍♀️',
        'Подумайте ещё разок 🤔',
      ],
      scan: [
        'Проверка лица…',
        'Проверка характера…',
        'Проверка обиды…',
        'Проверка любви к макаронс…',
      ],
      success: 'Личность подтверждена ✅',
      successSub: 'Добро пожаловать. Вы — та самая 🌸',
    },

    video: {
      title: 'Вам пришло видеообращение 📩',
      subtitle: 'Включите звук 🔊',
      play: '▶ Смотреть',
      next: 'Дальше →',
    },

    contract: {
      org: 'Министерство сердечных дел',
      title: 'ДОГОВОР № 001',
      subject: 'о разблокировке в Instagram',
      city: 'г. Бишкек',
      bodyBefore: 'Я,',
      namePlaceholder: 'твоё имя',
      bodyAfter: 'при условии покупки мне макаронс, обязуюсь разблокировать {nick} в Instagram.',
      terms: [
        'Количество и цвет макаронс обсуждаются отдельно.',
        'Договор ни к чему не обязывает и расторгается одной улыбкой 🙂',
      ],
      signLabel: 'Подпись:',
      signHint: 'Распишись пальцем ✍️',
      clear: 'Очистить',
      sign: 'Подписываю ✍️',
      signNote: 'Кнопка «Подписываю» станет активной после подписи',
      sealText: 'МИНИСТЕРСТВО СЕРДЕЧНЫХ ДЕЛ • ПОДПИСАНО • ',
    },

    signed: {
      title: 'Договор подписан! 🎉',
      text: 'Спасибо 🥹 Теперь по договору — шаг первый: разблокировать меня.',
      openProfile: 'Открыть профиль ↗',
      unblockHint: 'В профиле: «⋯» → «Разблокировать»',
      unblocked: 'Готово, разблокировала ✅',
    },

    macaron: {
      title: 'Гоу в Макаронную?',
      text: 'Макаронс по договору с меня. Осталось выбрать, когда 🙂',
      now: 'Гоу! 🍪',
      later: 'Гоу, но в другой день 📅',
      dm: 'Написать в Direct ↗',
      replies: {
        now: 'Ура!!! 🥹 Напиши мне в Direct, когда тебе удобно — заберу тебя 🍪',
        later: 'Договорились! Напиши в Direct, какой день тебе подходит — я подстроюсь 📅',
      },
    },
  },
};

/* =====================================================================
   Утилиты
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nick = CONFIG.instagramNick.replace(/^@/, '').trim();

function getText(path) {
  return path.split('.').reduce((obj, key) => (obj == null ? obj : obj[key]), CONFIG.text);
}

function format(str, vars = {}) {
  const all = { nick: nick ? '@' + nick : 'автора этого сайта', ...vars };
  return String(str).replace(/\{(\w+)\}/g, (m, key) => (key in all ? all[key] : m));
}

function normalize(str) {
  return String(str)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,!?…"«»()\-—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickDifferent(list, prev) {
  if (list.length < 2) return list[0];
  let item;
  do { item = list[Math.floor(Math.random() * list.length)]; } while (item === prev);
  return item;
}

function restartAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // перезапуск CSS-анимации
  el.classList.add(className);
}

/* =====================================================================
   Трекинг (POST /api/event → Telegram). Только событие и время, ошибки глотаем.
   ===================================================================== */
function track(event, data = {}) {
  try {
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, ts: Date.now() }),
      keepalive: true,
    }).catch(() => {});
  } catch (_) { /* no-op */ }
}

// Не дублировать событие при перезагрузке страницы в той же вкладке
function trackOncePerSession(event, data) {
  const key = 'tracked:' + event;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch (_) { /* storage недоступен — просто шлём */ }
  track(event, data);
}

/* =====================================================================
   Тексты из CONFIG → DOM
   ===================================================================== */
function applyTexts() {
  $$('[data-text]').forEach((el) => {
    const value = getText(el.dataset.text);
    if (typeof value === 'string') el.textContent = format(value);
  });
  $$('[data-placeholder]').forEach((el) => {
    el.placeholder = format(getText(el.dataset.placeholder) || '');
  });
  $$('[data-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', format(getText(el.dataset.ariaLabel) || ''));
  });
}

/* =====================================================================
   Переключение экранов
   ===================================================================== */
let currentScreen = $('.screen.is-active');

function showScreen(id) {
  const next = document.getElementById(id);
  if (!next || next === currentScreen) return;
  const prev = currentScreen;
  currentScreen = next;

  prev.classList.add('is-leaving');
  setTimeout(() => {
    prev.classList.remove('is-active', 'is-leaving');
    prev.hidden = true;
    next.hidden = false;
    next.classList.add('is-active');
    window.scrollTo(0, 0);
    next.dispatchEvent(new CustomEvent('screen:enter'));
    const heading = next.querySelector('h1');
    if (heading) heading.focus({ preventScroll: true });
  }, reducedMotion ? 0 : 220);
}

/* =====================================================================
   1. Идентификация
   ===================================================================== */
function initGate() {
  const questions = CONFIG.questions;
  const form = $('#gate-form');
  const input = $('#gate-input');
  const questionEl = $('#gate-question');
  const feedback = $('#gate-feedback');
  const hintEl = $('#gate-hint');
  const stepLabel = $('#step-label');
  const dots = $('#step-dots');

  let index = 0;
  let wrongCount = 0;
  let lastPhrase = '';

  dots.innerHTML = questions.map(() => '<li></li>').join('');

  function render() {
    const q = questions[index];
    stepLabel.textContent = format(CONFIG.text.gate.step, { n: index + 1, total: questions.length });
    $$('li', dots).forEach((dot, i) => {
      dot.classList.toggle('is-done', i < index);
      dot.classList.toggle('is-current', i === index);
    });
    questionEl.textContent = q.question;
    restartAnimation(questionEl, 'is-new');
    input.value = '';
    feedback.textContent = '';
    feedback.classList.remove('is-ok');
    hintEl.hidden = true;
    wrongCount = 0;
  }

  function fail(message) {
    feedback.classList.remove('is-ok');
    feedback.textContent = message;
    restartAnimation(input, 'shake');
    if (navigator.vibrate) navigator.vibrate(60);
  }

  input.addEventListener('animationend', () => input.classList.remove('shake'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = normalize(input.value);
    const q = questions[index];

    if (!value) return fail(CONFIG.text.gate.empty);

    const correct = q.answers.some((a) => normalize(a) === value);
    track('gate_answer', { n: index + 1, question: q.question, answer: input.value.trim().slice(0, 80), correct });

    if (!correct) {
      wrongCount += 1;
      lastPhrase = pickDifferent(CONFIG.text.gate.wrong, lastPhrase);
      fail(lastPhrase);
      if (wrongCount >= 2 && q.hint) {
        hintEl.textContent = CONFIG.text.gate.hintPrefix + q.hint;
        hintEl.hidden = false;
      }
      return;
    }

    // Верно
    feedback.textContent = CONFIG.text.gate.correct;
    feedback.classList.add('is-ok');
    index += 1;
    if (index < questions.length) {
      setTimeout(() => { render(); input.focus(); }, reducedMotion ? 0 : 450);
    } else {
      input.blur();
      setTimeout(startScan, reducedMotion ? 0 : 400);
    }
  });

  render();
}

/* Псевдо-сканирование → «Личность подтверждена» → видео */
function startScan() {
  const steps = CONFIG.text.gate.scan;
  const bar = $('#scan-bar');
  const label = $('#scan-label');
  const pct = $('#scan-pct');
  const duration = 2800;
  let start = null;

  $('#gate-quiz').hidden = true;
  $('#gate-scan').hidden = false;

  function frame(now) {
    if (start === null) start = now;
    const p = Math.min(1, (now - start) / duration);
    bar.style.transform = `scaleX(${p})`;
    pct.textContent = Math.round(p * 100) + '%';
    const text = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
    if (label.textContent !== text) label.textContent = text;

    if (p < 1) return requestAnimationFrame(frame);

    $('#gate-scan').hidden = true;
    $('#gate-verified').hidden = false;
    track('gate_passed');
    setTimeout(() => showScreen('screen-video'), 1800);
  }
  requestAnimationFrame(frame);
}

/* =====================================================================
   2. Видео
   ===================================================================== */
function initVideo() {
  const video = $('#video');
  const overlay = $('#video-play');
  const nextBtn = $('#video-next');
  let started = false;

  const showNext = () => { nextBtn.hidden = false; };

  // Нативные controls прячем под нашей кнопкой и возвращаем после старта
  video.controls = false;

  overlay.addEventListener('click', () => {
    overlay.hidden = true;
    video.controls = true;
    const playing = video.play();
    if (playing && playing.catch) playing.catch(() => { /* остаются нативные controls */ });
  });

  video.addEventListener('play', () => {
    overlay.hidden = true;
    video.controls = true;
    if (started) return;
    started = true;
    track('video_started');
    setTimeout(showNext, 5000);
  });

  let ended = false;
  video.addEventListener('ended', () => {
    showNext();
    if (ended) return;
    ended = true;
    track('video_ended');
  });

  nextBtn.addEventListener('click', () => {
    video.pause();
    showScreen('screen-contract');
  });
}

/* =====================================================================
   3. Договор + подпись на canvas
   ===================================================================== */
function createSignaturePad(canvas, onChange) {
  const ctx = canvas.getContext('2d');
  let cssWidth = 0;
  let drawing = false;
  let last = null;
  let lastMid = null;
  let inkLength = 0;
  let hasInk = false;

  function setStroke() {
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.fillStyle = ctx.strokeStyle;
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    inkLength = 0;
    if (hasInk) { hasInk = false; onChange(false); }
  }

  // Размер canvas под CSS-размер × devicePixelRatio. Реагируем только на смену ширины
  // (смена высоты — это клавиатура на телефоне, подпись при этом не трём).
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || rect.width === cssWidth) return;
    cssWidth = rect.width;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setStroke();
    clear();
  }

  function point(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    setStroke();
    drawing = true;
    last = lastMid = point(e);
    ctx.beginPath();
    ctx.arc(last.x, last.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (events.length ? events : [e]).forEach((ev) => {
      const p = point(ev);
      const mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(lastMid.x, lastMid.y);
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
      ctx.stroke();
      inkLength += Math.hypot(p.x - last.x, p.y - last.y);
      last = p;
      lastMid = mid;
    });
  });

  function end() {
    if (!drawing) return;
    drawing = false;
    if (!hasInk && inkLength > 30) { hasInk = true; onChange(true); }
  }
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  return { resize, clear };
}

function initContract() {
  const screen = $('#screen-contract');
  const signBtn = $('#btn-sign');
  const placeholder = $('#sign-placeholder');
  const nameInput = $('#doc-name');
  const seal = $('#seal');
  const terms = $('#doc-terms');

  $('#doc-date').textContent = new Date().toLocaleDateString('ru-RU');
  CONFIG.text.contract.terms.forEach((term) => {
    const li = document.createElement('li');
    li.textContent = format(term);
    terms.appendChild(li);
  });

  const pad = createSignaturePad($('#sign-canvas'), (hasInk) => {
    signBtn.disabled = !hasInk;
    placeholder.hidden = hasInk;
  });

  $('#sign-clear').addEventListener('click', () => {
    pad.clear();
    placeholder.hidden = false;
  });

  screen.addEventListener('screen:enter', () => pad.resize());
  window.addEventListener('resize', () => { if (currentScreen === screen) pad.resize(); });

  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') nameInput.blur(); });

  let done = false;
  signBtn.addEventListener('click', () => {
    if (done || signBtn.disabled) return;
    done = true;
    signBtn.disabled = true;
    track('contract_signed', { name: nameInput.value.trim().slice(0, 40) });
    seal.classList.add('is-stamped');
    setTimeout(() => showScreen('screen-signed'), reducedMotion ? 300 : 900);
  });
}

/* =====================================================================
   4. Финалы
   ===================================================================== */
function celebrate() {
  if (typeof window.confetti !== 'function' || reducedMotion) return;
  const colors = ['#e0436b', '#ff9fb5', '#ffd166', '#ffffff', '#c9a7ff'];
  window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.65 }, colors, disableForReducedMotion: true });
  setTimeout(() => {
    window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
    window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
  }, 300);
}

function initFinals() {
  const igLink = $('#ig-link');
  const dmLink = $('#dm-link');
  const unblockedBtn = $('#btn-unblocked');
  const macaron = $('#macaron');
  const reply = $('#reply');
  const replyText = $('#reply-text');
  const choices = $$('[data-choice]', macaron);

  igLink.href = nick ? 'https://instagram.com/' + encodeURIComponent(nick) : 'https://instagram.com/';
  dmLink.href = nick ? 'https://ig.me/m/' + encodeURIComponent(nick) : igLink.href;

  // После открытия профиля кнопка «Готово» становится главной
  igLink.addEventListener('click', () => {
    track('instagram_clicked');
    igLink.classList.replace('btn--primary', 'btn--ghost');
    unblockedBtn.classList.replace('btn--ghost', 'btn--primary');
  });

  unblockedBtn.addEventListener('click', () => {
    unblockedBtn.disabled = true;
    track('unblocked_clicked');
    macaron.hidden = false;
    macaron.focus({ preventScroll: true });
    macaron.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    celebrate();
  });

  choices.forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.choice;
      track('macaron_choice', { choice });
      choices.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      replyText.textContent = format(CONFIG.text.macaron.replies[choice]);
      reply.hidden = false;
      restartAnimation(reply, 'is-new');
    });
  });

  dmLink.addEventListener('click', () => track('dm_clicked'));

  $('#screen-signed').addEventListener('screen:enter', () => setTimeout(celebrate, 150));
}

/* =====================================================================
   Старт
   ===================================================================== */
applyTexts();
initGate();
initVideo();
initContract();
initFinals();
trackOncePerSession('opened');
