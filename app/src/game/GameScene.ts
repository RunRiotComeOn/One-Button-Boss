import { Player } from './Player';
import { Boss } from './Boss';
import { BulletPool } from './Bullet';

export interface GameStats {
  score: number;
  grazeCount: number;
  time: number;
  health: number;
  bossHealth: number;
  bossPhase: number;
  dashCooldown: number;
  dashCooldownMax: number;
}

export class GameScene extends (window as any).Phaser.Scene {
  // 游戏对象
  player!: Player;
  boss!: Boss;
  bulletPool!: BulletPool;
  
  // 输入
  cursors!: any;
  spaceKey!: any;
  mousePointer!: any;
  
  // 游戏状态
  isGameOver: boolean = false;
  isPaused: boolean = false;
  gameTime: number = 0;
  
  // 得分系统
  score: number = 0;
  grazeCount: number = 0;
  
  // 慢动作系统
  slowMotionActive: boolean = false;
  slowMotionTimer: number = 0;
  
  // 升级系统
  upgrades = {
    dashCooldownReduction: 0,
    dashDistanceIncrease: 0,
    grazeScoreMultiplier: 1,
    lifeSteal: false
  };
  
  // UI 回调
  onStatsUpdate?: (stats: GameStats) => void;
  onGameOver?: (score: number, time: number) => void;
  onBossDefeated?: () => void;
  
  // 音效
  sounds: { [key: string]: any } = {};
  
  constructor() {
    super({ key: 'GameScene' });
  }
  
  preload() {
    // 创建音效（使用合成音效）
    this.createSynthSounds();
  }
  
  createSynthSounds() {
    // 使用 Web Audio API 创建合成音效
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 存储音效生成函数
    (this as any).soundGenerators = {
      dash: () => this.generateTone(audioContext, 800, 0.1, 'sawtooth', 0.3),
      hit: () => this.generateTone(audioContext, 200, 0.2, 'square', 0.4),
      graze: () => this.generateTone(audioContext, 1200, 0.05, 'sine', 0.2),
      'boss-attack': () => this.generateTone(audioContext, 400, 0.15, 'sawtooth', 0.25),
      'boss-hit': () => this.generateTone(audioContext, 150, 0.3, 'square', 0.5),
      explosion: () => this.generateNoise(audioContext, 0.3, 0.4),
      'slow-motion': () => this.generateTone(audioContext, 600, 0.5, 'sine', 0.2)
    };
  }
  
  generateTone(audioContext: AudioContext, frequency: number, duration: number, type: OscillatorType, volume: number) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }
  
  generateNoise(audioContext: AudioContext, duration: number, volume: number) {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    noise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start(audioContext.currentTime);
  }
  
  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    
    // 创建输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey((window as any).Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.mousePointer = this.input.activePointer;
    
    // 创建背景效果（必须在玩家和Boss之前，否则会遮挡）
    this.createBackground();

    // 创建子弹池
    this.bulletPool = new BulletPool(this, 500);

    // 创建玩家
    this.player = new Player(
      this,
      this.scale.width / 2,
      this.scale.height * 0.8
    );

    // 创建 Boss
    this.boss = new Boss(
      this,
      this.scale.width / 2,
      this.scale.height / 4,
      this.bulletPool
    );

    // 设置碰撞
    this.setupCollisions();
    
    // 重置状态
    this.resetGame();
    
    // 覆盖音效播放
    (this.sound as any).play = (key: string) => {
      const generator = (this as any).soundGenerators[key];
      if (generator) {
        generator();
      }
      return {} as any;
    };
  }
  
  setupCollisions() {
    // 玩家与子弹碰撞
    this.physics.add.overlap(
      this.player.sprite,
      this.bulletPool.getPool(),
      this.handlePlayerBulletCollision,
      (_player: any, bullet: any) => {
        return bullet.active && !bullet.isFake;
      },
      this
    );
    
    // 冲刺穿过 Boss 造成伤害
    this.physics.add.overlap(
      this.player.sprite,
      this.boss.sprite,
      this.handlePlayerBossCollision,
      null,
      this
    );
  }
  
  createBackground() {
    // 像素风格背景 - 深色底色
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0f, 1);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // 像素网格 - 稀疏格子（性能优化）
    const gridSize = 32;
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x00ffc8, 0.12);

    for (let x = 0; x <= this.scale.width; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, this.scale.height);
    }
    for (let y = 0; y <= this.scale.height; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(this.scale.width, y);
    }
    gridGraphics.strokePath();
    
    // 添加像素装饰块 - 随机分布
    const decorGraphics = this.add.graphics();
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(Math.random() * (this.scale.width / pixelSize)) * pixelSize;
      const y = Math.floor(Math.random() * (this.scale.height / pixelSize)) * pixelSize;
      const size = pixelSize * (1 + Math.floor(Math.random() * 2));
      const alpha = 0.1 + Math.random() * 0.2;
      
      // 随机颜色：青色、紫色、粉色
      const colors = [0x00ffc8, 0xff00ff, 0xff0066];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      decorGraphics.fillStyle(color, alpha);
      decorGraphics.fillRect(x, y, size, size);
    }
    
    // 添加发光效果层
    const glow = this.add.graphics();
    glow.fillStyle(0x0a0a0f, 0.7);
    glow.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // 角落发光效果
    const cornerGlow = this.add.graphics();
    // 左上角青色发光
    cornerGlow.fillStyle(0x00ffc8, 0.05);
    cornerGlow.fillRect(0, 0, 100, 100);
    // 右下角粉色发光
    cornerGlow.fillStyle(0xff0066, 0.05);
    cornerGlow.fillRect(this.scale.width - 100, this.scale.height - 100, 100, 100);
  }
  
  resetGame() {
    this.isGameOver = false;
    this.isPaused = false;
    this.gameTime = 0;
    this.score = 0;
    this.grazeCount = 0;
    this.slowMotionActive = false;
    this.slowMotionTimer = 0;
  }
  
  update(time: number, delta: number) {
    if (this.isGameOver || this.isPaused) return;
    
    // 应用慢动作效果
    let timeScale = this.slowMotionActive ? 0.3 : 1;
    let adjustedDelta = delta * timeScale;
    
    // 更新慢动作计时器
    if (this.slowMotionActive) {
      this.slowMotionTimer -= delta;
      if (this.slowMotionTimer <= 0) {
        this.deactivateSlowMotion();
      }
    }
    
    // 更新游戏时间
    this.gameTime += adjustedDelta;
    
    // 更新玩家
    this.player.update(adjustedDelta, this.cursors, this.spaceKey, this.mousePointer);
    
    // 更新 Boss
    this.boss.update(adjustedDelta, this.player.getPosition());
    
    // 更新子弹
    this.bulletPool.getPool().children.entries.forEach((bullet: any) => {
      if (bullet.active) {
        bullet.update(time, adjustedDelta, this.player.getPosition());
      }
    });
    
    // 检查玩家是否在减速区域
    this.player.slowed = this.boss.isPlayerInSlowZone(this.player.getPosition());

    // 检查擦弹
    this.checkGraze();
    
    // 更新 UI
    this.updateStats();
  }
  
  handlePlayerBulletCollision(_playerSprite: any, bullet: any) {
    const bulletObj = bullet;
    
    if (!bulletObj.active || bulletObj.isFake) return;
    
    // 如果玩家正在冲刺，销毁子弹
    if (this.player.isDashing) {
      bulletObj.destroy();
      return;
    }
    
    // 检查是否可以触发慢动作（在0.1秒内躲过致命攻击）
    const distance = (window as any).Phaser.Math.Distance.Between(
      this.player.sprite.x, this.player.sprite.y,
      bulletObj.x, bulletObj.y
    );
    
    if (distance < 20 && !this.slowMotionActive) {
      this.activateSlowMotion();
    }
    
    // 玩家受伤
    if (this.player.takeDamage()) {
      bulletObj.destroy();
      
      // 检查游戏结束
      if (this.player.health <= 0) {
        this.gameOver();
      }
    }
  }
  
  handlePlayerBossCollision() {
    // 冲刺穿过 Boss 造成伤害
    if (this.player.isDashing && this.player.isInvincible) {
      const isDead = this.boss.takeDamage(5);

      // 生命偷取
      if (this.upgrades.lifeSteal) {
        this.player.heal();
      }

      // 得分奖励
      this.score += 100;

      // 特效
      this.createHitEffect(this.boss.getPosition().x, this.boss.getPosition().y);

      if (isDead) {
        this.bossDefeated();
      }
      return;
    }

    // 非冲刺状态触怪即死
    if (!this.player.isDashing && !this.player.isInvincible) {
      this.player.health = 0;
      this.player.isInvincible = true;
      this.scene.sound.play('hit', { volume: 0.6 });
      this.cameras.main.shake(300, 0.02);
      this.gameOver();
    }
  }
  
  checkGraze() {
    if (!this.player.canGraze()) return;
    
    const playerPos = this.player.getPosition();
    let grazed = false;
    
    this.bulletPool.getPool().children.entries.forEach((bullet: any) => {
      if (!bullet.active || bullet.isFake) return;
      
      const distance = (window as any).Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y,
        bullet.x, bullet.y
      );
      
      // 擦弹判定：在擦弹半径内但不在碰撞半径内
      if (distance < this.player.grazeRadius && distance > 12) {
        grazed = true;
        this.grazeCount++;
        this.score += 10 * this.upgrades.grazeScoreMultiplier;
        
        // 创建擦弹效果
        this.createGrazeEffect(bullet.x, bullet.y);
      }
    });
    
    if (grazed) {
      this.player.doGraze();
      (this.sound as any).play('graze', { volume: 0.2 });
    }
  }
  
  createGrazeEffect(x: number, y: number) {
    // 像素风格擦弹效果 - 小方块向外扩散
    const pixelSize = 4;
    const graphics = this.add.graphics();
    
    // 绘制像素十字
    graphics.fillStyle(0x00ffc8, 0.8);
    graphics.fillRect(x - pixelSize, y - pixelSize * 2, pixelSize * 2, pixelSize);
    graphics.fillRect(x - pixelSize, y + pixelSize, pixelSize * 2, pixelSize);
    graphics.fillRect(x - pixelSize * 2, y - pixelSize, pixelSize, pixelSize * 2);
    graphics.fillRect(x + pixelSize, y - pixelSize, pixelSize, pixelSize * 2);
    
    graphics.setBlendMode((window as any).Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: graphics,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        graphics.destroy();
      }
    });
  }
  
  createHitEffect(x: number, y: number) {
    // 像素风格击中效果
    const graphics = this.add.graphics();
    const pixelSize = 6;
    
    // 中心方块
    graphics.fillStyle(0xff0066, 1);
    graphics.fillRect(x - pixelSize, y - pixelSize, pixelSize * 2, pixelSize * 2);
    
    // 周围小方块
    graphics.fillStyle(0xff00ff, 0.7);
    graphics.fillRect(x - pixelSize * 2, y - pixelSize * 2, pixelSize, pixelSize);
    graphics.fillRect(x + pixelSize, y - pixelSize * 2, pixelSize, pixelSize);
    graphics.fillRect(x - pixelSize * 2, y + pixelSize, pixelSize, pixelSize);
    graphics.fillRect(x + pixelSize, y + pixelSize, pixelSize, pixelSize);
    
    graphics.setBlendMode((window as any).Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: graphics,
      alpha: 0,
      scale: 1.8,
      duration: 300,
      onComplete: () => {
        graphics.destroy();
      }
    });
  }
  
  activateSlowMotion() {
    this.slowMotionActive = true;
    this.slowMotionTimer = 300; // 0.3秒慢动作
    
    // 屏幕震动
    this.cameras.main.shake(100, 0.01);
    
    // 音效
    (this.sound as any).play('slow-motion', { volume: 0.3 });
    
    // 视觉特效
    this.cameras.main.setZoom(1.05);
    this.cameras.main.setAlpha(0.9);
  }
  
  deactivateSlowMotion() {
    this.slowMotionActive = false;
    this.cameras.main.setZoom(1);
    this.cameras.main.setAlpha(1);
  }
  
  spawnBullets(x: number, y: number, count: number, color: number, speed: number) {
    return this.bulletPool.spawnCircle(x, y, count, speed, color);
  }
  
  bossDefeated() {
    // Boss 死亡特效 - 像素风格爆炸
    const bossPos = this.boss.getPosition();
    const explosion = this.add.graphics();
    const pixelSize = 8;
    
    // 绘制像素爆炸效果 - 多个方块向外扩散
    for (let ring = 0; ring < 4; ring++) {
      const count = 6 + ring * 2;
      const radius = 20 + ring * 15;
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + ring * 0.5;
        const px = bossPos.x + Math.cos(angle) * radius;
        const py = bossPos.y + Math.sin(angle) * radius;
        
        // 随机颜色
        const colors = [0xff0066, 0xff00ff, 0xffff00, 0x00ffc8];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        explosion.fillStyle(color, 1 - ring * 0.2);
        explosion.fillRect(px - pixelSize/2, py - pixelSize/2, pixelSize, pixelSize);
      }
    }
    
    // 中心大方块
    explosion.fillStyle(0xffffff, 1);
    explosion.fillRect(bossPos.x - pixelSize * 2, bossPos.y - pixelSize * 2, pixelSize * 4, pixelSize * 4);
    
    explosion.setBlendMode((window as any).Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 800,
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // 播放爆炸音效
    (this.sound as any).play('explosion', { volume: 0.8 });
    
    // 得分奖励
    this.score += 5000;

    // 清除所有子弹并暂停游戏
    this.bulletPool.clear();
    this.pause();

    // 通知 UI
    this.onBossDefeated?.();
  }
  
  gameOver() {
    this.isGameOver = true;
    this.onGameOver?.(this.score, this.gameTime);
  }
  
  updateStats() {
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        score: this.score,
        grazeCount: this.grazeCount,
        time: this.gameTime,
        health: this.player.health,
        bossHealth: this.boss.health,
        bossPhase: this.boss.getPhase(),
        dashCooldown: this.player.dashCooldownTimer,
        dashCooldownMax: this.player.dashCooldown
      });
    }
  }
  
  // 升级方法
  applyUpgrade(type: string) {
    switch (type) {
      case 'dash-cooldown':
        this.upgrades.dashCooldownReduction += 0.2;
        this.player.dashCooldown *= (1 - this.upgrades.dashCooldownReduction);
        break;
      case 'dash-distance':
        this.upgrades.dashDistanceIncrease += 0.3;
        this.player.dashSpeed *= (1 + this.upgrades.dashDistanceIncrease);
        break;
      case 'graze-score':
        this.upgrades.grazeScoreMultiplier *= 2;
        break;
      case 'life-steal':
        this.upgrades.lifeSteal = true;
        break;
    }
  }
  
  // 无尽模式增强
  enhanceForEndless(wave: number) {
    // 增加 Boss 属性
    this.boss.maxHealth = 100 + wave * 50;
    this.boss.health = this.boss.maxHealth;
    this.boss.attackInterval = Math.max(500, 2000 - wave * 100);
    this.boss.moveSpeed = Math.min(100, 30 + wave * 5);
  }
  
  pause() {
    this.isPaused = true;
    this.physics.pause();
  }
  
  resume() {
    this.isPaused = false;
    this.physics.resume();
  }
  
  restart() {
    this.bulletPool.clear();
    this.boss.destroy();
    this.player.destroy();
    
    this.scene.restart();
  }
}
