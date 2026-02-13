export class Bullet extends (window as any).Phaser.Physics.Arcade.Sprite {
  scene: any;
  speed: number = 150;
  lifespan: number = 5000;
  birthTime: number;
  isFake: boolean = false;
  angle: number = 0;
  
  // 特殊弹幕属性
  isHoming: boolean = false;
  homingStrength: number = 0;
  target: { x: number; y: number } | null = null;
  
  // 延迟爆炸
  delayExplode: boolean = false;
  explodeDelay: number = 0;
  explodeTimer: number = 0;
  hasExploded: boolean = false;
  
  // 旋转弹幕
  rotationSpeed: number = 0;
  orbitCenter: { x: number; y: number } | null = null;
  orbitRadius: number = 0;
  orbitAngle: number = 0;
  
  // 缓存的玩家位置引用（由 GameScene 设置）
  playerPosRef: { x: number; y: number } | null = null;

  constructor(scene: any, x: number, y: number, texture: string = 'bullet') {
    super(scene, x, y, texture);
    this.scene = scene;
    this.birthTime = scene.time.now;
    
    // 添加到场景和物理系统
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 设置物理属性 - 像素方块
    this.setSize(6, 6);
    this.setDisplaySize(8, 8);
    this.setBlendMode((window as any).Phaser.BlendModes.ADD);
  }
  
  update(time: number, delta: number, playerPos?: { x: number; y: number } | null) {
    if (!playerPos) playerPos = this.playerPosRef;
    // 检查生命周期
    if (time - this.birthTime > this.lifespan) {
      this.destroy();
      return;
    }
    
    // 延迟爆炸处理
    if (this.delayExplode && !this.hasExploded) {
      this.explodeTimer += delta;
      if (this.explodeTimer >= this.explodeDelay) {
        this.explode();
        return;
      }
      // 爆炸前闪烁
      const flash = Math.sin(time / 50) * 0.5 + 0.5;
      this.setAlpha(flash);
    }
    
    // 追踪弹幕
    if (this.isHoming && playerPos && !this.delayExplode) {
      const angleToPlayer = (window as any).Phaser.Math.Angle.Between(this.x, this.y, playerPos.x, playerPos.y);
      const currentAngle = (window as any).Phaser.Math.Angle.RotateTo(this.angle, angleToPlayer, this.homingStrength * delta * 0.001);
      this.setVelocity(
        Math.cos(currentAngle) * this.speed,
        Math.sin(currentAngle) * this.speed
      );
    }
    
    // 旋转弹幕
    if (this.rotationSpeed !== 0 && this.orbitCenter) {
      this.orbitAngle += this.rotationSpeed * delta * 0.001;
      const targetX = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      const targetY = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;
      this.setPosition(targetX, targetY);
    }
    
    // 边界检查
    if (this.x < -50 || this.x > this.scene.scale.width + 50 ||
        this.y < -50 || this.y > this.scene.scale.height + 50) {
      this.destroy();
    }
  }
  
  setVelocityByAngle(angle: number, speed?: number) {
    this.angle = angle;
    const s = speed || this.speed;
    this.setVelocity(Math.cos(angle) * s, Math.sin(angle) * s);
  }
  
  setFake(isFake: boolean) {
    this.isFake = isFake;
    if (isFake) {
      this.setTint(0xff6600);
      this.setAlpha(0.5);
    }
  }
  
  setHoming(strength: number = 0.05) {
    this.isHoming = true;
    this.homingStrength = strength;
    this.setTint(0xff00ff);
  }
  
  setDelayExplode(delay: number) {
    this.delayExplode = true;
    this.explodeDelay = delay;
    this.setTint(0xffff00);
  }
  
  setOrbit(centerX: number, centerY: number, radius: number, startAngle: number, rotationSpeed: number) {
    this.orbitCenter = { x: centerX, y: centerY };
    this.orbitRadius = radius;
    this.orbitAngle = startAngle;
    this.rotationSpeed = rotationSpeed;
    this.setPosition(
      centerX + Math.cos(startAngle) * radius,
      centerY + Math.sin(startAngle) * radius
    );
  }
  
  explode() {
    if (this.hasExploded) return;
    this.hasExploded = true;
    
    // 创建像素风格爆炸效果
    const explosion = this.scene.add.graphics();
    
    // 绘制像素爆炸 - 多个小方块向外扩散
    const pixelSize = 4;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 12;
      const px = this.x + Math.cos(angle) * distance;
      const py = this.y + Math.sin(angle) * distance;
      
      explosion.fillStyle(0xff0066, 1);
      explosion.fillRect(px - pixelSize/2, py - pixelSize/2, pixelSize, pixelSize);
    }
    
    // 中心方块
    explosion.fillStyle(0xffff00, 1);
    explosion.fillRect(this.x - 6, this.y - 6, 12, 12);
    
    explosion.setBlendMode((window as any).Phaser.BlendModes.ADD);
    
    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // 爆炸音效
    this.scene.sound.play('explosion', { volume: 0.4 });
    
    // 向四周发射子弹
    if (this.scene.spawnBullets) {
      this.scene.spawnBullets(this.x, this.y, 8, 0xff0000, 200);
    }
    
    this.destroy();
  }
  
  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
  }
}

// 子弹对象池管理
export class BulletPool {
  scene: any;
  pool: any;
  playerPos: { x: number; y: number } = { x: 0, y: 0 };
  
  constructor(scene: any, maxSize: number = 500) {
    this.scene = scene;
    
    // 创建像素风格子弹纹理 - 小方块
    const graphics = scene.add.graphics();
    
    // 主体方块
    graphics.fillStyle(0xff0066, 1);
    graphics.fillRect(1, 1, 6, 6);
    
    // 发光边缘
    graphics.fillStyle(0xff00ff, 0.5);
    graphics.fillRect(0, 2, 1, 4);
    graphics.fillRect(7, 2, 1, 4);
    graphics.fillRect(2, 0, 4, 1);
    graphics.fillRect(2, 7, 4, 1);
    
    graphics.generateTexture('bullet', 8, 8);
    graphics.destroy();
    
    // 创建对象池（关闭 runChildUpdate，手动更新 active 子弹）
    this.pool = scene.physics.add.group({
      classType: Bullet,
      maxSize: maxSize,
      runChildUpdate: false,
      createCallback: (bullet: any) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }
  
  spawn(x: number, y: number, angle: number, speed?: number, color?: number): Bullet {
    const bullet = this.pool.get(x, y, 'bullet') as Bullet;
    
    if (bullet) {
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityByAngle(angle, speed);
      bullet.birthTime = this.scene.time.now;
      bullet.hasExploded = false;
      bullet.explodeTimer = 0;
      bullet.delayExplode = false;
      bullet.isHoming = false;
      bullet.rotationSpeed = 0;
      bullet.orbitCenter = null;
      
      if (color) {
        bullet.setTint(color);
      } else {
        bullet.clearTint();
      }
    }
    
    return bullet;
  }
  
  spawnCircle(x: number, y: number, count: number, speed?: number, color?: number): Bullet[] {
    const bullets: Bullet[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      bullets.push(this.spawn(x, y, angle, speed, color));
    }
    return bullets;
  }
  
  spawnFan(x: number, y: number, baseAngle: number, spread: number, count: number, speed?: number, color?: number): Bullet[] {
    const bullets: Bullet[] = [];
    const startAngle = baseAngle - spread / 2;
    const angleStep = spread / (count - 1);
    
    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i;
      bullets.push(this.spawn(x, y, angle, speed, color));
    }
    return bullets;
  }
  
  spawnSpiral(x: number, y: number, count: number, rotations: number, speed?: number, color?: number): Bullet[] {
    const bullets: Bullet[] = [];
    const totalAngle = Math.PI * 2 * rotations;
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * totalAngle;
      const delay = t * 500; // 螺旋延迟
      
      this.scene.time.delayedCall(delay, () => {
        const bullet = this.spawn(x, y, angle, speed, color);
        if (bullet) bullets.push(bullet);
      });
    }
    
    return bullets;
  }
  
  setPlayerPos(pos: { x: number; y: number }) {
    this.playerPos = pos;
  }

  updateAll(time: number, delta: number) {
    const children = this.pool.children.entries;
    for (let i = children.length - 1; i >= 0; i--) {
      const bullet = children[i];
      if (bullet.active) {
        bullet.update(time, delta, this.playerPos);
      }
    }
  }

  getPool(): any {
    return this.pool;
  }
  
  clear() {
    this.pool.clear(true, true);
  }
}
