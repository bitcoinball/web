const canvas = document.getElementById('powerball-canvas');
const ctx = canvas.getContext('2d');
const resultDisplay = document.getElementById('powerball-result');

let animationId = null;
let cycleCount = 0;

function setupCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

setupCanvas();
window.addEventListener('resize', setupCanvas);

class MiniParticle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4
    };
    this.mass = 1;
    this.opacity = 1;
    this.life = Infinity;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
    ctx.globalAlpha = 1;
  }

  update(particles) {
    if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
      this.velocity.y = -this.velocity.y;
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      const dx = this.x - particles[i].x;
      const dy = this.y - particles[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.radius + particles[i].radius) {
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const vx1 = this.velocity.x * cos + this.velocity.y * sin;
        const vy1 = this.velocity.y * cos - this.velocity.x * sin;
        const vx2 = particles[i].velocity.x * cos + particles[i].velocity.y * sin;
        const vy2 = particles[i].velocity.y * cos - particles[i].velocity.x * sin;
        const finalVx1 = ((this.mass - particles[i].mass) * vx1 + 2 * particles[i].mass * vx2) / (this.mass + particles[i].mass);
        const finalVx2 = ((particles[i].mass - this.mass) * vx2 + 2 * this.mass * vx1) / (this.mass + particles[i].mass);
        this.velocity.x = finalVx1 * cos - vy1 * sin;
        this.velocity.y = vy1 * cos + finalVx1 * sin;
        particles[i].velocity.x = finalVx2 * cos - vy2 * sin;
        particles[i].velocity.y = vy2 * cos + finalVx2 * sin;
        const overlap = this.radius + particles[i].radius - distance;
        this.x += overlap * cos * 0.5;
        this.y += overlap * sin * 0.5;
        particles[i].x -= overlap * cos * 0.5;
        particles[i].y -= overlap * sin * 0.5;
      }
    }
  }
}

class NumberBall {
  constructor(x, y, radius, color, number, index) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.targetRadius = radius;
    this.color = color;
    this.number = number;
    this.index = index;
    this.velocity = { x: 0, y: 0 };
    this.gravity = 0.15;
    this.bounce = 0.6;
    this.friction = 0.97;
    this.stable = false;
    this.growSpeed = 0.8;
    this.targetX = null;
    this.targetY = null;
    this.arranging = false;
  }

  draw() {
    const r = this.radius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.closePath();

    const grad = ctx.createRadialGradient(this.x - r * 0.3, this.y - r * 0.3, r * 0.1, this.x, this.y, r);
    grad.addColorStop(0, lightenColor(this.color, 60));
    grad.addColorStop(0.7, this.color);
    grad.addColorStop(1, darkenColor(this.color, 40));
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur = this.arranging || this.stable ? 20 : 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const highlight = ctx.createRadialGradient(this.x - r * 0.3, this.y - r * 0.3, 1, this.x - r * 0.3, this.y - r * 0.3, r * 0.5);
    highlight.addColorStop(0, 'rgba(255,255,255,0.6)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.max(14, Math.min(22, r * 0.7))}px 'Orbitron', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillText(this.number, this.x, this.y + 1);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  update() {
    if (this.arranging && this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const speed = 0.12;
        this.x += dx * speed;
        this.y += dy * speed;
        this.velocity = { x: 0, y: 0 };
      } else {
        this.x = this.targetX;
        this.y = this.targetY;
        this.arranging = false;
        this.stable = true;
      }
      return;
    }
    if (this.stable) return;

    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocity.y = -this.velocity.y * this.bounce;
      if (Math.abs(this.velocity.y) < 0.5) {
        this.velocity.y = 0;
        this.stable = true;
      }
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocity.x = -this.velocity.x * this.bounce;
    } else if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.velocity.x = -this.velocity.x * this.bounce;
    }
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    if (this.radius < this.targetRadius) {
      this.radius += this.growSpeed;
      if (this.radius > this.targetRadius) this.radius = this.targetRadius;
    }
  }
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `rgb(${R},${G},${B})`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `rgb(${R},${G},${B})`;
}

function createExplosion(x, y, color, arr) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    const p = new MiniParticle(x, y, Math.random() * 3 + 1, color);
    p.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    p.life = 30 + Math.random() * 20;
    arr.push(p);
  }
}

function drawMachineBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#0f0e17');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = `rgba(255, 137, 6, ${0.03 + Math.random() * 0.03})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const y = 30 + i * 50 + Math.sin(Date.now() / 3000 + i) * 10;
    for (let x = 0; x < canvas.width; x += 5) {
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 3);
    }
    ctx.stroke();
  }

  const topBar = ctx.createLinearGradient(0, 0, canvas.width, 0);
  topBar.addColorStop(0, 'transparent');
  topBar.addColorStop(0.3, '#ff8906');
  topBar.addColorStop(0.5, '#ffd700');
  topBar.addColorStop(0.7, '#ff8906');
  topBar.addColorStop(1, 'transparent');
  ctx.fillStyle = topBar;
  ctx.fillRect(0, 0, canvas.width, 3);

  const bottomGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height, 0, canvas.width / 2, canvas.height, 300);
  bottomGlow.addColorStop(0, 'rgba(255, 137, 6, 0.1)');
  bottomGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, canvas.height - 300, canvas.width, 300);
}

function startPowerballAnimation() {
  cycleCount++;
  if (animationId) cancelAnimationFrame(animationId);

  let numberBalls = [];
  const ballColors = ['#FF4136', '#0074D9', '#2ECC40', '#FF851B', '#B10DC9', '#FFDC00'];
  let winningNumbers = [];
  let frameCount = 0;
  let arrangementCompleted = false;
  let arrangementTime = 0;
  let miniParticles = [];

  for (let i = 0; i < 6; i++) {
    winningNumbers.push(Math.floor(Math.random() * 59) + 1);
  }

  for (let i = 0; i < 30; i++) {
    const r = 5 + Math.random() * 3;
    miniParticles.push(new MiniParticle(
      Math.random() * (canvas.width - r * 2) + r,
      Math.random() * canvas.height * 0.6 + r,
      r,
      ballColors[Math.floor(Math.random() * ballColors.length)]
    ));
  }

  resultDisplay.textContent = 'Drawing numbers...';

  function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMachineBackground();

    miniParticles = miniParticles.filter(p => {
      if (p.life <= 0) return false;
      p.update(miniParticles);
      p.draw();
      if (p.life < Infinity) {
        p.life--;
        p.opacity = p.life / 30;
      }
      return true;
    });

    numberBalls.forEach(ball => {
      ball.update();
      ball.draw();
    });

    frameCount++;
    if (numberBalls.length < 6 && frameCount % 50 === 0 && miniParticles.length > 0) {
      const src = miniParticles[Math.floor(Math.random() * miniParticles.length)];
      if (src) {
        const num = winningNumbers[numberBalls.length];
        const ball = new NumberBall(src.x, src.y, 25, src.color, num, numberBalls.length);
        ball.velocity = { x: (Math.random() - 0.5) * 2, y: -3 };
        ball.gravity = 0.15;
        numberBalls.push(ball);
        createExplosion(src.x, src.y, src.color, miniParticles);
        const idx = miniParticles.indexOf(src);
        if (idx > -1) miniParticles.splice(idx, 1);
      }
    }

    if (numberBalls.length === 6 && !numberBalls[0].arranging && frameCount > 240) {
      const sorted = [...numberBalls].sort((a, b) => a.index - b.index);
      const r = 25;
      const totalW = sorted.length * r * 2 + (sorted.length - 1) * 25;
      const startX = (canvas.width - totalW) / 2 + r;
      const bottomY = canvas.height - r - 50;

      sorted.forEach((ball, i) => {
        ball.targetX = startX + i * (r * 2 + 25);
        ball.targetY = bottomY;
        ball.arranging = true;
        ball.stable = false;
      });
    }

    if (numberBalls.length === 6 &&
        numberBalls.every(b => b.stable && !b.arranging) &&
        !arrangementCompleted) {
      arrangementCompleted = true;
      arrangementTime = Date.now();
      resultDisplay.textContent = `🏆 Winning Numbers: ${winningNumbers.join('  ·  ')} 🏆`;
      resultDisplay.style.color = '#ffd700';
    }

    if (arrangementCompleted && Date.now() - arrangementTime >= 3000) {
      cancelAnimationFrame(animationId);
      animationId = null;
      setTimeout(startPowerballAnimation, 500);
    }
  }

  animate();
}

window.addEventListener('load', startPowerballAnimation);
