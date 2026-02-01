// 强力球开彩动画
const powerballCanvas = document.getElementById('powerball-canvas');
const powerballCtx = powerballCanvas.getContext('2d');
const powerballResult = document.getElementById('powerball-result');

// 全局变量
let miniParticles = [];
let arrangementCompletedTime = 0; // 记录排列完成的时间

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
    this.life = Infinity; // 默认无限寿命
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

// 创建数字球（带生成动画）
function createNumberBall(x, y, color, number, index) {
  const targetRadius = 25; // 统一目标半径
  const ball = new NumberBall(x, y, targetRadius, color, number);
  
  // 添加生成动画效果
  ball.radius = 8; // 初始小尺寸，稍微大一点
  ball.targetRadius = targetRadius;
  ball.growSpeed = 1.2; // 稍微慢一点的生长速度
  ball.creationOrder = index; // 记录创建顺序
  
  return ball;
}

// 数字球类
class NumberBall {
  constructor(x, y, radius, color, number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.targetRadius = radius; // 目标尺寸
    this.color = color;
    this.number = number;
    this.velocity = { x: 0, y: 0 };
    this.gravity = 0;
    this.bounce = 0.7;
    this.friction = 0.98;
    this.stable = false;
    this.growSpeed = 0; // 生长速度
    this.targetX = null; // 目标X位置（用于排列）
    this.targetY = null; // 目标Y位置（用于排列）
    this.arranging = false; // 是否正在排列
  }

  draw() {
    powerballCtx.beginPath();
    powerballCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    powerballCtx.fillStyle = this.color;
    powerballCtx.fill();
    powerballCtx.closePath();

    // 绘制边框以确保球体清晰可见
    powerballCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    powerballCtx.lineWidth = 1;
    powerballCtx.stroke();

    // 绘制数字 - 动态调整字体大小
    const fontSize = Math.max(12, Math.min(20, this.radius * 0.7)); // 限制字体大小范围
    powerballCtx.fillStyle = 'white';
    powerballCtx.font = `bold ${fontSize}px Arial`;
    powerballCtx.textAlign = 'center';
    powerballCtx.textBaseline = 'middle';
    powerballCtx.fillText(this.number, this.x, this.y);
  }
  
  update() {
    // 如果正在排列，移动到目标位置
    if (this.arranging && this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 2) {
        // 平滑移动到目标位置
        this.x += dx * 0.1;
        this.y += dy * 0.1;
        this.velocity = { x: 0, y: 0 };
      } else {
        // 到达目标位置
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
    
    // 生长动画
    if (this.radius < this.targetRadius) {
      this.radius += this.growSpeed;
      if (this.radius > this.targetRadius) {
        this.radius = this.targetRadius;
      }
      
      // 添加生长时的发光效果
      powerballCtx.shadowBlur = 15;
      powerballCtx.shadowColor = this.color;
    } else {
      powerballCtx.shadowBlur = 0;
    }
  }
}

// 生成强力球动画（粒子碰撞生成数字球）
function startPowerballAnimation() {
  console.log('Starting powerball animation');
  miniParticles = []; // 重置全局变量
  let numberBalls = [];
  const ballColors = ['#FF4136', '#0074D9', '#2ECC40', '#FF851B', '#B10DC9', '#FFDC00'];
  let winningNumbers = [];
  let frameCount = 0;
  
  // 生成6个随机中奖号码
  for (let i = 0; i < 6; i++) {
    winningNumbers.push(Math.floor(Math.random() * 59) + 1);
  }
  console.log('Winning numbers:', winningNumbers);

  // 创建小粒子（用于碰撞）
  for (let i = 0; i < 40; i++) {
    const radius = 6;
    const particle = new MiniParticle(
      Math.random() * (powerballCanvas.width - radius * 2) + radius,
      Math.random() * (powerballCanvas.height - radius * 2) + radius,
      radius,
      ballColors[Math.floor(Math.random() * ballColors.length)]
    );
    miniParticles.push(particle);
  }
  console.log('Created', miniParticles.length, 'mini particles');

  // 动画循环
  function animate() {
    animationId = requestAnimationFrame(animate);
    powerballCtx.clearRect(0, 0, powerballCanvas.width, powerballCanvas.height);
    
    // 绘制机器
    powerballCtx.fillStyle = '#333';
    powerballCtx.fillRect(powerballCanvas.width * 0.2, 0, powerballCanvas.width * 0.6, 20);
    
    // 更新和绘制小粒子
    // 更新和绘制小粒子（过滤掉寿命结束的粒子）
    miniParticles = miniParticles.filter(particle => {
      if (particle.life <= 0) return false;
      
      particle.update(miniParticles);
      particle.draw();
      
      // 减少寿命
      if (particle.life < Infinity) {
        particle.life--;
        particle.opacity = particle.life / 30;
      }
      
      return true;
    });
    
    // 更新和绘制数字球
    numberBalls.forEach((ball, index) => {
      ball.update();
      ball.draw();
      
      // 调试信息：每60帧输出一次球的状态
      if (frameCount % 60 === 0) {
        console.log(`Ball ${index} (num: ${ball.number}): pos(${Math.round(ball.x)}, ${Math.round(ball.y)}) stable: ${ball.stable}, arranging: ${ball.arranging}`);
      }
    });
    
    // 定时生成数字球（每60帧生成一个）
    frameCount++;
    if (numberBalls.length < 6 && frameCount % 60 === 0) {
      const randomParticle = miniParticles[Math.floor(Math.random() * miniParticles.length)];
      if (randomParticle) {
        console.log(`Creating number ball #${numberBalls.length+1} with number: ${winningNumbers[numberBalls.length]}`);
        
        const ball = createNumberBall(
          randomParticle.x,
          randomParticle.y,
          randomParticle.color,
          winningNumbers[numberBalls.length],
          numberBalls.length // 创建顺序
        );
        
        // 添加粒子爆炸效果
        createParticleExplosion(randomParticle.x, randomParticle.y, randomParticle.color, miniParticles);
        
        // 设置初始速度和物理属性
        ball.velocity = { x: (Math.random() - 0.5) * 2, y: 2 };
        ball.gravity = 0.2;
        ball.bounce = 0.7;
        ball.friction = 0.98;
        ball.stable = false;
        
        numberBalls.push(ball);
        
        // 移除被使用的小粒子
        const index = miniParticles.indexOf(randomParticle);
        if (index > -1) {
          miniParticles.splice(index, 1);
        }
      }
    }
    
    // 当所有6个球都生成后，延迟一段时间再开始排列
    if (numberBalls.length === 6 && !numberBalls[0].arranging && frameCount > 300) {
      console.log('All 6 balls generated - starting arrangement');
      
      // 计算排列位置 - 使用实际的球半径
      const actualBallRadius = numberBalls[0].targetRadius || 30; // 使用实际目标半径
      const padding = 50; // 左右边距，增加一些空间
      const availableWidth = powerballCanvas.width - (padding * 2);
      const spacing = availableWidth / (numberBalls.length - 1); // 球之间的间距
      const bottomY = powerballCanvas.height - actualBallRadius - 40; // 底部留出空间
      
      console.log(`Using ball radius: ${actualBallRadius}, padding: ${padding}`);
      
      console.log(`Canvas size: ${powerballCanvas.width}x${powerballCanvas.height}`);
      console.log(`Arrangement: availableWidth=${availableWidth}, spacing=${spacing}, bottomY=${bottomY}`);
      console.log('Balls in order:', numberBalls.map(b => b.number));
      
      // 按产生顺序排序并等距离排列（从左到右）- 使用平滑移动
      const sortedBalls = [...numberBalls].sort((a, b) => a.creationOrder - b.creationOrder);
      
      sortedBalls.forEach((ball, actualIndex) => {
        // 第一个球在padding位置，后续球依次递增
        ball.targetX = padding + spacing * actualIndex;
        ball.targetY = bottomY;
        ball.arranging = true; // 开始排列动画
        ball.stable = false; // 重新激活更新
        
        console.log(`Ball creationOrder ${ball.creationOrder} (number: ${ball.number}) -> position ${actualIndex} -> x=${Math.round(ball.targetX)}, y=${Math.round(ball.targetY)}`);
      });
    }
    
    // 大小验证和一致性检查
    if (numberBalls.length === 6 && frameCount % 120 === 0) { // 每2秒检查一次
      const radii = numberBalls.map(ball => ball.radius);
      const targetRadii = numberBalls.map(ball => ball.targetRadius);
      console.log(`Ball sizes: current=${radii.join(', ')}, target=${targetRadii.join(', ')}`);
      
      // 如果发现大小不一致，强制修正
      const uniformRadius = 25;
      numberBalls.forEach((ball, index) => {
        if (Math.abs(ball.radius - uniformRadius) > 2) {
          console.log(`Correcting ball ${index} size from ${ball.radius} to ${uniformRadius}`);
          ball.radius = uniformRadius;
          ball.targetRadius = uniformRadius;
        }
      });
    }
    
    // 检查是否所有球都排列完成并显示结果
    if (numberBalls.length === 6 && 
        numberBalls.every(ball => ball.stable && !ball.arranging) &&
        powerballResult.textContent === 'Drawing numbers...') {
      
      // 记录排列完成时间
      if (arrangementCompletedTime === 0) {
        arrangementCompletedTime = Date.now();
        console.log('All balls arranged perfectly - showing results');
        
        // 显示中奖号码
        powerballResult.textContent = `Winning Numbers: ${winningNumbers.join(' - ')}`;
        console.log('Displayed winning numbers:', winningNumbers.join(' - '));
      }
      
      // 检查是否已过2秒
      if (Date.now() - arrangementCompletedTime >= 2000) {
        console.log('2 seconds completed - restarting animation cycle...');
        cancelAnimationFrame(animationId);
        miniParticles = [];
        numberBalls = [];
        winningNumbers = [];
        powerballResult.textContent = 'Drawing numbers...';
        arrangementCompletedTime = 0; // 重置计时器
        restartTimer = null;
        startPowerballAnimation();
      }
    }
  }
  
  let animationId = requestAnimationFrame(animate);
  let restartTimer = null;
}

// 粒子爆炸效果
function createParticleExplosion(x, y, color, particlesArray) {
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    
    const particle = new MiniParticle(
      x,
      y,
      Math.random() * 3 + 1,
      color
    );
    
    particle.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    
    particle.life = 30; // 粒子寿命（帧数）
    
    particlesArray.push(particle);
  }
}

// 启动动画
window.addEventListener('load', () => {
  startPowerballAnimation();
});