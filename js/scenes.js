const scenes = {
    storyLines: [
        { jp: "日本語の勉強、がんばってね 🇯🇵", en: "Keep doing your best studying Japanese 🇯🇵" },
        { jp: "新しい言葉を学ぶのは\nすばらしい旅です ✨", en: "Learning new words\nis a wonderful journey ✨" },
        { jp: "これからも、楽しく学んでください 🌸", en: "Please continue to enjoy learning 🌸" }
    ],
    storyIndex: 0,
    isTyping: false,

    startStory() {
        this.storyIndex = 0;
        document.getElementById('story-next-btn').classList.add('hidden');
        document.getElementById('story-text').innerHTML = '';
        setTimeout(() => this.typeStory(), 500);
    },

    nextStory() {
        if (this.isTyping) return;
        this.storyIndex++;
        if (this.storyIndex < this.storyLines.length) {
            this.typeStory();
        } else {
            app.goToPage(3);
        }
    },

    async typeStory() {
        this.isTyping = true;
        const textEl = document.getElementById('story-text');
        const btn = document.getElementById('story-next-btn');
        btn.classList.add('hidden');
        textEl.innerHTML = '';
        
        const lineData = this.storyLines[this.storyIndex];
        const line = app.currentLanguage === 'en' ? lineData.en : lineData.jp;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '\n') {
                textEl.innerHTML += '<br>';
            } else {
                textEl.innerHTML += line[i];
            }
            await new Promise(r => setTimeout(r, 45));
        }
        
        this.isTyping = false;
        btn.classList.remove('hidden');
    },

    // ----------------------------------------------------
    // FINAL SCENE
    // ----------------------------------------------------
    finalLines: [
        {
            jp: "夢がかないますように ✨",
            en: "May your dreams come true ✨",
            ro: "(Yume ga kanaimasu you ni)"
        },
        {
            jp: "日本語の勉強、がんばってね 🇯🇵",
            en: "Keep doing your best studying Japanese 🇯🇵",
            ro: "(Nihongo no benkyou, ganbatte ne)"
        },
        {
            jp: "いつも応援しています 🌸",
            en: "I am always cheering for you 🌸",
            ro: "(Itsumo ouen shiteimasu)"
        }
    ],
    finalIndex: 0,
    
    startFinalScene() {
        const card = document.getElementById('final-message-card');
        const container = document.getElementById('final-text-container');
        
        if (!container || !card) return;
        container.innerHTML = '';
        this.finalIndex = 0;
        
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        
        setTimeout(() => this.typeFinalLine(), 800);
    },
    
    typeFinalLine() {
        if (this.finalIndex >= this.finalLines.length) {
            setTimeout(() => {
                animations.triggerFireworks(false);
            }, 1000);
            return;
        }
        
        const lineData = this.finalLines[this.finalIndex];
        const container = document.getElementById('final-text-container');
        
        const block = document.createElement('div');
        block.style.display = 'flex';
        block.style.flexDirection = 'column';
        block.style.gap = '5px';
        block.style.marginBottom = '20px';
        block.style.opacity = '1'; 
        
        const jpEl = document.createElement('h3');
        jpEl.className = 'jp-text glow-text';
        jpEl.style.color = 'var(--primary)';
        jpEl.style.fontSize = '1.4rem';
        
        const roEl = document.createElement('p');
        roEl.style.fontSize = '0.95rem';
        roEl.style.opacity = '0';
        roEl.style.transition = 'opacity 1s ease';
        roEl.style.color = '#e2e2e2';
        roEl.textContent = lineData.ro;
        
        block.appendChild(jpEl);
        block.appendChild(roEl);
        container.appendChild(block);
        
        let charIdx = 0;
        const currentLineStr = app.currentLanguage === 'en' ? lineData.en : lineData.jp;
        
        const typeInterval = setInterval(() => {
            jpEl.textContent += currentLineStr.charAt(charIdx);
            charIdx++;
            if (charIdx >= currentLineStr.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    roEl.style.opacity = '0.8';
                    // Removed mmEl fade in
                    
                    this.finalIndex++;
                    setTimeout(() => this.typeFinalLine(), 2500); 
                }, 600);
            }
        }, 120);
    }
};
