// Character definitions and abilities for Naruto: Shinobi Clash

const CHARACTERS = {
    naruto: {
        id: 'naruto',
        name: 'Naruto Uzumaki',
        title: 'Nine-Tails Jinchuriki',
        village: 'Konohagakure',
        avatar: 'assets/naruto.jpg',
        themeColor: '#ff9800',
        auraColor: '#ffd54f',
        maxHp: 1000,
        maxChakra: 100,
        speed: 5.5,
        jumpForce: 13.5,
        attackPower: 1.0,
        stats: {
            ninjutsu: 96,
            taijutsu: 92,
            genjutsu: 55,
            chakra: 100,
            speed: 90
        },
        passive: {
            name: 'Uzumaki Vitality',
            desc: 'Regenerates HP gradually when health falls below 30%.'
        },
        jutsus: [
            {
                id: 'bunshin',
                name: 'Shadow Clones',
                japanese: '影分身の術 (Kage Bunshin)',
                cost: 25,
                cooldown: 3.5,
                damage: 120,
                type: 'projectile_summon',
                desc: 'Summons two shadow clones rushing to strike the enemy.'
            },
            {
                id: 'rasengan',
                name: 'Rasengan',
                japanese: '螺旋丸 (Spiraling Sphere)',
                cost: 40,
                cooldown: 5.0,
                damage: 220,
                type: 'dash_strike',
                desc: 'Dashes forward with high velocity and slams a swirling sphere of pure chakra.'
            },
            {
                id: 'ultimate_rasenshuriken',
                name: 'Kurama Rasenshuriken',
                japanese: '風遁・螺旋手裏剣 (Sage Art)',
                cost: 100,
                cooldown: 12.0,
                damage: 480,
                type: 'ultimate',
                desc: 'Awakens Nine-Tails golden shroud and unleashes a cataclysmic wind-chakra blade.'
            }
        ],
        quote: "I never go back on my word... That's my ninja way! Dattebayo!"
    },

    sasuke: {
        id: 'sasuke',
        name: 'Sasuke Uchiha',
        title: 'Avenger & Shadow Shinobi',
        village: 'Uchiha Clan / Rogue',
        avatar: 'assets/sasuke.jpg',
        themeColor: '#29b6f6',
        auraColor: '#7c4dff',
        maxHp: 920,
        maxChakra: 100,
        speed: 6.2,
        jumpForce: 14.0,
        attackPower: 1.1,
        stats: {
            ninjutsu: 98,
            taijutsu: 94,
            genjutsu: 88,
            chakra: 90,
            speed: 98
        },
        passive: {
            name: 'Sharingan Reflex',
            desc: 'Dodge Kawarimi cooldown is 30% faster and landing hits grants bonus Chakra.'
        },
        jutsus: [
            {
                id: 'fireball',
                name: 'Fireball Jutsu',
                japanese: '火遁・豪火球の術 (Katon Goukakyuu)',
                cost: 25,
                cooldown: 3.0,
                damage: 130,
                type: 'projectile_fire',
                desc: 'Expels a massive roaring sphere of blazing flames across the arena.'
            },
            {
                id: 'chidori',
                name: 'Chidori',
                japanese: '千鳥 (One Thousand Birds)',
                cost: 40,
                cooldown: 4.5,
                damage: 240,
                type: 'dash_pierce',
                desc: 'Charges lightning in hand and thrusts forward at blinding speed.'
            },
            {
                id: 'ultimate_kirin',
                name: 'Kirin Thunder God',
                japanese: '雷遁・麒麟 (Kirin Storm)',
                cost: 100,
                cooldown: 12.0,
                damage: 500,
                type: 'ultimate',
                desc: 'Summons a colossal lightning dragon from thunderclouds striking down the foe.'
            }
        ],
        quote: "My dream doesn't exist in the future. It lies in the past... and the darkness."
    },

    kakashi: {
        id: 'kakashi',
        name: 'Kakashi Hatake',
        title: 'The Copy Ninja / 6th Hokage',
        village: 'Konohagakure',
        avatar: 'assets/kakashi.jpg',
        themeColor: '#26a69a',
        auraColor: '#00e5ff',
        maxHp: 950,
        maxChakra: 100,
        speed: 5.8,
        jumpForce: 13.8,
        attackPower: 1.05,
        stats: {
            ninjutsu: 95,
            taijutsu: 90,
            genjutsu: 90,
            chakra: 82,
            speed: 92
        },
        passive: {
            name: 'Genius Tactician',
            desc: 'Chakra recovery rate is increased by 25% during active battle.'
        },
        jutsus: [
            {
                id: 'mudwall',
                name: 'Earth Style Mud Wall',
                japanese: '土遁・土流壁 (Doryuheki)',
                cost: 20,
                cooldown: 4.0,
                damage: 110,
                type: 'ground_erupt',
                desc: 'Spikes massive stone earth pillars that crush oncoming opponents.'
            },
            {
                id: 'raikiri',
                name: 'Lightning Blade',
                japanese: '雷切 (Raikiri)',
                cost: 40,
                cooldown: 4.8,
                damage: 235,
                type: 'teleport_cut',
                desc: 'Refined Chidori blade that cuts through lightning and slices the enemy.'
            },
            {
                id: 'ultimate_kamui',
                name: 'Kamui Dimensional Abyss',
                japanese: '神威 (Space-Time Dojutsu)',
                cost: 100,
                cooldown: 12.0,
                damage: 490,
                type: 'ultimate',
                desc: 'Focuses Mangekyo Sharingan to create a spatial vortex tearing space apart.'
            }
        ],
        quote: "In the ninja world, those who break rules are scum. But those who abandon friends are worse than scum."
    },

    itachi: {
        id: 'itachi',
        name: 'Itachi Uchiha',
        title: 'Akatsuki Enigma',
        village: 'Akatsuki / Konoha',
        avatar: 'assets/itachi.jpg',
        themeColor: '#e53935',
        auraColor: '#d50000',
        maxHp: 890,
        maxChakra: 100,
        speed: 6.0,
        jumpForce: 13.5,
        attackPower: 1.15,
        stats: {
            ninjutsu: 97,
            taijutsu: 88,
            genjutsu: 100,
            chakra: 85,
            speed: 94
        },
        passive: {
            name: 'Crow Genjutsu',
            desc: 'Counter-guarding triggers a crow illusion that stuns the attacker for 0.8s.'
        },
        jutsus: [
            {
                id: 'crow_clone',
                name: 'Crow Clone Mirage',
                japanese: '烏分身の術 (Karasu Bunshin)',
                cost: 25,
                cooldown: 3.5,
                damage: 125,
                type: 'shadow_rush',
                desc: 'Disperses into crows that swarm and slash the target from all angles.'
            },
            {
                id: 'amaterasu',
                name: 'Amaterasu Black Flames',
                japanese: '天照 (Inextinguishable Flame)',
                cost: 45,
                cooldown: 5.5,
                damage: 250,
                type: 'direct_burn',
                desc: 'Ignites inextinguishable black flames right at the target location.'
            },
            {
                id: 'ultimate_tsukuyomi',
                name: 'Tsukuyomi (Infinite Nightmare)',
                japanese: '月読 (Mangekyo Genjutsu)',
                cost: 100,
                cooldown: 12.0,
                damage: 510,
                type: 'ultimate',
                desc: 'Traps opponent in a blood-red nightmare world controlling space and time.'
            }
        ],
        quote: "People live their lives bound by what they accept as correct and true... That is reality."
    }
};

window.CHARACTERS = CHARACTERS;
