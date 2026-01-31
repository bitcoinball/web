// 强力球开彩动画
const powerballCanvas = document.getElementById('powerball-canvas');
const powerballCtx = powerballCanvas.getContext('2d');
const powerballResult = document.getElementById('powerball-result');

// 设置画布尺寸
function setupCanvas(canvas) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

setupCanvas(powerballCanvas);
window.addEventListener('resize', () => setupCanvas(powerballCanvas));

// 小粒子类（用于碰撞生成数字球）
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
    this.collisionCount = 0;
  }

  draw() {
    powerballCtx.beginPath();
    powerballCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    powerballCtx.fillStyle = this.color;
    powerballCtx.fill();
    powerballCtx.closePath();
  }

  update(particles) {
    // 边界碰撞
    if (this.x - this.radius <= 0 || this.x + this.radius >= powerballCanvas.width) {
      this.velocity.x = -this.velocity.x;
    }
    
    if (this.y - this.radius <= 0 || this.y + this.radius >= powerballCanvas.height) {
      this.velocity.y = -this.velocity.y;
    }
    
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // 粒子碰撞检测
    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      
      const dx = this.x - particles[i].x;
      const dy = this.y - particles[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.radius + particles[i].radius) {
        // 碰撞处理
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        
        // 旋转速度
        const vx1 = this.velocity.x * cos + this.velocity.y * sin;
        const vy1 = this.velocity.y * cos - this.velocity.x * sin;
        const vx2 = particles[i].velocity.x * cos + particles[i].velocity.y * sin;
        const vy2 = particles[i].velocity.y * cos - particles[i].velocity.x * sin;
        
        // 碰撞后速度
        const finalVx1 = ((this.mass - particles[i].mass) * vx1 + 2 * particles[i].mass * vx2) / (this.mass + particles[i].mass);
        const finalVx2 = ((particles[i].mass - this.mass) * vx2 + 2 * this.mass * vx1) / (this.mass + particles[i].mass);
        
        // 旋转回原坐标系
        this.velocity.x = finalVx1 * cos - vy1 * sin;
        this.velocity.y = vy1 * cos + finalVx1 * sin;
        particles[i].velocity.x = finalVx2 * cos - vy2 * sin;
        particles[i].velocity.y = vy2 * cos + finalVx2 * sin;
        
        // 防止粘连
        const overlap = this.radius + particles[i].radius - distance;
        this.x += overlap * cos * 0.5;
        this.y += overlap * sin * 0.5;
        particles[i].x -= overlap * cos * 0.5;
        particles[i].y -= overlap * sin * 0.5;
        
        // 增加碰撞计数
        this.collisionCount++;
        particles[i].collisionCount++;
        
        return true; // 发生碰撞
      }
    }
    
    return false; // 未发生碰撞
  }
}

// 数字球类
class NumberBall {
  constructor(x, y, radius, color, number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.number = number;
    this.velocity = { x: 0, y: 0 };
    this.gravity = 0;
    this.bounce = 0.7;
    this.friction = 0.98;
    this.stable = false;
  }

  draw() {
    powerballCtx.beginPath();
    powerballCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    powerballCtx.fillStyle = this.color;
    powerballCtx.fill();
    powerballCtx.closePath();

    // 绘制数字
    powerballCtx.fillStyle = 'white';
    powerballCtx.font = `${this.radius * 0.6}px Arial`;
    powerballCtx.textAlign = 'center';
    powerballCtx.textBaseline = 'middle';
    powerballCtx.fillText(this.number, this.x, this.y);
  }
  
  update() {
    if (this.stable) return;
    
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // 边界碰撞检测
    if (this.y + this.radius > powerballCanvas.height) {
      this.y = powerballCanvas.height - this.radius;
      this.velocity.y = -this.velocity.y * this.bounce;
      
      // 如果速度很小，则稳定
      if (Math.abs(this.velocity.y) < 0.5) {
        this.velocity.y = 0;
        this.stable = true;
      }
    }

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocity.x = -this.velocity.x * this.bounce;
    } else if (this.x + this.radius > powerballCanvas.width) {
      this.x = powerballCanvas.width - this.radius;
      this.velocity.x = -this.velocity.x * this.bounce;
    }

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
  }
}

// 生成强力球动画（粒子碰撞生成数字球）
function startPowerballAnimation() {
  let miniParticles = [];
  let numberBalls = [];
  const ballColors = ['#FF4136', '#0074D9', '#2ECC40', '#FF851B', '#B10DC9', '#FFDC00'];
  let winningNumbers = [];
  
  // 生成6个随机中奖号码
  for (let i = 0; i < 6; i++) {
    winningNumbers.push(Math.floor(Math.random() * 59) + 1);
  }

  // 创建小粒子（用于碰撞）
  for (let i = 0; i < 20; i++) {
    const radius = 8;
    const particle = new MiniParticle(
      Math.random() * (powerballCanvas.width - radius * 2) + radius,
      Math.random() * (powerballCanvas.height - radius * 2) + radius,
      radius,
      ballColors[Math.floor(Math.random() * ballColors.length)]
    );
    miniParticles.push(particle);
  }

  // 动画循环
  function animate() {
    animationId = requestAnimationFrame(animate);
    powerballCtx.clearRect(0, 0, powerballCanvas.width, powerballCanvas.height);
    
    // 绘制机器
    powerballCtx.fillStyle = '#333';
    powerballCtx.fillRect(powerballCanvas.width * 0.2, 0, powerballCanvas.width * 0.6, 20);
    
    // 更新和绘制小粒子
    miniParticles.forEach(particle => {
      particle.update(miniParticles);
      particle.draw();
    });
    
    // 更新和绘制数字球
    numberBalls.forEach(ball => {
      ball.update();
      ball.draw();
    });
    
    // 当小粒子碰撞次数达到阈值时，生成数字球
    miniParticles = miniParticles.filter(particle => {
      if (particle.collisionCount >= 3 && numberBalls.length < 6) {
        // 创建数字球
        const ball = new NumberBall(
          particle.x,
          particle.y,
          30,
          particle.color,
          winningNumbers[numberBalls.length]
        );
        
        // 设置初始速度（向下）
        ball.velocity = { x: (Math.random() - 0.5) * 2, y: 2 };
        ball.gravity = 0.2;
        ball.bounce = 0.7;
        ball.friction = 0.98;
        
        numberBalls.push(ball);
        return false; // 移除小粒子
      }
      return true; // 保留小粒子
    });
    
    // 当所有数字球都生成且稳定时，按跌落顺序等距离排列
    if (numberBalls.length === 6 && miniParticles.length === 0 &&
        numberBalls.every(ball => ball.stable)) {
      console.log('All balls stable - arranging in order');
      
      // 计算排列位置
      const ballRadius = 30;
      const totalWidth = powerballCanvas.width * 0.8;
      const startX = (powerballCanvas.width - totalWidth) / 2 + ballRadius;
      const endX = powerballCanvas.width - startX;
      const spacing = (endX - startX) / (numberBalls.length - 1);
      const bottomY = powerballCanvas.height - ballRadius - 20;
      
      console.log(`Canvas size: ${powerballCanvas.width}x${powerballCanvas.height}`);
      console.log(`Arrangement: startX=${startX}, spacing=${spacing}, bottomY=${bottomY}`);
      
      // 按跌落顺序（生成顺序）排列
      numberBalls.forEach((ball, index) => {
        ball.x = startX + index * spacing;
        ball.y = bottomY;
        ball.velocity = { x: 0, y: 0 }; // Stop all movement
        ball.stable = true; // Ensure they stay in place
        
        console.log(`Ball ${index} position: x=${ball.x}, y=${ball.y}`);
      });
      
      // 在动画下方显示数字
      powerballResult.textContent = `Winning Numbers: ${winningNumbers.join(' - ')}`;
      console.log('Displayed winning numbers:', winningNumbers.join(' - '));
      
      // 3秒后重新开始动画
      if (!restartTimer) {
        restartTimer = setTimeout(() => {
          cancelAnimationFrame(animationId);
          miniParticles = [];
          numberBalls = [];
          winningNumbers = [];
          restartTimer = null;
          startPowerballAnimation();
        }, 3000);
      }
    }
  }
  
  let animationId = requestAnimationFrame(animate);
  let restartTimer = null;
}

// 启动动画
window.addEventListener('load', () => {
  startPowerballAnimation();
});