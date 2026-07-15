const app = {
    currentPage: 1,
    audioPlaying: false,
    gamesCompleted: { game1: false, game2: false },
    bgm: null,
    targetVolume: 0.2,
    fadeInterval: null,
    
    init() {
        this.bgm = document.getElementById('bgm');
        this.bgm.volume = 0;
        
        this.updateStaticLanguage();
        window.addEventListener('beforeunload', () => {
            if (this.audioPlaying) this.fadeAudio(false);
        });

        // Initialize Three.js Sakura Heart
        animations.initIntroHeart();
    },

    goToPage(pageNum) {
        // Autoplay audio if not playing and moving past intro
        if(!this.audioPlaying && pageNum > 1) {
            this.fadeAudio(true);
        }

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        const targetPage = document.getElementById(`page-${pageNum}`);
        if(targetPage) targetPage.classList.add('active');
        
        this.currentPage = pageNum;

        // Trigger specific scene logic
        if (pageNum === 2) scenes.startStory();
        if (pageNum === 6) scenes.startFinalScene();
    },

    checkGamesComplete() {
        if (this.gamesCompleted.game1 && this.gamesCompleted.game2) {
            const btn = document.getElementById('finish-games-btn');
            btn.style.display = 'inline-block';
            btn.classList.add('pop-out');
        }
    },

    startGame1() {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-game-1').classList.add('active');
        games.initGame1();
    },

    endGame1() {
        this.gamesCompleted.game1 = true;
        this.goToPage(4);
        this.checkGamesComplete();
    },

    startGame2() {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-game-2').classList.add('active');
        games.initGame2();
    },

    endGame2() {
        this.gamesCompleted.game2 = true;
        document.getElementById('res-journey').textContent = 'Completed 🗻';
        this.goToPage(4);
        this.checkGamesComplete();
    },

    nextStory() { scenes.nextStory(); },

    currentLanguage: 'jp',
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'jp' ? 'en' : 'jp';
        this.updateStaticLanguage();
        
        if (this.currentPage === 2 && !scenes.isTyping) {
            const textEl = document.getElementById('story-text');
            const lineData = scenes.storyLines[scenes.storyIndex];
            textEl.innerHTML = (this.currentLanguage === 'en' ? lineData.en : lineData.jp).replace(/\n/g, '<br>');
        }
        if (this.currentPage === 6) {
            const container = document.getElementById('final-text-container');
            if (container) {
                const blocks = container.children;
                for (let i = 0; i < scenes.finalIndex; i++) {
                    if (blocks[i]) {
                        const h3 = blocks[i].querySelector('h3');
                        if (h3) h3.textContent = this.currentLanguage === 'en' ? scenes.finalLines[i].en : scenes.finalLines[i].jp;
                    }
                }
            }
        }
    },

    updateStaticLanguage() {
        document.querySelectorAll('.lang-text').forEach(el => {
            const text = el.getAttribute(`data-${this.currentLanguage}`);
            if(text) el.textContent = text;
        });
    },
    
    fadeAudio(fadeIn) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        
        if (fadeIn) {
            this.bgm.volume = 0;
            this.bgm.play().then(() => {
                this.audioPlaying = true;
                const indicator = document.getElementById('music-indicator');
                if(indicator) indicator.style.opacity = '1';
                
                this.fadeInterval = setInterval(() => {
                    let nextVol = this.bgm.volume + 0.05;
                    if (nextVol < this.targetVolume) {
                        this.bgm.volume = nextVol;
                    } else {
                        this.bgm.volume = this.targetVolume;
                        clearInterval(this.fadeInterval);
                    }
                }, 200);
            }).catch(() => {
                console.warn("Audio play failed or file missing.");
                this.audioPlaying = false;
            });
        } else {
            this.fadeInterval = setInterval(() => {
                let nextVol = this.bgm.volume - 0.05;
                if (nextVol > 0) {
                    this.bgm.volume = nextVol;
                } else {
                    this.bgm.volume = 0;
                    this.bgm.pause();
                    this.audioPlaying = false;
                    const indicator = document.getElementById('music-indicator');
                    if(indicator) indicator.style.opacity = '0';
                    clearInterval(this.fadeInterval);
                }
            }, 100);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
