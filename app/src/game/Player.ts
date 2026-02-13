export class Player {
  sprite: any;
  scene: any;
  keys: { W: any; A: any; S: any; D: any } | null = null;

  // 玩家属性
  speed: number = 200;
  dashSpeed: number = 600;
  dashDuration: number = 200;
  dashCooldown: number = 3000;
  dashCooldownTimer: number = 0;
  isDashing: boolean = false;
  isInvincible: boolean = false;
  invincibleTimer: number = 0;
  invincibleDuration: number = 2000;
  slowed: boolean = false;
  
  // 拖尾效果
  trail: any[] = [];
  trailTimer: number = 0;

  // 发光光圈
  glow: any;
  
  // 生命值
  maxHealth: number = 3;
  health: number = 3;
  
  // 擦弹相关
  grazeRadius: number = 40;
  grazeCooldown: number = 100;
  grazeTimer: number = 0;
  
  // 像素大小
  pixelSize: number = 4;
  
  constructor(scene: any, x: number, y: number) {
    this.scene = scene;
    
    // 创建像素风格玩家纹理 - 12x12像素的飞船形状
    const graphics = scene.add.graphics();
    
    // 绘制像素飞船
    const pixelColor = 0x00ffc8;
    const glowColor = 0x00ffff;
    
    // 主体 - 像素块组成
    graphics.fillStyle(pixelColor, 1);
    // 中心
    graphics.fillRect(4, 4, 4, 4);
    // 上部
    graphics.fillRect(6, 0, 4, 4);
    graphics.fillRect(4, 2, 4, 2);
    // 下部
    graphics.fillRect(2, 8, 4, 4);
    graphics.fillRect(8, 8, 4, 4);
    graphics.fillRect(0, 10, 4, 2);
    graphics.fillRect(10, 10, 4, 2);
    // 侧翼
    graphics.fillRect(2, 4, 2, 4);
    graphics.fillRect(10, 4, 2, 4);
    
    // 发光边缘
    graphics.fillStyle(glowColor, 0.5);
    graphics.fillRect(6, -2, 4, 2);
    graphics.fillRect(4, 0, 2, 2);
    graphics.fillRect(10, 0, 2, 2);
    
    graphics.generateTexture('player-pixel', 16, 16);
    graphics.destroy();
    
    // 创建发光光圈（预绘制，之后只移动位置）
    this.glow = scene.add.graphics();
    this.glow.fillStyle(0x00ffc8, 0.45);
    this.glow.fillCircle(0, 0, 10);
    this.glow.fillStyle(0x00ffff, 0.22);
    this.glow.fillCircle(0, 0, 15);
    this.glow.setBlendMode((window as any).Phaser.BlendModes.ADD);

    // 创建玩家精灵 - 普通混合模式，保证始终可见
    this.sprite = scene.physics.add.sprite(x, y, 'player-pixel');
    this.sprite.setDisplaySize(20, 20);
    this.sprite.setAlpha(1);

    // 物理设置 - 使用矩形碰撞
    this.sprite.setSize(12, 12);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDrag(0.9);

    // 初始化拖尾数组
    this.trail = [];

    // 缓存 WASD 按键
    this.keys = {
      W: scene.input.keyboard.addKey('W'),
      A: scene.input.keyboard.addKey('A'),
      S: scene.input.keyboard.addKey('S'),
      D: scene.input.keyboard.addKey('D')
    };
  }
  
  update(delta: number, cursors: any, spaceKey: any, mousePointer: any) {
    // 更新冷却时间
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta;
    }
    
    if (this.grazeTimer > 0) {
      this.grazeTimer -= delta;
    }

    // i-frame timer
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.invincibleTimer = 0;
        if (!this.isDashing) {
          this.isInvincible = false;
        }
      }
    }

    // 如果不是冲刺状态，正常移动
    if (!this.isDashing) {
      this.handleMovement(cursors, mousePointer);
    }
    
    // 处理冲刺
    if ((window as any).Phaser.Input.Keyboard.JustDown(spaceKey) && this.dashCooldownTimer <= 0 && !this.isDashing) {
      this.dash(mousePointer);
    }
    
    // 更新拖尾效果
    this.updateTrail(delta);
    
    // 更新发光效果
    this.updateGlow(delta);
  }
  
  handleMovement(cursors: any, mousePointer: any) {
    let vx = 0;
    let vy = 0;
    
    // WASD 移动
    if (cursors.left?.isDown || this.keys?.A.isDown) {
      vx = -this.speed;
    } else if (cursors.right?.isDown || this.keys?.D.isDown) {
      vx = this.speed;
    }

    if (cursors.up?.isDown || this.keys?.W.isDown) {
      vy = -this.speed;
    } else if (cursors.down?.isDown || this.keys?.S.isDown) {
      vy = this.speed;
    }
    
    // 鼠标方向移动（如果按住鼠标）
    if (mousePointer.isDown) {
      const angle = (window as any).Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, mousePointer.x, mousePointer.y);
      vx = Math.cos(angle) * this.speed;
      vy = Math.sin(angle) * this.speed;
    }
    
    // 减速区域内移速降低 50%
    if (this.slowed) {
      vx *= 0.5;
      vy *= 0.5;
    }

    this.sprite.setVelocity(vx, vy);
  }
  
  dash(mousePointer: any) {
    this.isDashing = true;
    this.isInvincible = true;
    
    // 计算冲刺方向（朝向鼠标）
    const angle = (window as any).Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, mousePointer.x, mousePointer.y);
    
    // 设置冲刺速度
    this.sprite.setVelocity(
      Math.cos(angle) * this.dashSpeed,
      Math.sin(angle) * this.dashSpeed
    );
    
    // 播放冲刺音效
    this.scene.sound.play('dash', { volume: 0.5 });
    
    // 创建冲刺拖尾
    this.createDashTrail();
    
    // 冲刺结束
    this.scene.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.sprite.setVelocity(0, 0);
    });
    
    // 无敌结束（don't clear if i-frame timer is still active）
    this.scene.time.delayedCall(this.dashDuration, () => {
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    });
    
    // 设置冷却
    this.dashCooldownTimer = this.dashCooldown;
  }
  
  createDashTrail() {
    // 轻量 dash 拖尾 — 单个 graphics 一次性绘制所有方块
    const trail = this.scene.add.graphics();
    trail.setBlendMode((window as any).Phaser.BlendModes.ADD);

    const x = this.sprite.x;
    const y = this.sprite.y;
    for (let i = 0; i < 3; i++) {
      const alpha = 0.5 - i * 0.15;
      const size = 10 - i * 2;
      trail.fillStyle(0x00ffc8, alpha);
      trail.fillRect(x - size / 2, y - size / 2, size, size);
    }

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 250,
      onComplete: () => trail.destroy()
    });
  }
  
  updateTrail(delta: number) {
    this.trailTimer += delta;

    // 每 150ms 创建一个拖尾
    if (this.trailTimer > 150 && (this.sprite.body?.velocity.x !== 0 || this.sprite.body?.velocity.y !== 0)) {
      this.trailTimer = 0;

      const trail = this.scene.add.graphics();
      trail.fillStyle(0x00ffc8, 0.25);
      trail.fillRect(this.sprite.x - 3, this.sprite.y - 3, 6, 6);
      trail.setBlendMode((window as any).Phaser.BlendModes.ADD);

      // 直接延迟销毁，不用 tween
      this.scene.time.delayedCall(180, () => trail.destroy());
    }
  }
  
  updateGlow(_delta: number) {
    // Flash sprite during i-frames, otherwise full opacity
    if (this.invincibleTimer > 0) {
      const flash = Math.floor(this.scene.time.now / 100) % 2;
      this.sprite.setAlpha(flash === 0 ? 0.3 : 1.0);
    } else {
      this.sprite.setAlpha(1);
    }

    // 移动发光光圈跟随玩家
    this.glow.setPosition(this.sprite.x, this.sprite.y);
    const pulse = Math.sin(this.scene.time.now / 400) * 0.3 + 0.7;
    this.glow.setAlpha(pulse);

    // 冲刺冷却时闪烁
    if (this.dashCooldownTimer > 0 && this.dashCooldownTimer < 500) {
      const flash = Math.sin(this.scene.time.now / 50) * 0.5 + 0.5;
      this.sprite.setTint(flash > 0.5 ? 0x00ffc8 : 0xffffff);
    } else {
      this.sprite.setTint(0x00ffc8);
    }
  }
  
  takeDamage(): boolean {
    if (this.isInvincible) return false;

    this.health--;

    // Activate i-frames
    this.isInvincible = true;
    this.invincibleTimer = this.invincibleDuration;

    // 受伤闪烁 - 像素风格
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 3
    });
    
    // 屏幕震动
    this.scene.cameras.main.shake(200, 0.01);
    
    // 受伤音效
    this.scene.sound.play('hit', { volume: 0.6 });
    
    return true;
  }
  
  heal() {
    if (this.health < this.maxHealth) {
      this.health++;
    }
  }
  
  canGraze(): boolean {
    return this.grazeTimer <= 0;
  }
  
  doGraze() {
    this.grazeTimer = this.grazeCooldown;
  }
  
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  
  destroy() {
    this.glow.destroy();
    this.sprite.destroy();
  }
}
