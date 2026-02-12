export class Player {
  sprite: any;
  scene: any;
  
  // 玩家属性
  speed: number = 200;
  dashSpeed: number = 600;
  dashDuration: number = 200;
  dashCooldown: number = 3000;
  dashCooldownTimer: number = 0;
  isDashing: boolean = false;
  isInvincible: boolean = false;
  
  // 拖尾效果
  trail: any[] = [];
  trailTimer: number = 0;
  
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
    
    // 创建玩家精灵
    this.sprite = scene.physics.add.sprite(x, y, 'player-pixel');
    this.sprite.setDisplaySize(16, 16);
    this.sprite.setTint(0x00ffc8);
    
    // 添加发光滤镜效果
    this.sprite.setBlendMode((window as any).Phaser.BlendModes.ADD);
    
    // 物理设置 - 使用矩形碰撞
    this.sprite.setSize(12, 12);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDrag(0.9);
    
    // 初始化拖尾数组
    this.trail = [];
  }
  
  update(delta: number, cursors: any, spaceKey: any, mousePointer: any) {
    // 更新冷却时间
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta;
    }
    
    if (this.grazeTimer > 0) {
      this.grazeTimer -= delta;
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
    if (cursors.left?.isDown || this.scene.input.keyboard?.addKey('A').isDown) {
      vx = -this.speed;
    } else if (cursors.right?.isDown || this.scene.input.keyboard?.addKey('D').isDown) {
      vx = this.speed;
    }
    
    if (cursors.up?.isDown || this.scene.input.keyboard?.addKey('W').isDown) {
      vy = -this.speed;
    } else if (cursors.down?.isDown || this.scene.input.keyboard?.addKey('S').isDown) {
      vy = this.speed;
    }
    
    // 鼠标方向移动（如果按住鼠标）
    if (mousePointer.isDown) {
      const angle = (window as any).Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, mousePointer.x, mousePointer.y);
      vx = Math.cos(angle) * this.speed;
      vy = Math.sin(angle) * this.speed;
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
    
    // 无敌结束
    this.scene.time.delayedCall(this.dashDuration, () => {
      this.isInvincible = false;
    });
    
    // 设置冷却
    this.dashCooldownTimer = this.dashCooldown;
  }
  
  createDashTrail() {
    // 创建像素风格拖尾效果
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 30, () => {
        if (this.sprite && this.sprite.active) {
          const trail = this.scene.add.graphics();
          const alpha = 0.6 - i * 0.1;
          
          // 绘制像素方块拖尾
          trail.fillStyle(0x00ffc8, alpha);
          const size = 12 - i * 2;
          trail.fillRect(
            this.sprite.x - size / 2,
            this.sprite.y - size / 2,
            size,
            size
          );
          
          trail.setBlendMode((window as any).Phaser.BlendModes.ADD);
          
          // 淡出动画
          this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              trail.destroy();
            }
          });
        }
      });
    }
  }
  
  updateTrail(delta: number) {
    this.trailTimer += delta;
    
    // 每50ms创建一个拖尾
    if (this.trailTimer > 50 && (this.sprite.body?.velocity.x !== 0 || this.sprite.body?.velocity.y !== 0)) {
      this.trailTimer = 0;
      
      const trail = this.scene.add.graphics();
      trail.fillStyle(0x00ffc8, 0.3);
      
      // 像素方块拖尾
      trail.fillRect(this.sprite.x - 4, this.sprite.y - 4, 8, 8);
      trail.setBlendMode((window as any).Phaser.BlendModes.ADD);
      
      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          trail.destroy();
        }
      });
    }
  }
  
  updateGlow(_delta: number) {
    // 脉冲发光效果
    const pulse = Math.sin(this.scene.time.now / 200) * 0.15 + 0.85;
    this.sprite.setAlpha(pulse);
    
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
    this.sprite.destroy();
  }
}
