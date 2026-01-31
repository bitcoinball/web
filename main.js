// 比特币粒子背景系统
const canvas = document.getElementById('bitcoinParticles');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 粒子类
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
    this.color = `hsl(${Math.random() * 60 + 20}, 100%, 60%)`;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
  }
  
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加发光效果
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
  }
}

// 创建粒子
const particles = [];
for (let i = 0; i < 150; i++) {
  particles.push(new Particle());
}

// 动画循环
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制比特币符号轮廓
  ctx.font = 'bold 120px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(255, 137, 6, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeText('₿', canvas.width/2, canvas.height/2);
  
  // 更新和绘制粒子
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  
  requestAnimationFrame(animate);
}

animate();

// 窗口大小调整时更新画布
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// 价值主张动画系统
const vigorishCanvas = document.getElementById('vigorishCanvas');
const bitcoinCanvas = document.getElementById('bitcoinCanvas');
const luckyCanvas = document.getElementById('luckyCanvas');
const returnCanvas = document.getElementById('returnCanvas');
const investmentCanvas = document.getElementById('investmentCanvas');
const electricityCanvas = document.getElementById('electricityCanvas');

const vigorishCtx = vigorishCanvas.getContext('2d');
const bitcoinCtx = bitcoinCanvas.getContext('2d');
const luckyCtx = luckyCanvas.getContext('2d');
const returnCtx = returnCanvas.getContext('2d');
const investmentCtx = investmentCanvas.getContext('2d');
const electricityCtx = electricityCanvas.getContext('2d');

// 设置canvas尺寸
[vigorishCanvas, bitcoinCanvas, luckyCanvas, returnCanvas, investmentCanvas, electricityCanvas].forEach(canvas => {
  canvas.width = 100;
  canvas.height = 100;
});

// Zero Vigorish动画 - 禁止符号
function animateVigorish() {
  vigorishCtx.clearRect(0, 0, 100, 100);
  
  const time = Date.now() / 1000;
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  
  // 绘制圆圈
  vigorishCtx.beginPath();
  vigorishCtx.arc(50, 50, 30, 0, Math.PI * 2);
  vigorishCtx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
  vigorishCtx.lineWidth = 4;
  vigorishCtx.stroke();
  
  // 绘制斜线
  vigorishCtx.beginPath();
  vigorishCtx.moveTo(30, 30);
  vigorishCtx.lineTo(70, 70);
  vigorishCtx.stroke();
  
  requestAnimationFrame(animateVigorish);
}

// 3.125 Bitcoin/10min动画 - 比特币符号
function animateBitcoin() {
  bitcoinCtx.clearRect(0, 0, 100, 100);
  
  const time = Date.now() / 1000;
  const rotation = time * 0.5;
  
  // 绘制旋转的比特币符号
  bitcoinCtx.save();
  bitcoinCtx.translate(50, 50);
  bitcoinCtx.rotate(rotation);
  bitcoinCtx.font = 'bold 60px Orbitron';
  bitcoinCtx.textAlign = 'center';
  bitcoinCtx.textBaseline = 'middle';
  bitcoinCtx.fillStyle = '#ff8906';
  bitcoinCtx.fillText('₿', 0, 0);
  bitcoinCtx.restore();
  
  // 绘制文字
  bitcoinCtx.fillStyle = '#fffffe';
  bitcoinCtx.font = '10px Orbitron';
  bitcoinCtx.textAlign = 'center';
  bitcoinCtx.fillText('3.125', 50, 90);
  
  requestAnimationFrame(animateBitcoin);
}

// 1T Lucky No/s动画 - 骰子
function animateLucky() {
  luckyCtx.clearRect(0, 0, 100, 100);
  
  const time = Date.now() / 1000;
  const diceValue = Math.floor(time % 6) + 1;
  
  // 绘制骰子
  luckyCtx.fillStyle = '#ff8906';
  luckyCtx.fillRect(30, 30, 40, 40);
  
  // 绘制骰子点数
  luckyCtx.fillStyle = '#0f0e17';
  luckyCtx.font = 'bold 20px Orbitron';
  luckyCtx.textAlign = 'center';
  luckyCtx.textBaseline = 'middle';
  luckyCtx.fillText(diceValue.toString(), 50, 50);
  
  // 绘制文字
  luckyCtx.fillStyle = '#fffffe';
  luckyCtx.font = '10px Orbitron';
  luckyCtx.fillText('1T/s', 50, 90);
  
  requestAnimationFrame(animateLucky);
}

// Positive Expected Return动画 - 上升趋势图
function animateReturn() {
  returnCtx.clearRect(0, 0, 100, 100);
  
  const time = Date.now() / 1000;
  const progress = (time * 0.5) % 1;
  
  // 绘制上升趋势线
  returnCtx.beginPath();
  returnCtx.moveTo(10, 90);
  returnCtx.lineTo(30, 70 - 40 * progress);
  returnCtx.lineTo(50, 80 - 30 * progress);
  returnCtx.lineTo(70, 40 - 50 * progress);
  returnCtx.lineTo(90, 60 - 40 * progress);
  returnCtx.strokeStyle = '#4ade80';
  returnCtx.lineWidth = 2;
  returnCtx.stroke();
  
  // 绘制上升箭头
  returnCtx.beginPath();
  returnCtx.moveTo(50, 20);
  returnCtx.lineTo(45, 30);
  returnCtx.lineTo(55, 30);
  returnCtx.closePath();
  returnCtx.fillStyle = '#4ade80';
  returnCtx.fill();
  
  requestAnimationFrame(animateReturn);
}

// Low $100 Investment动画 - 钱包和金币
function animateInvestment() {
  investmentCtx.clearRect(0, 0, 100, 100);
  
  const time = Date.now() / 1000;
  const progress = (time * 2) % 1;
  
  // 绘制钱包
  investmentCtx.fillStyle = '#ff8906';
  investmentCtx.fillRect(30, 70, 40, 20);
  investmentCtx.fillRect(35, 60, 30, 10);
  
  // 绘制金币掉落
  const coinY = 20 + 50 * progress;
  investmentCtx.beginPath();
  investmentCtx.arc(50, coinY, 8, 0, Math.PI * 2);
  investmentCtx.fillStyle = '#ffd700';
  investmentCtx.fill();
  
  // 绘制$100文字
  investmentCtx.fillStyle = '#fffffe';
  investmentCtx.font = 'bold 16px Orbitron';
  investmentCtx.textAlign = 'center';
  investmentCtx.fillText('$100', 50, 85);
  
  requestAnimationFrame(animateInvestment);
}

// Ultra-Low Electricity动画 - 闪电和价格
function animateElectricity() {
  electricityCtx.clearRect(0, 0, 100, 100);
  
  const time = Date.now() / 200;
  const blink = Math.abs(Math.sin(time * 5)) > 0.5 ? 1 : 0.5;
  
  // 绘制闪电
  electricityCtx.fillStyle = `rgba(255, 230, 0, ${blink})`;
  electricityCtx.beginPath();
  electricityCtx.moveTo(50, 20);
  electricityCtx.lineTo(65, 50);
  electricityCtx.lineTo(55, 50);
  electricityCtx.lineTo(70, 80);
  electricityCtx.lineTo(45, 45);
  electricityCtx.lineTo(55, 45);
  electricityCtx.closePath();
  electricityCtx.fill();
  
  // 绘制价格
  electricityCtx.fillStyle = '#fffffe';
  electricityCtx.font = '10px Orbitron';
  electricityCtx.textAlign = 'center';
  electricityCtx.fillText('$0.0005', 50, 95);
  
  requestAnimationFrame(animateElectricity);
}

// 启动所有动画
animateVigorish();
animateBitcoin();
animateLucky();
animateReturn();
animateInvestment();
animateElectricity();