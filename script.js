// ================================================================
// 1. NAVIGATION & LOADING
// ================================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hide');
  }, 2200);
});

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    void target.offsetWidth;
  }
  if (pageId === 'page-overworld') updateMapStatus();
  if (pageId === 'page-games') updateGameCounter();
  if (pageId === 'page-final') initFinalPage();
  if (pageId === 'page-quiz') initQuiz();
}

// ================================================================
// 2. CUSTOM MODAL
// ================================================================
function showModal(icon, title, message, buttonText = 'OK', callback = null) {
  const overlay = document.getElementById('customModal');
  document.getElementById('modalIcon').textContent = icon || '💖';
  document.getElementById('modalTitle').textContent = title || 'Informasi';
  document.getElementById('modalMessage').textContent = message || '';
  const btn = document.getElementById('modalButton');
  btn.textContent = buttonText || 'OK';
  overlay.classList.remove('hidden');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    if (callback) callback();
  });
}

// ================================================================
// 3. LOGIN
// ================================================================
const LOGIN_PASS = 'sayang';

function handleLogin() {
  const input = document.getElementById('loginInput');
  const err = document.getElementById('loginError');
  const val = input.value.trim().toLowerCase();

  if (val === LOGIN_PASS) {
    err.innerHTML = '';
    navigateTo('page-overworld');
    playSFX('chime');
    return;
  }

  input.classList.add('shake-error');
  setTimeout(() => input.classList.remove('shake-error'), 600);
  playSFX('buzz');

  const msgs = ['😅 ih siapa tuh?', '🤭 coba lagi dong sayang', '😘 panggilan sayangku apa ya?',
    '💕 nama panggilan kita lupa?', '🙈 ayo tebak lagi!'];
  const rand = msgs[Math.floor(Math.random() * msgs.length)];
  err.innerHTML = `<span class="error-bubble">${rand}</span>`;
  input.value = '';
  input.focus();
}
document.getElementById('loginInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});

// ================================================================
// 4. SFX
// ================================================================
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new(window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSFX(type) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    if (type === 'beep') {
      osc.frequency.value = 800;
      osc.type = 'square';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'chime') {
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1500;
        osc2.type = 'sine';
        gain2.gain.value = 0.12;
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.25);
      }, 150);
    } else if (type === 'buzz') {
      osc.frequency.value = 300;
      osc.type = 'sawtooth';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'tada') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = 'sine';
          g.gain.value = 0.12;
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          o.start(ctx.currentTime);
          o.stop(ctx.currentTime + 0.4);
        }, i * 120);
      });
    }
  } catch (e) { /* silent */ }
}

// ================================================================
// 5. KONFETI
// ================================================================
function fireConfetti(count = 60, duration = 5000) {
  const container = document.getElementById('confettiContainer');
  const colors = ['#ff6fcf', '#6fcbff', '#ffd966', '#6fcf97', '#ff8a5c', '#b38bff', '#ff5e7a', '#ffb347', '#fff'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 12;
    piece.style.width = size + 'px';
    piece.style.height = size + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.top = '-10px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(piece);
    setTimeout(() => piece.remove(), duration);
  }
}

// ================================================================
// 6. PROGRESI (SEMUA 4 GAME WAJIB)
// ================================================================
const progress = {
  gamesCompleted: false,
  portalVisited: false,
  letterRead: false,
  quizDone: false,
  finalUnlocked: false
};

function updateMapStatus() {
  const gamesNode = document.getElementById('map-games');
  const portalNode = document.getElementById('map-portal');
  const letterNode = document.getElementById('map-letter');
  const quizNode = document.getElementById('map-quiz');
  const finalNode = document.getElementById('map-final');

  gamesNode.classList.remove('locked');
  gamesNode.classList.toggle('complete', progress.gamesCompleted);

  portalNode.classList.toggle('locked', !progress.gamesCompleted);
  portalNode.classList.toggle('complete', progress.portalVisited);

  letterNode.classList.toggle('locked', !progress.portalVisited);
  letterNode.classList.toggle('complete', progress.letterRead);

  quizNode.classList.toggle('locked', !progress.letterRead);
  quizNode.classList.toggle('complete', progress.quizDone);

  const finalUnlock = progress.quizDone;
  finalNode.classList.toggle('locked', !finalUnlock);
  finalNode.classList.toggle('complete', finalUnlock);
  if (finalUnlock && !progress.finalUnlocked) {
    progress.finalUnlocked = true;
  }

  const hint = document.getElementById('mapHint');
  if (!progress.gamesCompleted) {
    hint.textContent = '✨ Selesaikan SEMUA 4 GAME untuk membuka PORTAL';
  } else if (!progress.portalVisited) {
    hint.textContent = '📸 Kunjungi PORTAL FOTO untuk membuka SURAT';
  } else if (!progress.letterRead) {
    hint.textContent = '💌 Baca SURAT CINTA untuk membuka QUIZ';
  } else if (!progress.quizDone) {
    hint.textContent = '❓ Jawab semua QUIZ untuk membuka FINAL';
  } else {
    hint.textContent = '🏆 Selamat! Kamu sudah menyelesaikan semua! Klik FINAL untuk perayaan!';
  }
}

// ================================================================
// 7. NAVIGASI MAP
// ================================================================
function goToGames() { navigateTo('page-games'); }

function tryOpenPortal() {
  if (progress.gamesCompleted) {
    navigateTo('page-portal');
    initPortal();
  } else {
    playSFX('buzz');
    showModal('🔒', 'Terkunci!', 'Selesaikan SEMUA 4 GAME dulu ya!');
  }
}

function tryOpenLetter() {
  if (progress.portalVisited) {
    navigateTo('page-letter');
  } else {
    playSFX('buzz');
    showModal('🔒', 'Terkunci!', 'Kunjungi Portal Foto dulu!');
  }
}

function tryOpenQuiz() {
  if (progress.letterRead) {
    navigateTo('page-quiz');
  } else {
    playSFX('buzz');
    showModal('🔒', 'Terkunci!', 'Baca Surat Cinta dulu!');
  }
}

function tryOpenFinal() {
  if (progress.quizDone) {
    navigateTo('page-final');
  } else {
    playSFX('buzz');
    showModal('🔒', 'Terkunci!', 'Selesaikan semua stage dulu!');
  }
}

// ================================================================
// 8. GAME 1
// ================================================================
let game1Won = false;
let g1Selected = false;
const g1Btns = document.querySelectorAll('#game1Options .emoji-btn');

function resetGame1() {
  game1Won = false;
  g1Selected = false;
  g1Btns.forEach(b => {
    b.classList.remove('correct', 'wrong');
    b.style.opacity = '1';
    b.disabled = false;
  });
  document.getElementById('game1Status').innerHTML = '❌';
  document.getElementById('game1Status').style.color = '#7a5a82';
}

g1Btns.forEach(btn => {
  btn.addEventListener('click', function() {
    if (g1Selected) return;
    const correct = this.dataset.correct === 'true';
    g1Selected = true;
    g1Btns.forEach(b => b.style.opacity = '0.5');
    this.style.opacity = '1';

    if (correct) {
      this.classList.add('correct');
      game1Won = true;
      document.getElementById('game1Status').innerHTML = '✅';
      document.getElementById('game1Status').style.color = '#6fcf97';
      g1Btns.forEach(b => {
        if (b.dataset.correct === 'true') b.classList.add('correct');
      });
      playSFX('chime');
      fireConfetti(30);
      updateGameCounter();
    } else {
      this.classList.add('wrong');
      document.getElementById('game1Status').innerHTML = '❌';
      document.getElementById('game1Status').style.color = '#ff3d6f';
      playSFX('buzz');
      setTimeout(() => {
        this.classList.remove('wrong');
        g1Btns.forEach(b => b.style.opacity = '1');
        g1Selected = false;
      }, 800);
    }
  });
});

// ================================================================
// 9. GAME 2
// ================================================================
let game2Won = false;
let starCount = 0;
let activeStarIndex = -1;
let starInterval = null;
const starBtns = document.querySelectorAll('#starGrid .star-btn');
const starCounter = document.getElementById('starCounter');
const starHint = document.getElementById('starHint');

function pickRandomStar() {
  starBtns.forEach(b => {
    b.style.background = '';
    b.style.borderColor = '#4a2b52';
  });
  const idx = Math.floor(Math.random() * starBtns.length);
  activeStarIndex = idx;
  starBtns[idx].style.background = '#ffd96644';
  starBtns[idx].style.borderColor = '#ffd966';
  starHint.textContent = '✨ klik bintang yang berkedip!';
}

function startStarGame() {
  if (starInterval) {
    clearInterval(starInterval);
    starInterval = null;
  }
  starCount = 0;
  game2Won = false;
  starCounter.textContent = '0 / 5';
  document.getElementById('game2Status').innerHTML = '❌';
  document.getElementById('game2Status').style.color = '#7a5a82';
  starBtns.forEach(b => {
    b.style.background = '';
    b.style.borderColor = '#4a2b52';
    b.disabled = false;
    b.classList.remove('hit');
  });
  pickRandomStar();
  starInterval = setInterval(() => {
    if (game2Won) {
      if (starInterval) clearInterval(starInterval);
      return;
    }
    pickRandomStar();
  }, 1600);
}

starBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    if (game2Won) return;
    const idx = parseInt(this.dataset.star);
    if (idx === activeStarIndex) {
      this.classList.add('hit');
      starCount++;
      starCounter.textContent = `${starCount} / 5`;
      playSFX('beep');
      if (starCount >= 5) {
        game2Won = true;
        document.getElementById('game2Status').innerHTML = '✅';
        document.getElementById('game2Status').style.color = '#6fcf97';
        starHint.textContent = '🎉 kamu hebat!';
        if (starInterval) {
          clearInterval(starInterval);
          starInterval = null;
        }
        starBtns.forEach(b => b.disabled = true);
        playSFX('chime');
        fireConfetti(40);
        updateGameCounter();
      } else {
        pickRandomStar();
      }
    } else {
      this.style.borderColor = '#ff3d6f';
      playSFX('buzz');
      setTimeout(() => {
        this.style.borderColor = '#4a2b52';
      }, 400);
    }
  });
});

// ================================================================
// 10. GAME 3
// ================================================================
let game3Won = false;
let matchSequence = [];
const matchBtns = document.querySelectorAll('#matchGrid .emoji-btn');
const matchStatus = document.getElementById('matchStatus');
const game3Status = document.getElementById('game3Status');
let matchProcessing = false;

function resetGame3() {
  game3Won = false;
  matchSequence = [];
  matchProcessing = false;
  matchStatus.textContent = 'klik 💖 lalu 🫶 (urut)';
  document.getElementById('game3Status').innerHTML = '❌';
  document.getElementById('game3Status').style.color = '#7a5a82';
  matchBtns.forEach(b => {
    b.style.opacity = '1';
    b.disabled = false;
    b.classList.remove('correct', 'wrong');
  });
}

matchBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    if (game3Won || matchProcessing) return;
    const type = this.dataset.match;
    matchSequence.push(type);
    this.style.opacity = '0.4';
    this.disabled = true;

    if (matchSequence.length === 2) {
      matchProcessing = true;
      const [first, second] = matchSequence;
      if (first === 'heart' && second === 'hand') {
        game3Won = true;
        document.getElementById('game3Status').innerHTML = '✅';
        document.getElementById('game3Status').style.color = '#6fcf97';
        matchStatus.textContent = '💖 + 🫶 = perfect!';
        playSFX('chime');
        fireConfetti(30);
        updateGameCounter();
        matchBtns.forEach(b => {
          b.style.opacity = '1';
          b.disabled = true;
        });
      } else {
        matchStatus.textContent = '😅 urutan harus 💖 lalu 🫶!';
        playSFX('buzz');
        setTimeout(() => {
          matchBtns.forEach(b => {
            b.style.opacity = '1';
            b.disabled = false;
          });
          matchSequence = [];
          matchProcessing = false;
          matchStatus.textContent = 'klik 💖 lalu 🫶 (urut)';
        }, 700);
      }
    }
  });
});

// ================================================================
// 11. GAME 4 MEMORY
// ================================================================
let game4Won = false;
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryLock = false;
const memoryGrid = document.getElementById('memoryGrid');
const game4Status = document.getElementById('game4Status');
const memoryStatus = document.getElementById('memoryStatus');

const emojiPairs = ['🌸', '💖', '🌟', '🌈', '🌸', '💖', '🌟', '🌈'];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initMemoryGame() {
  game4Won = false;
  matchedPairs = 0;
  flippedCards = [];
  memoryLock = false;
  game4Status.innerHTML = '❌';
  game4Status.style.color = '#7a5a82';
  memoryStatus.textContent = 'balik kartu dan temukan pasangan';
  const shuffled = shuffleArray([...emojiPairs]);
  memoryGrid.innerHTML = '';
  shuffled.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="front">?</div>
      <div class="back">${emoji}</div>
    `;
    card.addEventListener('click', () => flipCard(card));
    memoryGrid.appendChild(card);
  });
  memoryCards = document.querySelectorAll('.memory-card');
}

function flipCard(card) {
  if (memoryLock) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flippedCards.length >= 2) return;

  card.classList.add('flipped');
  playSFX('beep');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    memoryLock = true;
    const [c1, c2] = flippedCards;
    if (c1.dataset.emoji === c2.dataset.emoji) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      matchedPairs++;
      flippedCards = [];
      memoryLock = false;
      playSFX('chime');
      if (matchedPairs === 4) {
        game4Won = true;
        game4Status.innerHTML = '✅';
        game4Status.style.color = '#6fcf97';
        memoryStatus.textContent = '🎉 semua berpasangan!';
        playSFX('chime');
        fireConfetti(50);
        updateGameCounter();
      } else {
        memoryStatus.textContent = `sudah ${matchedPairs} pasang!`;
      }
    } else {
      memoryStatus.textContent = '❌ coba lagi!';
      playSFX('buzz');
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flippedCards = [];
        memoryLock = false;
        memoryStatus.textContent = 'balik kartu dan temukan pasangan';
      }, 600);
    }
  }
}

// ================================================================
// 12. UPDATE GAME COUNTER (WAJIB 4 GAME)
// ================================================================
function updateGameCounter() {
  let wins = 0;
  if (game1Won) wins++;
  if (game2Won) wins++;
  if (game3Won) wins++;
  if (game4Won) wins++;
  document.getElementById('gameWinCounter').textContent = `${wins}/4`;

  if (wins === 4 && !progress.gamesCompleted) {
    progress.gamesCompleted = true;
    playSFX('tada');
    fireConfetti(60);
    showModal('🎉', 'SEMUA GAME SELESAI!', 'Kamu berhasil menyelesaikan 4 game! Portal foto terbuka!', 'Ke Peta', () => {
      navigateTo('page-overworld');
    });
    updateMapStatus();
  }
  updateMapStatus();
}

function checkGameProgress() {
  let wins = 0;
  if (game1Won) wins++;
  if (game2Won) wins++;
  if (game3Won) wins++;
  if (game4Won) wins++;
  if (wins === 4) {
    if (!progress.gamesCompleted) {
      progress.gamesCompleted = true;
      playSFX('tada');
      fireConfetti(60);
      showModal('🎉', 'SEMUA GAME SELESAI!', 'Kamu berhasil menyelesaikan 4 game! Portal foto terbuka!', 'Ke Peta', () => {
        navigateTo('page-overworld');
      });
      updateMapStatus();
    } else {
      showModal('✅', 'Sudah!', 'Kamu sudah menyelesaikan semua game! Lanjut ke Portal!');
    }
  } else {
    playSFX('buzz');
    showModal('😅', 'Belum selesai!', `Kamu baru menyelesaikan ${wins} dari 4 game. Selesaikan SEMUA!`);
  }
}

// ================================================================
// 13. PORTAL
// ================================================================
const photoUrls = [
  "images/1.png",
  "images/2.png",
  "images/3.jpeg",
  "images/4.png",
  "images/5.jpg",
  "images/6.png",
  "images/7.png",
  "images/8.png",
  "images/9.jpg",
  "images/10.png",
  "images/11.jpg",
  "images/12.jpeg",
  "images/13.jpeg",
  "images/14.jpeg",
  "images/15.jpeg"
];
for (let i = 1; i <= 15; i++) {
  const colors = ['ff6fcf', '6fcbff', 'ffd966', '6fcf97', 'ff8a5c', 'b38bff', 'ff5e7a', '5ec8ff', 'ffb347', '7bed9f',
    'ff6b81', '70a1ff', 'ffa502', '2ed573', '1e90ff'];
  const c = colors[(i - 1) % colors.length];
  photoUrls.push(`https://placehold.co/400x500/${c}/ffffff?text=📸+${i}`);
}
let currentPhoto = 0;

function initPortal() {
  const frame = document.getElementById('portalFrame');
  const img = document.getElementById('portalImage');
  const placeholder = document.getElementById('portalPlaceholder');
  const loading = document.getElementById('portalLoading');
  const thumbsContainer = document.getElementById('portalThumbs');
  thumbsContainer.innerHTML = '';
  for (let i = 0; i < 15; i++) {
    const thumb = document.createElement('button');
    thumb.className =
      'aspect-square rounded-xl border-2 border-[#4a2b52] bg-[#2d1b33] text-[#ffb3e6] text-xs font-bold flex items-center justify-center transition hover:border-[#ff6fcf]';
    thumb.textContent = i + 1;
    thumb.dataset.idx = i;
    thumb.addEventListener('click', () => showPhoto(i));
    thumbsContainer.appendChild(thumb);
  }
  showPhoto(0);
  frame.addEventListener('mousemove', (e) => {
    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  frame.addEventListener('mouseleave', () => {
    frame.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
  frame.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = frame.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  frame.addEventListener('touchend', () => {
    frame.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

function showPhoto(index) {
  const img = document.getElementById('portalImage');
  const placeholder = document.getElementById('portalPlaceholder');
  const loading = document.getElementById('portalLoading');
  const frame = document.getElementById('portalFrame');
  currentPhoto = index;
  loading.classList.remove('hide');
  img.style.display = 'none';
  placeholder.style.display = 'none';
  document.querySelectorAll('#portalThumbs button').forEach((btn, i) => {
    btn.style.borderColor = i === index ? '#ff6fcf' : '#4a2b52';
    btn.style.background = i === index ? '#4a2b52' : '#2d1b33';
  });
  setTimeout(() => {
    img.src = photoUrls[index] || 'https://placehold.co/400x500/2d1b33/ff6fcf?text=🌸';
    img.onload = () => {
      loading.classList.add('hide');
      img.style.display = 'block';
    };
    img.onerror = () => {
      loading.classList.add('hide');
      img.style.display = 'none';
      placeholder.style.display = 'block';
      placeholder.textContent = '📸';
    };
    setTimeout(() => {
      if (!loading.classList.contains('hide')) {
        loading.classList.add('hide');
        img.style.display = 'block';
        img.src = photoUrls[index] || 'https://placehold.co/400x500/2d1b33/ff6fcf?text=🌸';
      }
    }, 1200);
  }, 600);
}

function markPortalVisited() {
  if (!progress.portalVisited) {
    progress.portalVisited = true;
    playSFX('chime');
    fireConfetti(30);
    showModal('📸', 'Portal Dilihat!', 'Surat Cinta sekarang terbuka!', 'Ke Peta', () => {
      navigateTo('page-overworld');
    });
    updateMapStatus();
  } else {
    showModal('✅', 'Sudah!', 'Portal sudah ditandai.');
  }
}

// ================================================================
// 14. SURAT
// ================================================================
const letterMessages = [
  "Henglow my sweetie mwah mwah sayang, asala luwjh tau deck! Setiap hari bersamamu rasanya nggak pernah bosan, kek di pelet XIXIXIX. 😅😅",
  "Aku suka banget kalo kamu senyum, kayak tulus banget, tapi tapi jangan ke cowo yeee!!!!. ke aku ajaa ke AKUUUU!",
  "Kalau kamu jadi bintang, aku bakal jadi monyet AWOAKWAOWAKAOK. 🌟 karena tanpa monyet adit, bintang gabisa bersinar blink blink kacing kacing.",
  "Aku kek nya kalo jadi kartun ga perlu kastil atau kerajaan, yang aku butuh cuma kamu, maooo peluk, sama tawa kecil wakakwakak yang bikin hatiku meleleh melerrr lur. 🏰💖",
  "Setiap hari bersamamu adalah petualangan baru. Kadang kita main game, kadang kita nonton, kadang cuma diam bareng kadang marah kadang kiding XIXIXIXIX, tapi semuanya terasa istimewa.",
  "Kamu adalah favoritku di antara semua hal yang aku suka. Seperti mie ayam Flamboyan! 🍕🍦 (Hormat kepada KING FLAMBOYANNNN)",
  "Aku ga bisa janji bakal selalu sempurna, tapi aku bisa janji bakal selalu berusaha buat bikin kamu bahagia mwahh mwahhh. 💖",
  "Makasiiii yaaa sayanggg. Aku nggak sabar buat terus nulis cerita kita bareng-bareng, sampai kakek nenek, opung opung jir, dan mungkin sampai kita jadi debu juga CIATTTTTT. 🥰"
];

let currentLetterIndex = 0;
let typewriterInterval = null;

function renderLetter(index) {
  const el = document.getElementById('letterContent');
  const fullText = letterMessages[index % letterMessages.length];
  el.textContent = '';
  let idx = 0;
  if (typewriterInterval) clearInterval(typewriterInterval);
  typewriterInterval = setInterval(() => {
    if (idx < fullText.length) {
      el.textContent += fullText.charAt(idx);
      idx++;
    } else {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
    }
  }, 30);
}

function shuffleLetter() {
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }
  currentLetterIndex = (currentLetterIndex + 1) % letterMessages.length;
  renderLetter(currentLetterIndex);
  playSFX('beep');
  const box = document.getElementById('letterBox');
  box.style.transform = 'perspective(600px) rotateX(4deg) rotateY(-4deg) scale(0.98)';
  setTimeout(() => {
    box.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, 200);
}

function markLetterRead() {
  if (!progress.letterRead) {
    progress.letterRead = true;
    playSFX('chime');
    fireConfetti(30);
    showModal('💌', 'Surat Dibaca!', 'QUIZ sekarang terbuka!', 'Ke Peta', () => {
      navigateTo('page-overworld');
    });
    updateMapStatus();
  } else {
    showModal('✅', 'Sudah!', 'Surat sudah ditandai.');
  }
}

renderLetter(0);

// ================================================================
// 15. QUIZ CINTA
// ================================================================
const quizData = [
  {
    question: 'Apa warna favorit kita berdua?',
    options: ['Merah bawang merah', 'Biru ru ru rusak', 'ijo muntah kucink', 'Hytam Legam'],
    correct: 2
  },
  {
    question: 'Makanan favorit kita berdua?',
    options: ['Mie Ayam King Flamboyan', 'Bakso Tikus, Bakso KONNNN', 'Naspad Padang', 'Nasgor Goreng'],
    correct: 0
  },
  {
    question: 'Tempat pertama kali kita bertemu dimanaaaa?',
    options: ['OYO', 'Comberan', 'GSG Xaveway', 'Panjang'],
    correct: 2
  },
  {
    question: 'Film favorit kita?',
    options: ['Horror Rawrrrr', 'B0K3P', 'Dracin Korea', 'Upin Upin'],
    correct: 0
  }
];

let quizAnswers = [];

function initQuiz() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';
  quizAnswers = [];
  
  quizData.forEach((q, qIdx) => {
    const div = document.createElement('div');
    div.className = 'quiz-question';
    div.innerHTML = `
      <div class="q-text">❓ Pertanyaan ${qIdx + 1}</div>
      <p class="text-[#c9a0d4] text-sm mb-2">${q.question}</p>
      <div class="quiz-options" data-q="${qIdx}">
        ${q.options.map((opt, oIdx) => `
          <button class="quiz-option" data-q="${qIdx}" data-opt="${oIdx}">${opt}</button>
        `).join('')}
      </div>
    `;
    container.appendChild(div);
    quizAnswers.push(null);
  });

  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', function() {
      const qIdx = parseInt(this.dataset.q);
      const optIdx = parseInt(this.dataset.opt);
      const group = this.closest('.quiz-options');
      group.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      quizAnswers[qIdx] = optIdx;
    });
  });
}

function checkQuizAnswers() {
  const unanswered = quizAnswers.some(a => a === null);
  if (unanswered) {
    playSFX('buzz');
    showModal('❓', 'Belum Lengkap!', 'Jawab semua pertanyaan dulu ya!');
    return;
  }

  let correct = 0;
  quizAnswers.forEach((ans, idx) => {
    if (ans === quizData[idx].correct) correct++;
  });

  if (correct === quizData.length) {
    if (!progress.quizDone) {
      progress.quizDone = true;
      playSFX('tada');
      fireConfetti(80, 6000);
      showModal('🎉', 'QUIZ SELESAI!', 'Kamu menjawab semua pertanyaan dengan benar! FINAL terbuka!', 'Lihat Final', () => {
        navigateTo('page-final');
      });
      updateMapStatus();
    } else {
      showModal('✅', 'Sudah!', 'Quiz sudah ditandai selesai.');
    }
  } else {
    playSFX('buzz');
    showModal('😅', 'Ada yang salah!', `Kamu menjawab ${correct} dari ${quizData.length} benar. Coba lagi!`);
    document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
    quizAnswers = quizAnswers.map(() => null);
  }
}

// ================================================================
// 16. PAGE FINAL SUPER HEBOH
// ================================================================
let finalStarsInterval = null;

function initFinalPage() {
  const container = document.getElementById('final-stars');
  container.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star-particle';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.width = (2 + Math.random() * 6) + 'px';
    star.style.height = star.style.width;
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    container.appendChild(star);
  }
  
  fireConfetti(150, 8000);
  playSFX('tada');
  
  if (finalStarsInterval) clearInterval(finalStarsInterval);
  finalStarsInterval = setInterval(() => {
    fireConfetti(40, 3000);
  }, 3000);
}

window.addEventListener('beforeunload', () => {
  if (finalStarsInterval) clearInterval(finalStarsInterval);
});

// ================================================================
// 17. AUDIO
// ================================================================
const audio = document.getElementById('bgAudio');
const playBtn = document.getElementById('playBtn');
const volumeSlider = document.getElementById('volumeSlider');
let isPlaying = false;

function toggleAudio() {
  if (isPlaying) {
    audio.pause();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    isPlaying = true;
  }
}

volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value);
});

document.addEventListener('click', () => {
  if (!isPlaying) {
    audio.play().catch(() => {});
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    isPlaying = true;
  }
}, { once: true });

// ================================================================
// 18. KUCING
// ================================================================
let catBubbleTimeout = null;

function catBubble() {
  const bubble = document.getElementById('cat-bubble');
  const messages = ['Meow~!', 'Hai sayang!', 'Ayo lanjut!', 'Kamu hebat!', '💖'];
  bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
  bubble.classList.remove('hidden');
  bubble.classList.add('show');
  if (catBubbleTimeout) clearTimeout(catBubbleTimeout);
  catBubbleTimeout = setTimeout(() => {
    bubble.classList.remove('show');
    setTimeout(() => bubble.classList.add('hidden'), 300);
  }, 2000);
}

// ================================================================
// 19. FLOATING HEARTS
// ================================================================
function createFloatingHeart() {
  const el = document.createElement('div');
  el.className = 'floating-hearts';
  el.textContent = ['💖', '🌸', '✨', '💕', '🌟', '🦋', '🌈', '💗', '🌺'][Math.floor(Math.random() * 9)];
  el.style.left = Math.random() * 90 + '%';
  el.style.top = '100%';
  el.style.fontSize = (16 + Math.random() * 24) + 'px';
  el.style.animationDuration = (5 + Math.random() * 7) + 's';
  el.style.animationDelay = Math.random() * 2 + 's';
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 10000);
}
setInterval(createFloatingHeart, 1800);
for (let i = 0; i < 4; i++) setTimeout(createFloatingHeart, i * 500);

// ================================================================
// 20. INIT
// ================================================================
initMemoryGame();
startStarGame();
resetGame3();
initQuiz();
updateMapStatus();

window.addEventListener('beforeunload', () => {
  if (starInterval) clearInterval(starInterval);
  if (typewriterInterval) clearInterval(typewriterInterval);
  if (finalStarsInterval) clearInterval(finalStarsInterval);
});

console.log('🌸 Kayangan Cinta FINAL loaded! Happy Girlfriend Day! 💕');