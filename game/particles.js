// Advanced Particle FX & Visual Juice for Naruto: Shinobi Clash

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingLeaves = [];
        this.lightningBolts = [];
        this.slashTrails = [];
        this.damageNumbers = [];
        this.initAtmosphere();
    }

    initAtmosphere() {
        // Ambient falling Sakura petals & battle embers
        for (let i = 0; i < 35; i++) {
            this.floatingLeaves.push({
                x: Math.random() * 1200,
                y: Math.random() * 600,
                vx: -0.8 - Math.random() * 1.2,
                vy: 0.5 + Math.random() * 1.0,
                size: 3 + Math.random() * 4,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
                color: Math.random() > 0.4 ? 'rgba(255, 175, 200, 0.7)' : 'rgba(255, 110, 30, 0.6)'
            });
        }
    }

    createHitSparks(x, y, color = '#ffeb3b', count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                size: 2.5 + Math.random() * 3.5,
                color: color,
                alpha: 1.0,
                decay: 0.03 + Math.random() * 0.04,
                glow: true
            });
        }
    }

    createChakraFlame(x, y, color = '#ff9800', vx = 0) {
        this.particles.push({
            x: x + (Math.random() - 0.5) * 26,
            y: y + (Math.random() - 0.5) * 35,
            vx: vx * 0.2 + (Math.random() - 0.5) * 1.5,
            vy: -2.5 - Math.random() * 3,
            size: 4 + Math.random() * 7,
            color: color,
            alpha: 0.85,
            decay: 0.045,
            glow: true
        });
    }

    createSmokePuff(x, y, count = 18) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 25;
            this.particles.push({
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * (1.5 + Math.random() * 2.5),
                vy: Math.sin(angle) * (1.5 + Math.random() * 2.5) - 0.5,
                size: 10 + Math.random() * 14,
                color: 'rgba(220, 220, 230, 0.85)',
                alpha: 0.8,
                decay: 0.025,
                grow: 0.4
            });
        }
    }

    createLightning(x1, y1, x2, y2, color = '#00e5ff', branches = 2) {
        const segments = [];
        let currX = x1;
        let currY = y1;
        const steps = 6;
        const dx = (x2 - x1) / steps;
        const dy = (y2 - y1) / steps;

        for (let i = 0; i < steps; i++) {
            const nextX = i === steps - 1 ? x2 : currX + dx + (Math.random() - 0.5) * 25;
            const nextY = i === steps - 1 ? y2 : currY + dy + (Math.random() - 0.5) * 20;
            segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY });
            currX = nextX;
            currY = nextY;
        }

        this.lightningBolts.push({
            segments: segments,
            color: color,
            alpha: 1.0,
            decay: 0.12,
            width: 3.5
        });
    }

    createSlashTrail(x, y, dir, color = '#ffffff') {
        this.slashTrails.push({
            x: x,
            y: y,
            dir: dir,
            radius: 45,
            startAngle: dir > 0 ? -Math.PI * 0.35 : Math.PI * 0.65,
            endAngle: dir > 0 ? Math.PI * 0.35 : Math.PI * 1.35,
            color: color,
            alpha: 0.9,
            decay: 0.15
        });
    }

    addDamageNumber(x, y, text, isCrit = false) {
        this.damageNumbers.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y - 20,
            vy: -2.5,
            text: text,
            isCrit: isCrit,
            alpha: 1.0,
            decay: 0.022
        });
    }

    update(width, height) {
        // Standard particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.grow) p.size += p.grow;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Atmosphere leaves
        for (let leaf of this.floatingLeaves) {
            leaf.x += leaf.vx;
            leaf.y += leaf.vy;
            leaf.rot += leaf.rotSpeed;
            if (leaf.x < -20) leaf.x = width + 20;
            if (leaf.y > height + 20) {
                leaf.y = -20;
                leaf.x = Math.random() * width;
            }
        }

        // Lightning
        for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
            const lb = this.lightningBolts[i];
            lb.alpha -= lb.decay;
            if (lb.alpha <= 0) this.lightningBolts.splice(i, 1);
        }

        // Slash trails
        for (let i = this.slashTrails.length - 1; i >= 0; i--) {
            const st = this.slashTrails[i];
            st.alpha -= st.decay;
            if (st.alpha <= 0) this.slashTrails.splice(i, 1);
        }

        // Damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            dn.y += dn.vy;
            dn.vy += 0.06;
            dn.alpha -= dn.decay;
            if (dn.alpha <= 0) this.damageNumbers.splice(i, 1);
        }
    }

    render(ctx) {
        ctx.save();

        // 1. Render atmospheric leaves/embers
        for (let leaf of this.floatingLeaves) {
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rot);
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2. Render particles
        for (let p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            if (p.glow) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
            }
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 3. Render Lightning Bolts
        for (let lb of this.lightningBolts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, lb.alpha);
            ctx.strokeStyle = lb.color;
            ctx.lineWidth = lb.width;
            ctx.shadowColor = lb.color;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            for (let seg of lb.segments) {
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
            }
            ctx.stroke();
            ctx.restore();
        }

        // 4. Render Slash trails
        for (let st of this.slashTrails) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, st.alpha);
            ctx.strokeStyle = st.color;
            ctx.lineWidth = 5;
            ctx.shadowColor = st.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.radius, st.startAngle, st.endAngle);
            ctx.stroke();
            ctx.restore();
        }

        // 5. Render Damage Numbers
        for (let dn of this.damageNumbers) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, dn.alpha);
            ctx.font = dn.isCrit ? '900 24px "Orbitron", Impact, sans-serif' : '700 18px "Orbitron", sans-serif';
            ctx.fillStyle = dn.isCrit ? '#ff1744' : '#ffea00';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.shadowColor = dn.isCrit ? '#ff1744' : '#ff9800';
            ctx.shadowBlur = 8;
            ctx.strokeText(dn.text, dn.x, dn.y);
            ctx.fillText(dn.text, dn.x, dn.y);
            ctx.restore();
        }

        ctx.restore();
    }
}

window.ParticleSystem = ParticleSystem;
