const games = {
    // -----------------------------------------
    // GAME 1: MEMORY MATCH
    // -----------------------------------------
    g1: {
        icons: ['🐱', '🍓', '🌈', '⭐', '🐰', '💖'],
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        score: 0,
        time: 0,
        timerId: null,
        isLocked: false
    },

    initGame1() {
        this.g1.matchedPairs = 0;
        this.g1.moves = 0;
        this.g1.score = 0;
        this.g1.time = 0;
        this.g1.flippedCards = [];
        this.g1.isLocked = false;
        
        const overlay = document.getElementById('g1-overlay');
        overlay.classList.add('hidden');
        overlay.classList.remove('pop-out');
        this.updateG1UI();

        clearInterval(this.g1.timerId);
        this.g1.timerId = setInterval(() => {
            this.g1.time++;
            document.getElementById('g1-time').textContent = this.g1.time;
        }, 1000);

        this.setupMemoryBoard();
    },

    setupMemoryBoard() {
        const board = document.getElementById('g1-memory-board');
        board.innerHTML = '';
        
        let deck = [...this.g1.icons, ...this.g1.icons];
        deck.sort(() => Math.random() - 0.5);
        this.g1.cards = deck;

        deck.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card pop-out';
            card.style.animationDelay = `${index * 0.05}s`;
            card.dataset.icon = icon;
            
            const front = document.createElement('div');
            front.className = 'memory-card-front';
            front.textContent = icon;
            
            const back = document.createElement('div');
            back.className = 'memory-card-back';
            
            card.appendChild(front);
            card.appendChild(back);
            
            card.onclick = () => this.flipMemoryCard(card);
            board.appendChild(card);
            
            // Remove pop-out so animation forwards doesn't lock transform
            setTimeout(() => {
                if(card.parentNode) {
                    card.classList.remove('pop-out');
                    card.style.animationDelay = '0s';
                }
            }, 1000 + index * 50);
        });
    },

    flipMemoryCard(card) {
        if (this.g1.isLocked) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        this.g1.flippedCards.push(card);

        if (this.g1.flippedCards.length === 2) {
            this.g1.moves++;
            this.checkMemoryMatch();
        }
    },

    checkMemoryMatch() {
        this.g1.isLocked = true;
        const [card1, card2] = this.g1.flippedCards;
        const match = card1.dataset.icon === card2.dataset.icon;

        if (match) {
            this.g1.matchedPairs++;
            this.g1.score += Math.max(10, 50 - this.g1.time); // Time bonus
            this.updateG1UI();
            
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.g1.flippedCards = [];
                this.g1.isLocked = false;
                
                animations.triggerFireworks(true); // Sparkle effect
                
                if (this.g1.matchedPairs === this.g1.icons.length) {
                    this.completeMemoryGame();
                }
            }, 600);
        } else {
            setTimeout(() => {
                card1.classList.add('shake-flipped');
                card2.classList.add('shake-flipped');
                setTimeout(() => {
                    card1.classList.remove('flipped', 'shake-flipped');
                    card2.classList.remove('flipped', 'shake-flipped');
                    this.g1.flippedCards = [];
                    this.g1.isLocked = false;
                }, 400);
            }, 700);
        }
        this.updateG1UI();
    },

    updateG1UI() {
        document.getElementById('g1-moves').textContent = this.g1.moves;
        document.getElementById('g1-score').textContent = this.g1.score;
        document.getElementById('g1-time').textContent = this.g1.time;
    },

    completeMemoryGame() {
        clearInterval(this.g1.timerId);
        document.getElementById('res-score').textContent = this.g1.score;
        document.getElementById('g1-final-score').textContent = this.g1.score;
        
        setTimeout(() => {
            const overlay = document.getElementById('g1-overlay');
            overlay.classList.remove('hidden');
            overlay.classList.add('pop-out');
            animations.triggerFireworks(true);
        }, 1000);
    },

    // -----------------------------------------
    // GAME 2: JAPAN JOURNEY QUIZ
    // -----------------------------------------
    g2: {
        stage: 0,
        stages: [
            { pos: 10, q: "Are you ready to start your journey?", opts: ["Yes! 🌸", "No", "Maybe"], ans: 0 },
            { pos: 40, q: "What does 'こんにちは' (Konnichiwa) mean?", opts: ["Thank you", "Hello", "Goodbye"], ans: 1 },
            { pos: 70, q: "Which word means 'Friend'?", opts: ["Tomodachi", "Sensei", "Sakura"], ans: 0 },
            { pos: 100, q: "Final Step! Keep doing your best!", opts: ["I will! 🗻"], ans: 0 }
        ]
    },

    initGame2() {
        this.g2.stage = 0;
        document.getElementById('player-avatar').style.left = '10%';
        const mapProgress = document.getElementById('map-progress');
        if (mapProgress) mapProgress.style.width = '10%';
        
        document.getElementById('g2-overlay').classList.add('hidden');
        this.loadG2Stage();
    },

    loadG2Stage() {
        if (this.g2.stage >= this.g2.stages.length) {
            this.endG2();
            return;
        }
        const stageData = this.g2.stages[this.g2.stage];
        document.getElementById('g2-question').textContent = stageData.q;
        
        const optsContainer = document.getElementById('g2-options');
        optsContainer.innerHTML = '';
        stageData.opts.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'glass-btn game-btn pop-out';
            btn.style.animationDelay = `${idx * 0.1}s`;
            btn.textContent = opt;
            btn.onclick = () => this.checkG2Answer(idx, stageData.ans, btn);
            optsContainer.appendChild(btn);
        });
    },

    checkG2Answer(selected, correct, btn) {
        // Disable other buttons
        const allBtns = document.getElementById('g2-options').querySelectorAll('button');
        allBtns.forEach(b => b.style.pointerEvents = 'none');

        if (selected === correct) {
            btn.classList.add('correct-flash');
            this.g2.stage++;
            
            // Move Avatar and Progress Bar
            const nextPos = this.g2.stage < this.g2.stages.length ? this.g2.stages[this.g2.stage].pos : 100;
            document.getElementById('player-avatar').style.left = nextPos + '%';
            const mapProgress = document.getElementById('map-progress');
            if (mapProgress) mapProgress.style.width = nextPos + '%';
            
            setTimeout(() => this.loadG2Stage(), 1200);
        } else {
            btn.classList.add('wrong-flash');
            const quizBox = document.getElementById('quiz-box');
            quizBox.classList.add('shake');
            setTimeout(() => {
                quizBox.classList.remove('shake');
                btn.classList.remove('wrong-flash');
                allBtns.forEach(b => b.style.pointerEvents = 'all');
            }, 500);
        }
    },

    endG2() {
        const overlay = document.getElementById('g2-overlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('pop-out');
        animations.triggerFireworks(true);
    }
};
