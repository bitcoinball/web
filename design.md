# BitcoinBall 主页设计方案

## 设计理念
融合区块链科技感与财富象征元素，突出系统核心优势

## 视觉元素
- **色彩方案**: 
  - 主背景: `#0f0e17` (深空蓝)
  - 高亮色: `#ff8906` (琥珀金)
  - 霓虹效果: `#e53170` (霓虹粉)
- **字体**: 
  - 标题: `Orbitron`
  - 正文: `Rajdhani`
- **动态效果**: 
  - 比特币粒子背景动画
  - 实时数据仪表盘
  - 幸运号码生成可视化

## 核心区域设计

### 1. Hero Section
```html
<section class="hero">
  <div class="bitcoin-3d-model"></div>
  <h1>BitcoinBall</h1>
  <h2>The Future of High-Speed Lottery</h2>
  <button class="cta-glow">Start Earning Now</button>
</section>
```

### 2. 价值主张卡片
| 优势 | 可视化元素 |
|------|------------|
| Zero Vigorish | 金币图标 + 0% 徽章 |
| 3.125 Bitcoin/10min | 实时倒计时 + BTC图标 |
| 1T Lucky No/s | 数字流粒子动画 |

### 3. Start Earning Now
点击按钮，跳转到购买 BitcoinBall机器页面。


```

## 技术实现
1. Three.js 3D比特币模型
2. WebSocket实时数据流
3. Canvas粒子动画系统
4. 响应式网格布局

## 下一步行动
- [ ] 创建HTML骨架结构
- [ ] 编写基础CSS样式
- [ ] 实现3D比特币模型
- [ ] 集成实时数据API
- [ ] 开发收益计算器模块
