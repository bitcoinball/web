/* BitcoinBall — digital frame "in action" demo (canvas, self-contained).
 * Simulated appliance screen: photo slideshow + mining widget + periodic
 * block-found celebration. Time is compressed for demonstration; figures
 * are illustrative. Honors prefers-reduced-motion (static frame). */
(function () {
  'use strict';

  var host = document.getElementById('frame-demo');
  if (!host) return;
  var canvas = document.createElement('canvas');
  host.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* logical scene size (device + margin), scaled to fit host width */
  var LW = 760, LH = 560;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function fit() {
    var w = host.clientWidth || LW;
    var h = host.clientHeight || LH;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
  }
  fit();
  window.addEventListener('resize', fit);

  /* device geometry (logical px) */
  var DEV = { x: 110, y: 40, w: 540, h: 380, r: 18 };   /* bezel */
  var SCR = { x: 126, y: 56, w: 508, h: 320, r: 8 };    /* screen */
  var WIDGET_H = 44;
  var WID = { x: SCR.x, y: SCR.y + SCR.h - WIDGET_H, w: SCR.w, h: WIDGET_H };

  /* demo clock: a Bitcoin "10 minutes" compressed into DEMO_PERIOD ms */
  var DEMO_PERIOD = 16000;
  var PHOTO_PERIOD = 4600;
  var PHOTOS = 4;
  var BLOCK_HEIGHT = 841207;

  /* ---------------- procedural "photos" ---------------- */
  function drawPhoto(g, idx, x, y, w, h) {
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    if (idx === 0) {                       /* sunset mountains */
      var sky = g.createLinearGradient(0, y, 0, y + h);
      sky.addColorStop(0, '#2b1a4e'); sky.addColorStop(0.45, '#b84a39');
      sky.addColorStop(0.75, '#f7931a'); sky.addColorStop(1, '#2b1a4e');
      g.fillStyle = sky; g.fillRect(x, y, w, h);
      g.fillStyle = '#ffdf9e';
      g.beginPath(); g.arc(x + w * 0.62, y + h * 0.52, h * 0.13, 0, 7); g.fill();
      ridge(g, x, y + h * 0.62, w, h * 0.38, '#1a1030');
      ridge(g, x, y + h * 0.76, w, h * 0.24, '#0d0a1c');
    } else if (idx === 1) {                /* night city */
      var ns = g.createLinearGradient(0, y, 0, y + h);
      ns.addColorStop(0, '#0a1030'); ns.addColorStop(1, '#101c3f');
      g.fillStyle = ns; g.fillRect(x, y, w, h);
      g.fillStyle = '#e8ecff';
      for (var s = 0; s < 40; s++) {
        var sx = x + ((s * 97) % 100) / 100 * w, sy = y + ((s * 53) % 45) / 100 * h;
        g.globalAlpha = 0.25 + ((s * 31) % 60) / 100;
        g.fillRect(sx, sy, 1.4, 1.4);
      }
      g.globalAlpha = 1;
      for (var b = 0; b < 9; b++) {
        var bw = w * (0.07 + ((b * 37) % 40) / 1000);
        var bh = h * (0.25 + ((b * 61) % 45) / 100);
        var bx = x + 8 + b * (w - 16) / 9;
        g.fillStyle = '#0a0e22';
        g.fillRect(bx, y + h - bh, bw, bh);
        g.fillStyle = 'rgba(250,189,92,0.75)';
        for (var wy = 0; wy < 4; wy++)
          for (var wx = 0; wx < 3; wx++)
            if (((b * 7 + wy * 3 + wx) % 5) < 2)
              g.fillRect(bx + 4 + wx * (bw - 8) / 3, y + h - bh + 6 + wy * (bh - 12) / 4, 2.4, 3.2);
      }
    } else if (idx === 2) {                /* aurora forest */
      var as = g.createLinearGradient(0, y, 0, y + h);
      as.addColorStop(0, '#041a22'); as.addColorStop(1, '#062c2a');
      g.fillStyle = as; g.fillRect(x, y, w, h);
      for (var band = 0; band < 3; band++) {
        g.strokeStyle = 'rgba(' + (band ? '64,220,170' : '90,240,200') + ',0.28)';
        g.lineWidth = 10 - band * 2.5;
        g.beginPath();
        for (var px = 0; px <= w; px += 8) {
          var yy = y + h * (0.2 + band * 0.1) + Math.sin(px / 60 + band * 2) * 16;
          px === 0 ? g.moveTo(x + px, yy) : g.lineTo(x + px, yy);
        }
        g.stroke();
      }
      g.fillStyle = '#03110f';
      for (var t = 0; t < 14; t++) {
        var tx = x + (t * 67 % 100) / 100 * w, th = h * (0.2 + (t * 29 % 30) / 100);
        g.beginPath();
        g.moveTo(tx, y + h); g.lineTo(tx + 7, y + h - th); g.lineTo(tx + 14, y + h);
        g.fill();
      }
    } else {                                /* dawn beach */
      var ds = g.createLinearGradient(0, y, 0, y + h);
      ds.addColorStop(0, '#ffd9b0'); ds.addColorStop(0.5, '#f7a56b');
      ds.addColorStop(0.52, '#4a6a8a'); ds.addColorStop(1, '#24344e');
      g.fillStyle = ds; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.beginPath(); g.arc(x + w * 0.3, y + h * 0.3, h * 0.1, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
      for (var wv = 0; wv < 4; wv++) {
        g.beginPath();
        for (var qx = 0; qx <= w; qx += 10) {
          var qy = y + h * (0.6 + wv * 0.09) + Math.sin(qx / 46 + wv) * 4;
          qx === 0 ? g.moveTo(x + qx, qy) : g.lineTo(x + qx, qy);
        }
        g.stroke();
      }
    }
    g.restore();
  }
  function ridge(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(x, y + h);
    for (var i = 0; i <= 8; i++)
      g.lineTo(x + w * i / 8, y + h - (Math.sin(i * 2.7) * 0.5 + 0.5) * h);
    g.lineTo(x + w, y + h);
    g.fill();
  }

  /* ---------------- frame drawing ---------------- */
  var t0 = performance.now();
  var blockIdx = 0;         /* blocks seen in this demo */
  var solo_wins = 0;        /* illustrative solo blocks won */
  var SOLO_REWARD = 3.325;  /* 3.125 BTC subsidy + ~0.2 BTC fees */
  var lastBlockT = t0;

  /* high-speed candidate-hash stream: each "ticket" is a nonce || hash
   * fragment that re-rolls many times per second — the visual metaphor for
   * trillions of lottery numbers being generated per second. */
  var HASH_ROWS = 5;
  var hashRows = [];
  for (var hr = 0; hr < HASH_ROWS; hr++) {
    hashRows.push({ speed: 40 + hr * 35, last: 0, text: '' });
  }
  function rollHash(len) {
    var s = '';
    for (var i = 0; i < len; i++)
      s += '0123456789abcdef'[(Math.random() * 16) | 0];
    return s;
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function draw(now) {
    /* cover: scale the logical scene to fill the host, centered */
    var scale = Math.max(canvas.width / LW, canvas.height / LH) * 1.12;
    ctx.setTransform(scale, 0, 0, scale,
                     (canvas.width - LW * scale) / 2,
                     (canvas.height - LH * scale) / 2);
    ctx.clearRect(0, 0, LW, LH);

    var t = now - t0;
    var cycle = t % DEMO_PERIOD;
    var frac = cycle / DEMO_PERIOD;             /* 0..1 into the "10 min" */
    var sinceBlock = (now - lastBlockT) / 1000; /* seconds since celebration */
    var celebrating = sinceBlock < 3.0;

    /* table shadow + stand */
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(LW / 2, DEV.y + DEV.h + 66, 150, 14, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#15152a';
    ctx.beginPath();
    ctx.moveTo(LW / 2 - 16, DEV.y + DEV.h);
    ctx.lineTo(LW / 2 + 16, DEV.y + DEV.h);
    ctx.lineTo(LW / 2 + 34, DEV.y + DEV.h + 58);
    ctx.lineTo(LW / 2 - 34, DEV.y + DEV.h + 58);
    ctx.fill();

    /* golden glow while celebrating (edge breathing, <=3s) */
    if (celebrating) {
      var pulse = 0.55 + 0.45 * Math.sin(now / 180);
      var fade = 1 - sinceBlock / 3.0;
      ctx.shadowColor = 'rgba(247,147,26,' + (0.75 * pulse * fade) + ')';
      ctx.shadowBlur = 46 * pulse * fade;
    }

    /* bezel */
    roundRect(ctx, DEV.x, DEV.y, DEV.w, DEV.h, DEV.r);
    var bez = ctx.createLinearGradient(DEV.x, DEV.y, DEV.x, DEV.y + DEV.h);
    bez.addColorStop(0, '#2a2a44'); bez.addColorStop(1, '#191930');
    ctx.fillStyle = bez;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = celebrating ? 'rgba(250,189,92,0.9)' : '#333355';
    ctx.lineWidth = celebrating ? 2 : 1.2;
    ctx.stroke();

    /* screen base */
    roundRect(ctx, SCR.x, SCR.y, SCR.w, SCR.h, SCR.r);
    ctx.fillStyle = '#05050f';
    ctx.fill();

    /* photo slideshow with crossfade */
    var pi = Math.floor(t / PHOTO_PERIOD) % PHOTOS;
    var pf = (t % PHOTO_PERIOD) / PHOTO_PERIOD;
    var fadeLen = 0.18;
    ctx.save();
    roundRect(ctx, SCR.x, SCR.y, SCR.w, SCR.h, SCR.r);
    ctx.clip();
    drawPhoto(ctx, pi, SCR.x, SCR.y, SCR.w, SCR.h);
    if (pf > 1 - fadeLen) {
      ctx.globalAlpha = (pf - (1 - fadeLen)) / fadeLen;
      drawPhoto(ctx, (pi + 1) % PHOTOS, SCR.x, SCR.y, SCR.w, SCR.h);
      ctx.globalAlpha = 1;
    }

    /* high-speed candidate-hash stream over the photo — each line re-rolls
     * dozens of times per second (lottery numbers being generated) */
    ctx.font = '11px ui-monospace, monospace';
    for (var hr = 0; hr < HASH_ROWS; hr++) {
      var row = hashRows[hr];
      if (now - row.last > 1000 / row.speed) {
        row.text = rollHash(56);
        row.last = now;
      }
      var hy = SCR.y + 30 + hr * 22;
      /* dim backing strip keeps hex readable over any photo */
      ctx.fillStyle = 'rgba(5,5,15,0.35)';
      ctx.fillRect(SCR.x + 10, hy - 10, SCR.w - 20, 14);
      ctx.fillStyle = 'rgba(250,189,92,0.6)';
      ctx.fillText(row.text, SCR.x + 16, hy);
    }

    /* mining widget bar */
    ctx.fillStyle = 'rgba(10,10,24,0.82)';
    ctx.fillRect(WID.x, WID.y, WID.w, WID.h);
    ctx.strokeStyle = 'rgba(247,147,26,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(WID.x, WID.y + 0.5); ctx.lineTo(WID.x + WID.w, WID.y + 0.5);
    ctx.stroke();

    /* left: hashrate + SOLO mode */
    ctx.fillStyle = '#9999bb';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SOLO MINING', WID.x + 16, WID.y + 17);
    ctx.fillStyle = '#f7931a';
    ctx.beginPath(); ctx.arc(WID.x + 88, WID.y + 13.5, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px Inter, sans-serif';
    ctx.fillText('30 TH/s', WID.x + 16, WID.y + 35);

    /* center: deliberately empty — the page-level draw strip owns the
     * block countdown; two ticking rings read as a bug */

    /* right: solo blocks won */
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9999bb';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('SOLO BLOCKS (ILLUSTRATIVE)', WID.x + WID.w - 16, WID.y + 17);
    ctx.fillStyle = '#f7931a';
    ctx.font = '700 15px Inter, sans-serif';
    ctx.fillText(solo_wins + ' × 3.125 BTC', WID.x + WID.w - 16, WID.y + 35);
    ctx.textAlign = 'left';

    /* celebration card */
    if (celebrating) {
      var rise = Math.min(1, sinceBlock / 0.35);
      var ch = 66, cw = 340;
      var cardX = SCR.x + (SCR.w - cw) / 2;
      var cardY = SCR.y + 26 + (1 - rise) * 26;
      ctx.globalAlpha = Math.min(1, rise * 1.4) * Math.min(1, (3.0 - sinceBlock) / 0.5);
      roundRect(ctx, cardX, cardY, cw, ch, 10);
      ctx.fillStyle = 'rgba(26,26,46,0.94)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(250,189,92,0.8)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#fabd5c';
      ctx.font = '700 14px Inter, sans-serif';
      ctx.fillText('BLOCK FOUND — SOLO #' + (BLOCK_HEIGHT + blockIdx), cardX + 16, cardY + 22);
      ctx.fillStyle = '#00c853';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.fillText('+' + SOLO_REWARD.toFixed(3) + ' BTC — full block reward', cardX + 16, cardY + 41);
      ctx.fillStyle = '#666688';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText('0000000000000000000' + hash12(BLOCK_HEIGHT + blockIdx) + '…',
                   cardX + 16, cardY + 58);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function hash12(n) {
    var s = '';
    for (var i = 0; i < 12; i++) {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      s += '0123456789abcdef'[n % 16];
    }
    return s;
  }

  function frame(now) {
    /* block boundary crossing detection */
    if (Math.floor((now - t0) / DEMO_PERIOD) !== Math.floor((lastFrameT - t0) / DEMO_PERIOD)) {
      lastBlockT = now;
      blockIdx++;
      solo_wins++;
    }
    lastFrameT = now;
    draw(now);
    if (running) requestAnimationFrame(frame);
  }
  var lastFrameT = t0;
  var running = false;

  function start() { if (!running) { running = true; lastFrameT = performance.now(); requestAnimationFrame(frame); } }
  function stop() { running = false; }

  if (reduced) {
    /* static, informative single frame */
    lastBlockT = performance.now() - 4000;
    draw(performance.now());
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.2 }).observe(host);
  } else {
    start();
  }
})();
