# One Button Boss

## What Is This Game?

One Button Boss is a pixel-art bullet hell game where you face off against a single, relentless boss that grows deadlier with every defeat. Dodge waves of projectiles, graze bullets for bonus points, and dash through the boss to deal damage — all wrapped in a retro arcade aesthetic with CRT scanlines and synthesized audio.

## How to Play

### Controls

| Input | Action |
|-------|--------|
| **WASD** | Move in four directions |
| **Mouse** | Hold to move toward cursor position |
| **Space** | Dash (grants brief invincibility) |

Dash cooldown is displayed as a ring around your character — it pulses when ready.

### Core Mechanics

- **Dash Attack**: Dash through the boss to deal damage. This is your only way to hurt it.
- **Graze**: Skim past bullets without getting hit to earn bonus points. The closer you fly, the higher the reward.
- **I-Frames**: After taking damage, you get 2 seconds of invincibility (your character flashes during this time).
- **Slow Motion**: Near-miss moments trigger a brief slow-motion effect, giving you a split second to react.

### Boss Phases

The boss shifts through three phases as its health drops. Each phase change grants the boss a **3-second shield** (it flashes white during this time and cannot take damage).

1. **Phase 1** (Health > 70%) — Predictable fan shots and circular bursts. Learn the patterns here.
2. **Phase 2** (Health 30–70%) — Rotating barrages, explosive bullets, and homing projectiles join the fight.
3. **Phase 3** (Health < 30%) — Full bullet hell. Cross barrages from screen edges, fake-out bullets, warning zone attacks, spiral storms, and **slow zones** that appear at your position and reduce your movement speed by 50%.

### Damage

- **Wave 1**: Bullets deal 1 HP per hit.
- **Wave 2+**: Bullets deal 1.5 HP per hit.

HP is displayed as 3 hearts in the HUD, with support for half-heart display.

### Upgrades

Each time you defeat the boss, pick one of four upgrades before the next round begins:

| Upgrade | Effect |
|---------|--------|
| **DASH SPD** | Reduce dash cooldown by 20% (multiplicative) |
| **DASH DST** | Increase dash distance by 30% (multiplicative) |
| **SPEED UP** | Increase movement speed by 20% (multiplicative) |
| **LIFE STEAL** | Heal half a heart when you dash through the boss (once per dash) |

After selecting an upgrade, you receive 3 seconds of invincibility.

### Scoring

| Action | Points |
|--------|--------|
| Dash Attack (hit boss) | +100 per frame of overlap |
| Graze (per bullet) | +10 |
| Boss Defeat | +5,000 |

### Progression

After each boss defeat, the boss respawns stronger — more health, faster attacks, quicker movement. Stack your upgrades wisely and see how many waves you can survive. Normal mode ends after 3 waves.

## Tips

- Dashing makes you invincible. Use it to dodge through dense bullet patterns, not just to attack.
- Graze aggressively in Phase 1 while the patterns are forgiving — build your score early.
- Save your dash for emergencies in Phase 3. The cooldown matters.
- Life Steal heals half a heart per dash — play aggressively to sustain.
- Speed Up stacks multiplicatively — it can make dodging much easier in later waves.
- In Phase 3, watch out for pink slow zones that spawn at your position. Keep moving to escape them.
