/* BitcoinBall.top — landing interactions (design system V2.0)
 * - hash-particle background (gold/amber, subdued)
 * - 10-minute block countdown ring + draws-completed-today
 * - yield simulator (Yellow Paper §5 formula, baseline 30 TH/s / $0.12 /
 *   400 W / BTC $60,000 / 600 EH/s -> +$0.27/day)
 * All motion respects prefers-reduced-motion. */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- background: drifting hash particles ---------- */
  var canvas = document.getElementById('bg-canvas');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var W, H, parts = [];
    var GLYPHS = '0123456789abcdef';

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var N = Math.min(70, Math.floor(window.innerWidth / 22));
    for (var i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        v: 0.15 + Math.random() * 0.45,
        s: 10 + Math.random() * 8,
        c: GLYPHS[(Math.random() * 16) | 0],
        a: 0.05 + Math.random() * 0.16,
        g: Math.random() < 0.18      /* a few gold ones */
      });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y += p.v;
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
          p.c = GLYPHS[(Math.random() * 16) | 0];
        }
        ctx.font = p.s + 'px ui-monospace, monospace';
        ctx.fillStyle = p.g
          ? 'rgba(247,147,26,' + p.a + ')'
          : 'rgba(120,120,180,' + (p.a * 0.7) + ')';
        ctx.fillText(p.c, p.x, p.y);
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- countdown ring (10-minute wall-clock boundary) ---------- */
  var cdEl = document.getElementById('countdown');
  var ring = document.getElementById('ringProg');
  var ringBox = document.getElementById('ring');
  var drawsEl = document.getElementById('drawsToday');
  var CIRC = 2 * Math.PI * 42;            /* r=42 */
  var PERIOD = 600;                        /* seconds */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function updateCountdown() {
    var now = new Date();
    var sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    var into = sec % PERIOD;
    var left = PERIOD - into;
    cdEl.textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60);
    ring.style.strokeDashoffset = (CIRC * (into / PERIOD)).toFixed(2);
    drawsEl.textContent = Math.floor(sec / PERIOD) + ' / 144';
    if (left === PERIOD && ringBox && !reduced) {
      /* rolled over: brief, restrained glow (<=3s) */
      ringBox.classList.remove('celebrate');
      void ringBox.offsetWidth;
      ringBox.classList.add('celebrate');
    }
  }
  if (cdEl) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ---------- yield simulator (Yellow Paper §5) ---------- */
  var MODELS = {
    frame:   { h: 30, w: 0.400 },   /* TH/s, kW — Yellow Paper baseline */
    clock:   { h: 20, w: 0.275 },
    speaker: { h: 45, w: 0.600 }
  };
  var SUBSIDY = 3.325;   /* 3.125 BTC + ~0.2 BTC fees */
  var POOL = 0.99;       /* 1% pool fee (FPPS) */

  var elModel = document.getElementById('simModel');
  var elElec = document.getElementById('simElec');
  var elBtc = document.getElementById('simBtc');
  var elHash = document.getElementById('simHash');
  var elElecOut = document.getElementById('elecOut');
  var elGross = document.getElementById('simGross');
  var elCost = document.getElementById('simCost');
  var elNet = document.getElementById('simNet');

  function money(v) {
    var sign = v < 0 ? '-' : '';
    return sign + '$' + Math.abs(v).toFixed(2);
  }

  function simulate() {
    var m = MODELS[elModel.value] || MODELS.frame;
    var p = parseFloat(elElec.value);
    var q = parseFloat(elBtc.value) || 0;
    var H = (parseFloat(elHash.value) || 600) * 1e6;   /* EH/s -> TH/s */

    elElecOut.textContent = '$' + p.toFixed(2) + '/kWh';

    var btc = (m.h / H) * 144 * SUBSIDY * POOL;
    var gross = btc * q;
    var cost = p * m.w * 24;
    var net = gross - cost;

    elGross.textContent = money(gross);
    elCost.textContent = money(cost);
    elNet.textContent = (net < 0 ? '-' : '+') + '$' + Math.abs(net).toFixed(2);
    elNet.className = 'big num ' + (net >= 0 ? 'pos' : 'neg');
  }

  if (elModel) {
    elModel.addEventListener('change', simulate);
    elElec.addEventListener('input', simulate);
    elBtc.addEventListener('input', simulate);
    elHash.addEventListener('input', simulate);
    simulate();
  }

  /* ---------- live BTC price + solo odds ---------- */
  var elBtcPrice = document.getElementById('btcPrice');
  var elPriceTime = document.getElementById('priceTime');
  var elPriceLive = document.getElementById('priceLive');
  var elBlockValue = document.getElementById('blockValue');
  var elOddsBlock = document.getElementById('oddsBlock');
  var elOddsDay = document.getElementById('oddsDay');
  var elOddsYears = document.getElementById('oddsYears');
  var elSoloNet = document.getElementById('soloNet');
  var btcEdited = false;
  if (elBtc) elBtc.addEventListener('input', function () { btcEdited = true; });

  function fmtUsd(v) {
    return '$' + Math.round(v).toLocaleString('en-US');
  }

  function updateSolo(price) {
    if (!elBlockValue) return;
    var netEhs = parseFloat(elHash && elHash.value) || 600;   /* EH/s */
    var h = 30;                                                /* TH/s frame */
    var ratio = h / (netEhs * 1e6);                            /* share of network */
    var perBlock = 1 / ratio;
    var perDay = 1 / (1 - Math.pow(1 - ratio, 144));
    var years = perDay / 365;
    elBlockValue.textContent = fmtUsd(SUBSIDY * price);
    elOddsBlock.textContent = '1 in ' + Math.round(perBlock).toLocaleString('en-US');
    elOddsDay.textContent = '1 in ' + Math.round(perDay).toLocaleString('en-US');
    elOddsYears.textContent = '~' + Math.round(years).toLocaleString('en-US') + ' years';
    elSoloNet.textContent = Math.round(netEhs);
  }

  function applyPrice(price, live) {
    if (!elBtcPrice) return;
    elBtcPrice.textContent = fmtUsd(price);
    elPriceTime.textContent = live
      ? 'live · updated ' + new Date().toLocaleTimeString()
      : 'offline — using $60,000 reference';
    elPriceLive.className = 'live-dot ' + (live ? 'on' : 'off');
    if (elBtc && !btcEdited) {
      elBtc.value = Math.round(price);
      simulate();
    }
    updateSolo(price);
  }

  function fetchPrice() {
    if (!elBtcPrice) return;
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var p = j && j.bitcoin && j.bitcoin.usd;
        if (p > 0) applyPrice(p, true);
        else applyPrice(60000, false);
      })
      .catch(function () { applyPrice(60000, false); });
  }

  if (elBtcPrice) {
    fetchPrice();
    setInterval(fetchPrice, 60000);
    updateSolo(parseFloat(elBtc && elBtc.value) || 60000);
    if (elHash) elHash.addEventListener('input', function () {
      updateSolo(parseFloat(elBtcPrice.textContent.replace(/[^0-9]/g, '')) || 60000);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced && revealEls.length) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
