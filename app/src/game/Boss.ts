import { BulletPool } from './Bullet';

export const BossPhase = {
  PHASE_1: 1,
  PHASE_2: 2,
  PHASE_3: 3
} as const;

export type BossPhaseType = typeof BossPhase[keyof typeof BossPhase];

export class Boss {
  scene: any;
  sprite: any;
  bulletPool: BulletPool;
  
  // Boss 属性
  maxHealth: number = 100;
  health: number = 100;
  phase: number = BossPhase.PHASE_1;
  
  // 攻击计时器
  attackTimer: number = 0;
  attackInterval: number = 2000;
  
  // 移动
  moveTimer: number = 0;
  targetX: number = 0;
  targetY: number = 0;
  moveSpeed: number = 30;
  
  // 旋转攻击角度
  spiralAngle: number = 0;
  
  // 警告区域
  warningGraphics: any = null;
  warningTimer: number = 0;
  
  // 攻击模式
  currentAttackPattern: number = 0;

  // Phase 切换护盾
  phaseShieldTimer: number = 3000; // 开局也有 3s 护盾
  lastPhase: number = BossPhase.PHASE_1;

  // 减速区域
  slowZones: { x: number; y: number; radius: number; timer: number; graphics: any }[] = [];
  
  constructor(scene: any, x: number, y: number, bulletPool: BulletPool) {
    this.scene = scene;
    this.bulletPool = bulletPool;
    
    // 创建像素风格 Boss 纹理
    const graphics = scene.add.graphics();
    
    // 绘制像素风格 Boss - 一个邪恶的像素脸
    // 外框 - 深色
    graphics.fillStyle(0x330011, 1);
    graphics.fillRect(0, 0, 64, 64);
    
    // 主体像素块 - 粉色/红色
    graphics.fillStyle(0xff0066, 1);
    
    // 绘制像素骷髅/恶魔脸形状
    // 顶部角
    graphics.fillRect(8, 8, 8, 8);
    graphics.fillRect(48, 8, 8, 8);
    // 额头
    graphics.fillRect(16, 12, 32, 8);
    // 眼睛区域
    graphics.fillRect(8, 24, 16, 12);
    graphics.fillRect(40, 24, 16, 12);
    // 眼睛发光
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(12, 28, 8, 4);
    graphics.fillRect(44, 28, 8, 4);
    // 鼻子
    graphics.fillStyle(0xff0066, 1);
    graphics.fillRect(28, 32, 8, 8);
    // 嘴巴
    graphics.fillRect(16, 44, 32, 8);
    graphics.fillRect(12, 48, 8, 8);
    graphics.fillRect(44, 48, 8, 8);
    // 下巴
    graphics.fillRect(20, 52, 24, 8);
    
    // 发光边缘效果
    graphics.fillStyle(0xff00ff, 0.5);
    graphics.fillRect(4, 4, 4, 56);
    graphics.fillRect(56, 4, 4, 56);
    graphics.fillRect(4, 4, 56, 4);
    graphics.fillRect(4, 56, 56, 4);
    
    graphics.generateTexture('boss-pixel', 64, 64);
    graphics.destroy();
    
    // 创建 Boss 精灵
    this.sprite = scene.physics.add.sprite(x, y, 'boss-pixel');
    this.sprite.setDisplaySize(64, 64);
    this.sprite.setBlendMode((window as any).Phaser.BlendModes.ADD);
    
    // 初始化目标位置
    this.targetX = x;
    this.targetY = y;
    
    // 创建警告图形
    this.warningGraphics = scene.add.graphics();
  }
  
  update(delta: number, playerPos: { x: number; y: number }) {
    // 更新阶段
    this.updatePhase();

    // Phase 护盾计时
    if (this.phaseShieldTimer > 0) {
      this.phaseShieldTimer -= delta;
    }

    // 移动
    this.updateMovement(delta);

    // 攻击
    this.attackTimer += delta;
    if (this.attackTimer >= this.getAttackInterval()) {
      this.attackTimer = 0;
      this.executeAttack(playerPos);
    }

    // 更新旋转角度
    this.spiralAngle += delta * 0.001;

    // 更新警告
    this.updateWarning(delta);

    // 更新减速区域
    this.updateSlowZones(delta);

    // 发光效果
    this.updateGlow();
  }
  
  updatePhase() {
    const healthPercent = this.health / this.maxHealth;
    let newPhase: number = BossPhase.PHASE_1;

    if (healthPercent > 0.7) {
      newPhase = BossPhase.PHASE_1;
    } else if (healthPercent > 0.3) {
      newPhase = BossPhase.PHASE_2;
    } else {
      newPhase = BossPhase.PHASE_3;
    }

    if (newPhase !== this.lastPhase) {
      this.lastPhase = newPhase;
      this.phaseShieldTimer = 3000;
    }

    this.phase = newPhase;
  }
  
  updateMovement(delta: number) {
    this.moveTimer += delta;
    
    // 每3秒更换目标位置
    if (this.moveTimer > 3000) {
      this.moveTimer = 0;
      const centerX = this.scene.scale.width / 2;
      const centerY = this.scene.scale.height / 3;
      const range = 100;
      
      this.targetX = centerX + (Math.random() - 0.5) * range * 2;
      this.targetY = centerY + (Math.random() - 0.5) * range;
    }
    
    // 平滑移动
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    
    this.sprite.setVelocity(
      dx * this.moveSpeed * 0.01,
      dy * this.moveSpeed * 0.01
    );
  }
  
  getAttackInterval(): number {
    switch (this.phase) {
      case BossPhase.PHASE_1:
        return 2500;
      case BossPhase.PHASE_2:
        return 1800;
      case BossPhase.PHASE_3:
        return 1200;
      default:
        return 2000;
    }
  }
  
  executeAttack(playerPos: { x: number; y: number }) {
    const angleToPlayer = (window as any).Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      playerPos.x, playerPos.y
    );
    
    switch (this.phase) {
      case BossPhase.PHASE_1:
        this.phase1Attack(angleToPlayer);
        break;
      case BossPhase.PHASE_2:
        this.phase2Attack(angleToPlayer, playerPos);
        break;
      case BossPhase.PHASE_3:
        this.phase3Attack(angleToPlayer, playerPos);
        break;
    }
    
    // 播放攻击音效
    this.scene.sound.play('boss-attack', { volume: 0.3 });
  }
  
  // 第一阶段攻击 - 教学阶段
  phase1Attack(angleToPlayer: number) {
    this.currentAttackPattern = (this.currentAttackPattern + 1) % 2;
    
    if (this.currentAttackPattern === 0) {
      // 扇形射击
      this.bulletPool.spawnFan(
        this.sprite.x, this.sprite.y,
        angleToPlayer, Math.PI / 3, 5, 150
      );
    } else {
      // 圆形爆发
      this.bulletPool.spawnCircle(
        this.sprite.x, this.sprite.y,
        12, 120, 0xff3366
      );
    }
  }
  
  // 第二阶段攻击 - 进阶阶段
  phase2Attack(angleToPlayer: number, _playerPos: { x: number; y: number }) {
    this.currentAttackPattern = (this.currentAttackPattern + 1) % 3;
    
    switch (this.currentAttackPattern) {
      case 0:
        // 旋转弹幕
        for (let i = 0; i < 3; i++) {
          this.scene.time.delayedCall(i * 200, () => {
            this.bulletPool.spawnCircle(
              this.sprite.x, this.sprite.y,
              8, 150 + i * 20, 0xff66cc
            );
          });
        }
        break;
        
      case 1:
        // 延迟爆炸弹
        for (let i = 0; i < 5; i++) {
          const angle = angleToPlayer + (Math.random() - 0.5) * 0.5;
          const bullet = this.bulletPool.spawn(
            this.sprite.x, this.sprite.y,
            angle, 100, 0xffff00
          );
          if (bullet) {
            bullet.setDelayExplode(1500 + i * 200);
          }
        }
        break;
        
      case 2:
        // 追踪弹 + 扇形
        const homingBullet = this.bulletPool.spawn(
          this.sprite.x, this.sprite.y,
          angleToPlayer, 120, 0xff00ff
        );
        if (homingBullet) {
          homingBullet.setHoming(0.03);
        }
        
        this.scene.time.delayedCall(300, () => {
          this.bulletPool.spawnFan(
            this.sprite.x, this.sprite.y,
            angleToPlayer + Math.PI, Math.PI / 2, 4, 140
          );
        });
        break;
    }
  }
  
  // 第三阶段攻击 - 狂暴阶段
  phase3Attack(angleToPlayer: number, playerPos: { x: number; y: number }) {
    this.currentAttackPattern = (this.currentAttackPattern + 1) % 5;

    switch (this.currentAttackPattern) {
      case 0:
        // 全屏交叉弹幕
        this.crossBarrage();
        break;

      case 1:
        // 假子弹 + 真子弹
        this.fakeBulletAttack(angleToPlayer);
        break;

      case 2:
        // 地面预警区域
        this.warningAreaAttack(playerPos);
        break;

      case 3:
        // 螺旋弹幕风暴
        this.spiralStorm();
        break;

      case 4:
        // 减速区域
        this.slowZoneAttack(playerPos);
        break;
    }
  }
  
  crossBarrage() {
    // 水平弹幕
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const y = this.scene.scale.height * (i + 1) / 6;
        this.bulletPool.spawn(0, y, 0, 200, 0xff0000);
        this.bulletPool.spawn(this.scene.scale.width, y, Math.PI, 200, 0xff0000);
      });
    }
    
    // 垂直弹幕
    this.scene.time.delayedCall(500, () => {
      for (let i = 0; i < 5; i++) {
        const x = this.scene.scale.width * (i + 1) / 6;
        this.bulletPool.spawn(x, 0, Math.PI / 2, 200, 0xff0000);
        this.bulletPool.spawn(x, this.scene.scale.height, -Math.PI / 2, 200, 0xff0000);
      }
    });
  }
  
  fakeBulletAttack(angleToPlayer: number) {
    // 发射假子弹（橙色，半透明）
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const bullet = this.bulletPool.spawn(
        this.sprite.x, this.sprite.y,
        angle, 80, 0xff6600
      );
      if (bullet) {
        bullet.setFake(true);
      }
    }
    
    // 延迟发射真子弹
    this.scene.time.delayedCall(500, () => {
      for (let i = 0; i < 6; i++) {
        const angle = angleToPlayer + (i - 3) * 0.2;
        this.bulletPool.spawn(
          this.sprite.x, this.sprite.y,
          angle, 180, 0xff0066
        );
      }
    });
  }
  
  warningAreaAttack(playerPos: { x: number; y: number }) {
    // 在玩家位置显示警告
    if (this.warningGraphics) {
      this.warningGraphics.clear();
      this.warningGraphics.lineStyle(3, 0xff0000, 0.8);
      this.warningGraphics.strokeCircle(playerPos.x, playerPos.y, 60);
      
      this.warningTimer = 1000;
      
      // 延迟后在警告区域发射弹幕
      this.scene.time.delayedCall(1000, () => {
        this.bulletPool.spawnCircle(playerPos.x, playerPos.y, 10, 150, 0xff0000);
        if (this.warningGraphics) {
          this.warningGraphics.clear();
        }
      });
    }
  }
  
  slowZoneAttack(playerPos: { x: number; y: number }) {
    // 在玩家附近随机放置 1~2 个减速圈
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 200;
      const offsetY = (Math.random() - 0.5) * 200;
      const zx = Math.max(80, Math.min(this.scene.scale.width - 80, playerPos.x + offsetX));
      const zy = Math.max(80, Math.min(this.scene.scale.height - 80, playerPos.y + offsetY));
      const radius = 70 + Math.random() * 30;

      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xff0066, 0.15);
      gfx.fillCircle(0, 0, radius);
      gfx.lineStyle(2, 0xff0066, 0.5);
      gfx.strokeCircle(0, 0, radius);
      gfx.setPosition(zx, zy);
      gfx.setBlendMode((window as any).Phaser.BlendModes.ADD);

      this.slowZones.push({ x: zx, y: zy, radius, timer: 3000, graphics: gfx });
    }
  }

  spiralStorm() {
    // 快速螺旋弹幕
    for (let i = 0; i < 16; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const angle = this.spiralAngle + (i * Math.PI * 2 / 8);
        this.bulletPool.spawn(
          this.sprite.x, this.sprite.y,
          angle, 180 + i * 10, 0xff00ff
        );
      });
    }
  }
  
  updateWarning(delta: number) {
    if (this.warningTimer > 0) {
      this.warningTimer -= delta;
      
      // 警告闪烁
      if (this.warningGraphics) {
        const alpha = Math.sin(this.scene.time.now / 50) * 0.5 + 0.5;
        this.warningGraphics.setAlpha(alpha);
      }
    } else if (this.warningGraphics) {
      this.warningGraphics.clear();
    }
  }
  
  updateSlowZones(delta: number) {
    for (let i = this.slowZones.length - 1; i >= 0; i--) {
      const zone = this.slowZones[i];
      zone.timer -= delta;

      // 最后 500ms 闪烁消失
      if (zone.timer < 500) {
        const flash = Math.sin(this.scene.time.now / 60) * 0.5 + 0.5;
        zone.graphics.setAlpha(flash);
      }

      if (zone.timer <= 0) {
        zone.graphics.destroy();
        this.slowZones.splice(i, 1);
      }
    }
  }

  isPlayerInSlowZone(playerPos: { x: number; y: number }): boolean {
    for (const zone of this.slowZones) {
      const dx = playerPos.x - zone.x;
      const dy = playerPos.y - zone.y;
      if (dx * dx + dy * dy < zone.radius * zone.radius) {
        return true;
      }
    }
    return false;
  }

  updateGlow() {
    // 根据阶段改变颜色
    let color = 0xff0066;
    switch (this.phase) {
      case BossPhase.PHASE_2:
        color = 0xff66cc;
        break;
      case BossPhase.PHASE_3:
        color = 0xff0000;
        break;
    }
    
    // 护盾期间明暗闪烁
    if (this.phaseShieldTimer > 0) {
      const shieldFlash = Math.sin(this.scene.time.now / 120) * 0.4 + 0.6;
      this.sprite.setAlpha(shieldFlash);
      this.sprite.setTint(0xffffff);
      return;
    }

    // 脉冲效果
    const pulse = Math.sin(this.scene.time.now / 150) * 0.3 + 0.7;
    this.sprite.setAlpha(pulse);

    // 受伤时闪烁
    if (this.health < this.maxHealth) {
      const damagePulse = (this.health / this.maxHealth) * 0.5 + 0.5;
      this.sprite.setTint(color);
      this.sprite.setScale(1 + (1 - damagePulse) * 0.2);
    }
  }
  
  takeDamage(amount: number): boolean {
    // 护盾期间免疫伤害
    if (this.phaseShieldTimer > 0) return false;

    this.health -= amount;
    
    // 受伤效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 2
    });
    
    // 屏幕震动
    this.scene.cameras.main.shake(100, 0.005);
    
    // 受伤音效
    this.scene.sound.play('boss-hit', { volume: 0.5 });
    
    return this.health <= 0;
  }
  
  isDead(): boolean {
    return this.health <= 0;
  }
  
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  
  getPhase(): number {
    return this.phase;
  }
  
  destroy() {
    if (this.warningGraphics) {
      this.warningGraphics.destroy();
    }
    for (const zone of this.slowZones) {
      zone.graphics.destroy();
    }
    this.slowZones = [];
    this.sprite.destroy();
  }
}
