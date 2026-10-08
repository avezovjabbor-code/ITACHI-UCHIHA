// Naruto: Shinobi Clash - Main Application Controller & Engine Loop

class App {
    constructor() {
        this.canvas = document.getElementById('battle-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.particleSys = new ParticleSystem();
        this.soundCtrl = window.soundCtrl;
        this.dojo = new HandSealsDojo();

        // Game Configuration
        this.currentView = 'title'; // 'title', 'char_select', 'battle', 'dojo', 'codex', 'survival'
        this.gameMode = 'pve'; // 'pve', 'pvp', 'survival'
        this.aiDifficulty = 'Jonin'; // 'Genin', 'Chunin', 'Jonin', 'Hokage'

        // Fighters
        this.p1CharId = 'naruto';
        this.p2CharId = 'sasuke';
        this.p1 = null;
        this.p2 = null;

        // Battle State
        this.isMatchRunning = false;
        this.isPaused = false;
        this.matchTimer = 99;
        this.round = 1;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.matchResult = null; // 'p1', 'p2', 'draw'

        // Survival State
        this.survivalWave = 1;
        this.survivalScore = 0;

        // Key states
        this.keys = {};
        this.touchControls = {};

        // Canvas Virtual Dimensions (internal coordinate system)
        this.virtualWidth = 1000;
        this.virtualHeight = 550;
        this.arenaBounds = {
            minX: 40,
            maxX: 960,
            groundY: 480
        };

        // Assets
        this.bgImage = new Image();
        this.bgImage.src = 'assets/arena_bg.jpg';

        this.lastTime = performance.now();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardInput();
        this.setupTouchControls();
        this.renderCodex();
        this.renderCharacterSelect();
        this.renderDojoButtons();

        // Start render loop
        requestAnimationFrame(this.loop.bind(this));
    }

    setupEventListeners() {
        // Navigation Buttons
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.nav;
                this.navigate(target);
            });
        });

        // Mode Select buttons
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.gameMode = btn.dataset.mode;
                this.navigate('char_select');
            });
        });

        // Audio Toggle
        const audioBtn = document.getElementById('audio-toggle-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                this.soundCtrl.setMute(!this.soundCtrl.isMuted);
                audioBtn.innerHTML = this.soundCtrl.isMuted ? '🔇 Audio Off' : '🔊 Audio On';
                audioBtn.classList.toggle('muted', this.soundCtrl.isMuted);
            });
        }

        // Difficulty select
        const diffSelect = document.getElementById('ai-difficulty-select');
        if (diffSelect) {
            diffSelect.addEventListener('change', (e) => {
                this.aiDifficulty = e.target.value;
            });
        }

        // Rematch & Return buttons
        const rematchBtn = document.getElementById('rematch-btn');
        if (rematchBtn) {
            rematchBtn.addEventListener('click', () => {
                this.startBattle();
            });
        }

        const returnMenuBtn = document.getElementById('return-menu-btn');
        if (returnMenuBtn) {
            returnMenuBtn.addEventListener('click', () => {
                this.navigate('title');
            });
        }

        // Start Dojo Game button
        const startDojoBtn = document.getElementById('start-dojo-btn');
        if (startDojoBtn) {
            startDojoBtn.addEventListener('click', () => {
                this.dojo.start();
            });
        }
    }

    navigate(view) {
        this.currentView = view;
        document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active'));

        const targetEl = document.getElementById(`view-${view}`);
        if (targetEl) targetEl.classList.add('active');

        // Logic upon entering view
        if (view === 'battle') {
            this.startBattle();
        } else {
            this.isMatchRunning = false;
            if (this.soundCtrl.musicPlaying) {
                // Keep playing or adjust
            }
        }

        if (view === 'dojo') {
            this.dojo.start();
        }
    }

    setupKeyboardInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Dojo Mini-Game Hotkeys
            if (this.currentView === 'dojo' && this.dojo.isPlaying) {
                const sealMatch = this.dojo.seals.find(s => s.key === e.key);
                if (sealMatch) {
                    this.dojo.onSealInput(sealMatch.id);
                }
            }

            // In-Battle Player 1 actions
            if (this.isMatchRunning && this.p1 && !this.p1.isDead()) {
                if (e.code === 'KeyJ') this.p1.lightAttack(this.soundCtrl);
                if (e.code === 'KeyK') this.p1.heavyAttack(this.soundCtrl);
                if (e.code === 'KeyL') this.p1.triggerKawarimi(this.soundCtrl);
                if (e.code === 'KeyU') this.triggerJutsuWithBanner(this.p1, 0);
                if (e.code === 'KeyI') this.triggerJutsuWithBanner(this.p1, 1);
                if (e.code === 'KeyO') this.triggerJutsuWithBanner(this.p1, 2);
                if (e.code === 'KeyW') this.p1.jump();
                if (e.code === 'KeyS') this.p1.guard(true);
                if (e.code === 'Space') this.p1.startCharge();
            }

            // In-Battle Player 2 (Local PVP)
            if (this.isMatchRunning && this.p2 && !this.p2.isAI && !this.p2.isDead()) {
                if (e.code === 'Numpad1') this.p2.lightAttack(this.soundCtrl);
                if (e.code === 'Numpad2') this.p2.heavyAttack(this.soundCtrl);
                if (e.code === 'Numpad3') this.p2.triggerKawarimi(this.soundCtrl);
                if (e.code === 'Numpad4') this.triggerJutsuWithBanner(this.p2, 0);
                if (e.code === 'Numpad5') this.triggerJutsuWithBanner(this.p2, 1);
                if (e.code === 'Numpad6') this.triggerJutsuWithBanner(this.p2, 2);
                if (e.code === 'ArrowUp') this.p2.jump();
                if (e.code === 'ArrowDown') this.p2.guard(true);
                if (e.code === 'Numpad0') this.p2.startCharge();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            if (this.p1) {
                if (e.code === 'KeyS') this.p1.guard(false);
                if (e.code === 'Space') this.p1.stopCharge();
                if (e.code === 'KeyA' || e.code === 'KeyD') {
                    if (!this.keys['KeyA'] && !this.keys['KeyD']) this.p1.stopMove();
                }
            }

            if (this.p2 && !this.p2.isAI) {
                if (e.code === 'ArrowDown') this.p2.guard(false);
                if (e.code === 'Numpad0') this.p2.stopCharge();
                if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                    if (!this.keys['ArrowLeft'] && !this.keys['ArrowRight']) this.p2.stopMove();
                }
            }
        });
    }

    setupTouchControls() {
        const bindButton = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const press = (e) => {
                e.preventDefault();
                if (onDown) onDown();
            };
            const release = (e) => {
                e.preventDefault();
                if (onUp) onUp();
            };
            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release);
            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
        };

        // Movement
        bindButton('btn-touch-left', () => { if (this.p1) this.p1.move(-1); }, () => { if (this.p1) this.p1.stopMove(); });
        bindButton('btn-touch-right', () => { if (this.p1) this.p1.move(1); }, () => { if (this.p1) this.p1.stopMove(); });
        bindButton('btn-touch-jump', () => { if (this.p1) this.p1.jump(); }, null);
        bindButton('btn-touch-guard', () => { if (this.p1) this.p1.guard(true); }, () => { if (this.p1) this.p1.guard(false); });

        // Attacks
        bindButton('btn-touch-light', () => { if (this.p1) this.p1.lightAttack(this.soundCtrl); }, null);
        bindButton('btn-touch-heavy', () => { if (this.p1) this.p1.heavyAttack(this.soundCtrl); }, null);
        bindButton('btn-touch-dodge', () => { if (this.p1) this.p1.triggerKawarimi(this.soundCtrl); }, null);
        bindButton('btn-touch-charge', () => { if (this.p1) this.p1.startCharge(); }, () => { if (this.p1) this.p1.stopCharge(); });

        // Jutsus
        bindButton('btn-touch-j1', () => { if (this.p1) this.triggerJutsuWithBanner(this.p1, 0); }, null);
        bindButton('btn-touch-j2', () => { if (this.p1) this.triggerJutsuWithBanner(this.p1, 1); }, null);
        bindButton('btn-touch-ult', () => { if (this.p1) this.triggerJutsuWithBanner(this.p1, 2); }, null);
    }

    triggerJutsuWithBanner(fighter, jutsuIndex) {
        const jutsu = fighter.charData.jutsus[jutsuIndex];
        const success = fighter.triggerJutsu(jutsuIndex, this.soundCtrl);
        if (success) {
            this.showJutsuBanner(fighter, jutsu);
        }
    }

    showJutsuBanner(fighter, jutsu) {
        const banner = document.getElementById('jutsu-cutin-banner');
        if (!banner) return;

        banner.innerHTML = `
            <div class="jutsu-cutin-content ${fighter.isPlayer2 ? 'p2' : 'p1'}">
                <img src="${fighter.charData.avatar}" class="jutsu-cutin-avatar" alt="${fighter.name}">
                <div class="jutsu-cutin-text">
                    <span class="jutsu-japanese">${jutsu.japanese}</span>
                    <span class="jutsu-name">${jutsu.name}!</span>
                    <span class="jutsu-caller">${fighter.name}</span>
                </div>
            </div>
        `;
        banner.classList.add('active');
        setTimeout(() => {
            banner.classList.remove('active');
        }, 900);
    }

    // --- CHARACTER SELECT SCREEN ---
    renderCharacterSelect() {
        const container = document.getElementById('char-select-roster');
        if (!container) return;

        container.innerHTML = Object.values(CHARACTERS).map(char => `
            <div class="roster-card ${char.id === this.p1CharId ? 'selected-p1' : ''}" data-char="${char.id}">
                <img src="${char.avatar}" alt="${char.name}" class="roster-img">
                <div class="roster-info">
                    <h3>${char.name}</h3>
                    <p class="roster-title">${char.title}</p>
                    <div class="roster-stat-bar">
                        <span>HP: ${char.maxHp}</span>
                        <span>SPD: ${char.speed}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Selection click
        container.querySelectorAll('.roster-card').forEach(card => {
            card.addEventListener('click', () => {
                this.p1CharId = card.dataset.char;
                // If in PVE, choose random or default foe
                const availableFoes = Object.keys(CHARACTERS).filter(k => k !== this.p1CharId);
                this.p2CharId = availableFoes[Math.floor(Math.random() * availableFoes.length)];
                
                container.querySelectorAll('.roster-card').forEach(c => c.classList.remove('selected-p1'));
                card.classList.add('selected-p1');
                this.updateSelectedPreview();
            });
        });

        this.updateSelectedPreview();
    }

    updateSelectedPreview() {
        const p1Data = CHARACTERS[this.p1CharId];
        const p2Data = CHARACTERS[this.p2CharId];

        const p1El = document.getElementById('select-p1-preview');
        const p2El = document.getElementById('select-p2-preview');

        if (p1El && p1Data) {
            p1El.innerHTML = `
                <img src="${p1Data.avatar}" alt="${p1Data.name}">
                <div class="preview-meta">
                    <h4>${p1Data.name}</h4>
                    <p>${p1Data.village}</p>
                    <div class="jutsu-preview-list">
                        ${p1Data.jutsus.map(j => `<span>⚡ ${j.name}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (p2El && p2Data) {
            p2El.innerHTML = `
                <img src="${p2Data.avatar}" alt="${p2Data.name}">
                <div class="preview-meta">
                    <h4>${p2Data.name}</h4>
                    <p>${p2Data.village} (${this.gameMode === 'pve' ? 'CPU' : 'Player 2'})</p>
                    <div class="jutsu-preview-list">
                        ${p2Data.jutsus.map(j => `<span>⚡ ${j.name}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    }

    // --- BATTLE INITIALIZATION ---
    startBattle() {
        const p1Config = CHARACTERS[this.p1CharId];
        const p2Config = CHARACTERS[this.p2CharId];

        this.p1 = new Fighter(p1Config, false, false);
        this.p2 = new Fighter(p2Config, true, this.gameMode === 'pve' || this.gameMode === 'survival');

        this.isMatchRunning = true;
        this.matchTimer = 99;
        this.matchResult = null;

        const modal = document.getElementById('battle-result-modal');
        if (modal) modal.classList.remove('active');

        // Start BGM
        if (!this.soundCtrl.isMuted) {
            this.soundCtrl.startBGM();
        }

        // Match Timer interval
        if (this.matchInterval) clearInterval(this.matchInterval);
        this.matchInterval = setInterval(() => {
            if (!this.isMatchRunning) return;
            this.matchTimer--;
            const timerEl = document.getElementById('battle-timer');
            if (timerEl) timerEl.textContent = this.matchTimer;

            if (this.matchTimer <= 0) {
                this.endMatch('draw');
            }
        }, 1000);

        this.updateHUDStatic();
    }

    updateHUDStatic() {
        // Names & Avatars
        const p1NameEl = document.getElementById('hud-p1-name');
        const p2NameEl = document.getElementById('hud-p2-name');
        const p1Ava = document.getElementById('hud-p1-avatar');
        const p2Ava = document.getElementById('hud-p2-avatar');

        if (p1NameEl) p1NameEl.textContent = this.p1.name;
        if (p2NameEl) p2NameEl.textContent = this.p2.name + (this.p2.isAI ? ' (CPU)' : '');
        if (p1Ava) p1Ava.src = this.p1.charData.avatar;
        if (p2Ava) p2Ava.src = this.p2.charData.avatar;

        // Jutsu labels
        this.p1.charData.jutsus.forEach((j, idx) => {
            const btn = document.getElementById(`btn-touch-j${idx + 1}`) || document.getElementById(`hud-p1-j${idx + 1}`);
            if (btn) btn.title = `${j.name} (${j.cost} Chakra)`;
        });
    }

    endMatch(winner) {
        this.isMatchRunning = false;
        clearInterval(this.matchInterval);
        this.matchResult = winner;

        if (this.soundCtrl) {
            this.soundCtrl.playVictory();
        }

        const modal = document.getElementById('battle-result-modal');
        const titleEl = document.getElementById('modal-result-title');
        const descEl = document.getElementById('modal-result-desc');

        if (modal && titleEl && descEl) {
            if (winner === 'p1') {
                titleEl.textContent = 'VICTORY! 🏆';
                titleEl.className = 'result-title victory';
                descEl.textContent = `${this.p1.name} wins the Shinobi Duel! Dattebayo!`;
                this.p1Wins++;
            } else if (winner === 'p2') {
                titleEl.textContent = 'DEFEAT! 💥';
                titleEl.className = 'result-title defeat';
                descEl.textContent = `${this.p2.name} reigns victorious. Train harder, Shinobi!`;
                this.p2Wins++;
            } else {
                titleEl.textContent = 'DRAW! ⚖️';
                titleEl.className = 'result-title draw';
                descEl.textContent = 'Time expired! Both Shinobi fought with equal valor!';
            }
            modal.classList.add('active');
        }
    }

    // --- GAME LOOP ---
    loop(currentTime) {
        const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        if (this.currentView === 'battle' && this.ctx) {
            this.update(dt);
            this.render();
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        if (!this.isMatchRunning) return;

        // Player 1 input handling (movement)
        if (this.p1 && !this.p1.isDead()) {
            if (this.keys['KeyA']) {
                this.p1.move(-1);
            } else if (this.keys['KeyD']) {
                this.p1.move(1);
            }
        }

        // Player 2 input handling (movement)
        if (this.p2 && !this.p2.isAI && !this.p2.isDead()) {
            if (this.keys['ArrowLeft']) {
                this.p2.move(-1);
            } else if (this.keys['ArrowRight']) {
                this.p2.move(1);
            }
        }

        // Update Fighters
        this.p1.update(dt, this.p2, this.particleSys, this.soundCtrl, this.arenaBounds);
        this.p2.update(dt, this.p1, this.particleSys, this.soundCtrl, this.arenaBounds);

        // Update Particle System
        this.particleSys.update(this.virtualWidth, this.virtualHeight);

        // Check for KO
        if (this.p1.isDead() && !this.matchResult) {
            this.endMatch('p2');
        } else if (this.p2.isDead() && !this.matchResult) {
            this.endMatch('p1');
        }

        // Update HUD
        this.updateHUDLive();
    }

    updateHUDLive() {
        if (!this.p1 || !this.p2) return;

        // HP Bars
        const p1HpPercent = (this.p1.hp / this.p1.maxHp) * 100;
        const p2HpPercent = (this.p2.hp / this.p2.maxHp) * 100;
        const p1HpBar = document.getElementById('hud-p1-hp');
        const p2HpBar = document.getElementById('hud-p2-hp');
        if (p1HpBar) p1HpBar.style.width = `${Math.max(0, p1HpPercent)}%`;
        if (p2HpBar) p2HpBar.style.width = `${Math.max(0, p2HpPercent)}%`;

        // Chakra Bars
        const p1ChakraPercent = (this.p1.chakra / this.p1.maxChakra) * 100;
        const p2ChakraPercent = (this.p2.chakra / this.p2.maxChakra) * 100;
        const p1ChakraBar = document.getElementById('hud-p1-chakra');
        const p2ChakraBar = document.getElementById('hud-p2-chakra');
        if (p1ChakraBar) p1ChakraBar.style.width = `${Math.max(0, p1ChakraPercent)}%`;
        if (p2ChakraBar) p2ChakraBar.style.width = `${Math.max(0, p2ChakraPercent)}%`;

        // Cooldown states on virtual buttons
        const j1Btn = document.getElementById('btn-touch-j1');
        const j2Btn = document.getElementById('btn-touch-j2');
        const ultBtn = document.getElementById('btn-touch-ult');
        const dodgeBtn = document.getElementById('btn-touch-dodge');

        if (j1Btn) j1Btn.classList.toggle('disabled', this.p1.chakra < 25 || this.p1.jutsuCooldowns[0] > 0);
        if (j2Btn) j2Btn.classList.toggle('disabled', this.p1.chakra < 40 || this.p1.jutsuCooldowns[1] > 0);
        if (ultBtn) ultBtn.classList.toggle('disabled', this.p1.chakra < 100 || this.p1.jutsuCooldowns[2] > 0);
        if (dodgeBtn) dodgeBtn.classList.toggle('disabled', this.p1.kawarimiCooldown > 0);
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

        // 1. Draw Arena Background
        if (this.bgImage.complete && this.bgImage.naturalWidth !== 0) {
            ctx.drawImage(this.bgImage, 0, 0, this.virtualWidth, this.virtualHeight);
        } else {
            // Dark gradient fallback
            const grad = ctx.createLinearGradient(0, 0, 0, this.virtualHeight);
            grad.addColorStop(0, '#10141f');
            grad.addColorStop(1, '#05070a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
        }

        // 2. Arena Stage Floor & Lighting
        ctx.fillStyle = 'rgba(15, 20, 28, 0.7)';
        ctx.fillRect(0, this.arenaBounds.groundY, this.virtualWidth, this.virtualHeight - this.arenaBounds.groundY);
        ctx.strokeStyle = 'rgba(255, 152, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.arenaBounds.groundY);
        ctx.lineTo(this.virtualWidth, this.arenaBounds.groundY);
        ctx.stroke();

        // 3. Render Fighters
        if (this.p1) this.p1.render(ctx);
        if (this.p2) this.p2.render(ctx);

        // 4. Render Particle System (Auras, sparks, lightning, damage numbers)
        this.particleSys.render(ctx);
    }

    // --- SHINOBI CODEX SCREEN ---
    renderCodex() {
        const container = document.getElementById('codex-container');
        if (!container) return;

        container.innerHTML = Object.values(CHARACTERS).map(char => `
            <div class="codex-card">
                <div class="codex-avatar-box">
                    <img src="${char.avatar}" alt="${char.name}" class="codex-avatar">
                    <div class="codex-village-badge">${char.village}</div>
                </div>
                <div class="codex-details">
                    <h3 class="codex-name">${char.name}</h3>
                    <p class="codex-title">${char.title}</p>
                    <blockquote class="codex-quote">"${char.quote}"</blockquote>

                    <div class="codex-passive-box">
                        <strong>Passive: ${char.passive.name}</strong>
                        <p>${char.passive.desc}</p>
                    </div>

                    <div class="codex-stats-grid">
                        <div class="stat-row"><span>Ninjutsu</span><div class="stat-meter"><div style="width: ${char.stats.ninjutsu}%"></div></div></div>
                        <div class="stat-row"><span>Taijutsu</span><div class="stat-meter"><div style="width: ${char.stats.taijutsu}%"></div></div></div>
                        <div class="stat-row"><span>Genjutsu</span><div class="stat-meter"><div style="width: ${char.stats.genjutsu}%"></div></div></div>
                        <div class="stat-row"><span>Chakra</span><div class="stat-meter"><div style="width: ${char.stats.chakra}%"></div></div></div>
                        <div class="stat-row"><span>Speed</span><div class="stat-meter"><div style="width: ${char.stats.speed}%"></div></div></div>
                    </div>

                    <div class="codex-jutsu-accordion">
                        <h4>Mastered Jutsus:</h4>
                        ${char.jutsus.map(j => `
                            <div class="codex-jutsu-item">
                                <div class="jutsu-item-hdr">
                                    <span class="jutsu-badge">${j.name}</span>
                                    <span class="jutsu-jp">${j.japanese}</span>
                                </div>
                                <p class="jutsu-desc">${j.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- DOJO BUTTONS ---
    renderDojoButtons() {
        const container = document.getElementById('dojo-seals-grid');
        if (!container) return;

        container.innerHTML = this.dojo.seals.map(seal => `
            <button class="dojo-seal-btn" data-seal="${seal.id}">
                <span class="seal-kanji">${seal.kanji}</span>
                <span class="seal-title">${seal.name}</span>
                <span class="seal-badge">[Key ${seal.key}]</span>
            </button>
        `).join('');

        container.querySelectorAll('.dojo-seal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.dojo.onSealInput(btn.dataset.seal);
            });
        });
    }
}

// Instantiate App on window load
window.addEventListener('DOMContentLoaded', () => {
    window.narutoApp = new App();
});
