/* script.js */
const CONFIG = {
  to: "My Love, ❤️",
  letter: `Happy, happy birthday, jaan! 🎂❤️

I wanted to write something for you, but honestly, words barely feel like enough to capture how much you mean to me. Life is just so much warmer and softer with you in it.💞

I love how you take care of the tiniest things without even needing to be asked those little, thoughtful details you notice always mean the absolute world to me. And I’m in constant awe of how incredible you are at everything you do. You pour your heart into whatever comes your way, and you make it all look so effortless.🥹💕

Then there’s your smile, it is the most contagious, brightest thing, and it never fails to completely make my day. You are my safe space, my comfort, and the absolute best part of my life.💖

I hope your life is filled with so much happiness, good food, and all the love you deserve. Thank you for being you, and for being mine.😘

I love you to the moon and back, forever and always. Happy birthday, my love! ✨🫶🏻`
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Application State
let blown = false;
let giftsOpened = { env: false, flo: false, box: false };
let currentAudio = $('#song');

// Screen Navigation
const showScreen = id => {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#${id}`).classList.add('active');

  // Trigger special actions based on screen
  if (id === 's5') openLetter();
  if (id !== 's5') $('#env').classList.remove('opened');
  
  if (id === 's8') startFinalConfetti();

  // Pause music if leaving screen 7, unless on screen 8
  if (id !== 's7' && id !== 's8') {
    currentAudio.pause();
    $('#play').textContent = '▶';
    $('#play').classList.remove('playing');
    $('.vinyl-record').classList.remove('spinning');
  }
};

// Bind Navigation Buttons
$$('[data-go]').forEach(b => {
  b.addEventListener('click', (e) => {
    // If it's a gift button, mark it as opened
    if(b.classList.contains('gift-btn')) {
      const giftType = b.dataset.gift;
      giftsOpened[giftType] = true;
      b.classList.add('opened');
      checkAllGiftsOpened();
    }
    showScreen(b.dataset.go);
  });
});

// Check if all gifts are opened to show the final button
function checkAllGiftsOpened() {
  if (giftsOpened.env && giftsOpened.flo && giftsOpened.box) {
    const finalBtn = $('#btn-final');
    finalBtn.classList.remove('hidden');
  }
}

/* ---- 1. Blow the Candles ---- */
$('#blow').addEventListener('click', () => {
  if (blown) return showScreen('s2');
  blown = true;
  $('#cake').classList.add('out');
  $('#blow').innerHTML = '≋ &nbsp;NEXT';
  burstConfetti($('#confetti-canvas'));
});

// Confetti logic for Canvas
function burstConfetti(canvasElement, continuous = false) {
  const ctx = canvasElement.getContext('2d');
  canvasElement.width = window.innerWidth; 
  canvasElement.height = window.innerHeight;
  
  const cols = ['#e63946','#f4a261','#2a9d8f','#457b9d','#ffd166','#c77dff', '#ffb5a7'];
  let particles = Array.from({length: continuous ? 250 : 160}, () => generateParticle(cols, continuous));

  function generateParticle(colors, continuous) {
    return {
      x: Math.random() * window.innerWidth,
      y: continuous ? -Math.random() * window.innerHeight : window.innerHeight * 0.3,
      vx: (Math.random() - 0.5) * 10,
      vy: continuous ? Math.random() * 5 + 2 : -Math.random() * 9 - 2,
      s: Math.random() * 6 + 3,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: 1,
      r: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10
    };
  }

  function render() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    particles.forEach((o, index) => {
      o.x += o.vx;
      o.y += o.vy;
      if(!continuous) o.vy += 0.25; // gravity for burst
      if(!continuous) o.a -= 0.007; // fade out for burst
      
      // Respawn for continuous
      if (continuous && o.y > canvasElement.height) {
        particles[index] = generateParticle(cols, true);
        particles[index].y = -10;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(o.a, 0);
      ctx.fillStyle = o.c;
      ctx.translate(o.x, o.y);
      ctx.rotate(o.r * Math.PI / 180);
      o.r += o.vr;
      ctx.fillRect(-o.s/2, -o.s/2, o.s, o.s * 1.5);
      ctx.restore();
    });

    if (continuous || particles.some(o => o.a > 0)) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
  }
  render();
}

/* ---- 2. Yes / Dodging No ---- */
const btnNo = $('#btn-no');
const dodge = () => {
  // Move it randomly away from mouse
  const x = (Math.random() - 0.5) * 300;
  const y = (Math.random() - 0.5) * 200;
  btnNo.style.transform = `translate(${x}px, ${y}px)`;
};
btnNo.addEventListener('mouseenter', dodge);
btnNo.addEventListener('touchstart', e => { dodge(); });
// Clicking it directly routes to Screen 3 (Sad reaction) via data-go attribute handled globally.

/* ---- 5. Letter Typing Animation ---- */
let typingTimer;
function openLetter() {
  $('#letter-to').textContent = CONFIG.to; 
  $('#letter-body').textContent = '';
  clearTimeout(typingTimer);
  
  setTimeout(() => {
    $('#env').classList.add('opened');
    let i = 0; 
    const text = CONFIG.letter;
    
    function type() { 
      if (i <= text.length) { 
        $('#letter-body').textContent = text.slice(0, i++); 
        typingTimer = setTimeout(type, 40); 
      } 
    }
    typingTimer = setTimeout(type, 1000);
  }, 400);
}

/* ---- 7. Tiles & Music Card ---- */
(() => {
  const makeTiles = word => [...word].map(ch => 
    `<span style="--r:${(Math.random()*8-4).toFixed(1)}deg">${ch}</span>`
  ).join('');
  $('#tiles').innerHTML = makeTiles('happy') + '<br>' + makeTiles('birthday');
})();

$('#play').addEventListener('click', () => {
  if (currentAudio.paused) {
    currentAudio.play().then(() => {
      $('#play').textContent = '❚❚';
      $('#play').classList.add('playing');
      $('.vinyl-record').classList.add('spinning');
    }).catch(() => {
      alert('Please place a "song.mp3" file in the same folder as index.html to play music!');
    });
  } else {
    currentAudio.pause();
    $('#play').textContent = '▶';
    $('#play').classList.remove('playing');
    $('.vinyl-record').classList.remove('spinning');
  }
});

/* ---- 8. Final Memories Screen ---- */
function startFinalConfetti() {
  const canvas = $('#final-confetti');
  burstConfetti(canvas, true);
}

/* ---- Start background song on first tap ---- */
document.addEventListener('click', () => {
  const a = document.getElementById('bgm');
  if (a && a.paused) a.play().catch(() => {});
}, { once: true });
