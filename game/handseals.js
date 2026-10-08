// Naruto: Hand Seals Ninja Dojo (Chakra & Reflex Training Mini-Game)

class HandSealsDojo {
    constructor() {
        this.seals = [
            { id: 'tiger', kanji: '寅', name: 'Tiger (Tora)', key: '1' },
            { id: 'snake', kanji: '巳', name: 'Snake (Mi)', key: '2' },
            { id: 'dragon', kanji: '辰', name: 'Dragon (Tatsu)', key: '3' },
            { id: 'dog', kanji: '戌', name: 'Dog (Inu)', key: '4' },
            { id: 'ox', kanji: '丑', name: 'Ox (Ushi)', key: '5' },
            { id: 'ram', kanji: '未', name: 'Ram (Hitsuji)', key: '6' },
            { id: 'monkey', kanji: '申', name: 'Monkey (Saru)', key: '7' },
            { id: 'boar', kanji: '亥', name: 'Boar (I)', key: '8' }
        ];

        this.jutsuRecipes = [
            {
                name: 'Fire Style: Fireball Jutsu',
                japanese: '火遁・豪火球の術',
                sequence: ['tiger', 'snake', 'ram', 'monkey', 'boar', 'tiger'],
                chakraReward: 50,
                difficulty: 'Chunin'
            },
            {
                name: 'Chidori (One Thousand Birds)',
                japanese: '千鳥',
                sequence: ['ox', 'dragon', 'monkey'],
                chakraReward: 40,
                difficulty: 'Jonin'
            },
            {
                name: 'Summoning Jutsu (Kuchiyose)',
                japanese: '口寄せの術',
                sequence: ['boar', 'dog', 'tiger', 'monkey', 'ram'],
                chakraReward: 60,
                difficulty: 'Chunin'
            },
            {
                name: 'Shadow Clone Jutsu (Kage Bunshin)',
                japanese: '影分身の術',
                sequence: ['tiger', 'ox', 'dog', 'tiger'],
                chakraReward: 35,
                difficulty: 'Genin'
            },
            {
                name: 'Water Dragon Jutsu (Suiryudan)',
                japanese: '水遁・水龍弾の術',
                sequence: ['ox', 'monkey', 'snake', 'dragon', 'tiger', 'dog', 'ox'],
                chakraReward: 80,
                difficulty: 'Jonin'
            },
            {
                name: 'Reaper Death Seal (Shiki Fujin)',
                japanese: '屍鬼封尽',
                sequence: ['snake', 'boar', 'ram', 'dragon', 'dog', 'tiger', 'snake'],
                chakraReward: 120,
                difficulty: 'Kage'
            }
        ];

        this.currentRecipeIndex = 0;
        this.currentStep = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.timer = 15.0;
        this.timerInterval = null;
        this.isPlaying = false;
    }

    start() {
        this.isPlaying = true;
        this.score = 0;
        this.streak = 0;
        this.currentRecipeIndex = 0;
        this.currentStep = 0;
        this.loadRecipe();
        this.startTimer();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer = 12.0;
        this.updateUI();

        this.timerInterval = setInterval(() => {
            if (!this.isPlaying) return;
            this.timer -= 0.1;
            if (this.timer <= 0) {
                this.timeOut();
            }
            this.updateUI();
        }, 100);
    }

    loadRecipe() {
        this.currentStep = 0;
        this.currentRecipe = this.jutsuRecipes[this.currentRecipeIndex];
        this.timer = Math.max(7, 13 - Math.floor(this.score / 200));
        this.renderRecipe();
    }

    onSealInput(sealId) {
        if (!this.isPlaying) return;

        const targetSeal = this.currentRecipe.sequence[this.currentStep];
        if (sealId === targetSeal) {
            // Correct seal!
            if (window.soundCtrl) window.soundCtrl.playClash();
            this.currentStep++;
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;

            // Check if recipe completed
            if (this.currentStep >= this.currentRecipe.sequence.length) {
                this.jutsuCompleted();
            } else {
                this.renderRecipe();
            }
        } else {
            // Wrong seal!
            if (window.soundCtrl) window.soundCtrl.playHit(false);
            this.streak = 0;
            const statusEl = document.getElementById('dojo-status');
            if (statusEl) {
                statusEl.textContent = '❌ Wrong Hand Seal! Resetting jutsu sequence!';
                statusEl.className = 'dojo-feedback fail';
            }
            this.currentStep = 0;
            this.renderRecipe();
        }
        this.updateUI();
    }

    jutsuCompleted() {
        if (window.soundCtrl) window.soundCtrl.playUltimateAwakening();
        const earned = this.currentRecipe.chakraReward + (this.streak * 5);
        this.score += earned;

        const statusEl = document.getElementById('dojo-status');
        if (statusEl) {
            statusEl.textContent = `✨ JUTSU SUCCESS: ${this.currentRecipe.name}! (+${earned} XP)`;
            statusEl.className = 'dojo-feedback success';
        }

        // Show jutsu banner effect
        this.triggerDojoBanner(this.currentRecipe);

        // Next recipe
        this.currentRecipeIndex = (this.currentRecipeIndex + 1) % this.jutsuRecipes.length;
        setTimeout(() => {
            if (this.isPlaying) {
                this.loadRecipe();
            }
        }, 800);
    }

    timeOut() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        if (window.soundCtrl) window.soundCtrl.playHit(true);

        const statusEl = document.getElementById('dojo-status');
        if (statusEl) {
            statusEl.textContent = `⌛ TIME UP! Final Ninja Score: ${this.score} pts. Max Streak: ${this.maxStreak}`;
            statusEl.className = 'dojo-feedback gameover';
        }

        // Save high score
        const best = parseInt(localStorage.getItem('naruto_dojo_highscore') || '0', 10);
        if (this.score > best) {
            localStorage.setItem('naruto_dojo_highscore', this.score);
        }
        this.updateUI();
    }

    triggerDojoBanner(jutsu) {
        const overlay = document.getElementById('dojo-unleash-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="unleash-card">
                    <div class="unleash-kanji">${jutsu.japanese}</div>
                    <div class="unleash-title">${jutsu.name}</div>
                    <div class="unleash-sub">JUTSU UNLEASHED!</div>
                </div>
            `;
            overlay.classList.add('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 750);
        }
    }

    renderRecipe() {
        const container = document.getElementById('dojo-sequence-display');
        const titleEl = document.getElementById('dojo-jutsu-name');
        const diffEl = document.getElementById('dojo-difficulty');
        if (!container || !this.currentRecipe) return;

        titleEl.textContent = `${this.currentRecipe.name} (${this.currentRecipe.japanese})`;
        diffEl.textContent = `Rank: ${this.currentRecipe.difficulty} | Reward: ${this.currentRecipe.chakraReward} pts`;

        container.innerHTML = this.currentRecipe.sequence.map((sealId, idx) => {
            const sealObj = this.seals.find(s => s.id === sealId);
            const isDone = idx < this.currentStep;
            const isCurrent = idx === this.currentStep;
            return `
                <div class="seal-step-box ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                    <span class="seal-step-kanji">${sealObj ? sealObj.kanji : ''}</span>
                    <span class="seal-step-name">${sealObj ? sealObj.name : ''}</span>
                    <span class="seal-step-key">[${sealObj ? sealObj.key : ''}]</span>
                </div>
            `;
        }).join('');
    }

    updateUI() {
        const scoreEl = document.getElementById('dojo-score');
        const streakEl = document.getElementById('dojo-streak');
        const timerEl = document.getElementById('dojo-timer');
        const bestEl = document.getElementById('dojo-best');

        if (scoreEl) scoreEl.textContent = this.score;
        if (streakEl) streakEl.textContent = this.streak;
        if (timerEl) timerEl.textContent = Math.max(0, this.timer).toFixed(1) + 's';
        if (bestEl) bestEl.textContent = localStorage.getItem('naruto_dojo_highscore') || '0';
    }
}

window.HandSealsDojo = HandSealsDojo;
