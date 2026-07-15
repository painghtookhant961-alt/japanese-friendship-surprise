const animations = {
    initIntroHeart() {
        const container = document.getElementById('heart-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 150;
        
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Particle Heart Generation - Premium recognizable shape
        const particleCount = 4500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const pink = new THREE.Color(0xffb7c5);
        const magenta = new THREE.Color(0xff8fa3);
        const white = new THREE.Color(0xffffff);
        
        for (let i = 0; i < particleCount; i++) {
            let t = Math.random() * Math.PI * 2;
            
            // 2D Parametric Heart Formula
            let hx = 16 * Math.pow(Math.sin(t), 3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            
            hx *= 0.12;
            hy *= 0.12;
            
            let angle = Math.random() * Math.PI * 2;
            let radius = Math.random() * 0.4;
            
            // Scatter some particles inside to give beautiful 3D volume, but preserve empty space
            if (Math.random() > 0.6) {
                let inner = Math.random();
                hx *= inner;
                hy *= inner;
                radius = Math.random() * 1.5;
            }
            
            let x = hx + Math.cos(angle) * radius;
            let y = hy + Math.sin(angle) * radius;
            let z = (Math.random() - 0.5) * 3.0; // Depth effect
            
            positions[i*3] = x * 15;
            positions[i*3+1] = y * 15;
            positions[i*3+2] = z * 15;
            
            let c = Math.random() > 0.4 ? pink.clone() : magenta.clone();
            if (Math.random() > 0.85) c = white.clone();
            
            colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
            sizes[i] = Math.random() * 2.0 + 1.0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Generate a glowing soft particle texture via Canvas for neon glow
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 64; texCanvas.height = 64;
        const ctxTex = texCanvas.getContext('2d');
        const grad = ctxTex.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.2, 'rgba(255, 183, 197, 1)');
        grad.addColorStop(0.6, 'rgba(255, 143, 163, 0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctxTex.fillStyle = grad;
        ctxTex.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(texCanvas);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: tex }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (250.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, texColor.a) * texColor;
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });
        
        const heartSystem = new THREE.Points(geometry, material);
        heartSystem.scale.set(0.01, 0.01, 0.01);
        heartSystem.position.y = 12; // Move heart UP to leave space for text below!
        scene.add(heartSystem);

        let clock = new THREE.Clock();
        let formationTime = 0;
        let isFormed = false;

        function animate() {
            requestAnimationFrame(animate);
            let dt = clock.getDelta();
            let elapsed = clock.getElapsedTime();
            
            // Formation scale up
            if (formationTime < 1.0) {
                formationTime += dt * 0.4;
                let scale = Math.min(1.0, formationTime);
                scale = 1 - Math.pow(1 - scale, 3); // Cubic ease out
                heartSystem.scale.set(scale, scale, scale);
            } else {
                if (!isFormed) {
                    isFormed = true;
                    const introBox = document.getElementById('intro-texts');
                    introBox.classList.remove('hidden');
                    introBox.classList.add('pop-out');
                }
                
                // Slow, smooth cinematic heartbeat pulse
                let t = elapsed % 2.0;
                let pulse = 1.0 + Math.exp(-20.0 * Math.pow(t - 0.2, 2)) * 0.05 + Math.exp(-20.0 * Math.pow(t - 0.6, 2)) * 0.05;
                heartSystem.scale.set(pulse, pulse, pulse);
            }
            
            // Cinematic rotation and depth
            heartSystem.rotation.y = Math.sin(elapsed * 0.3) * 0.3; // Gentle sway
            heartSystem.rotation.x = Math.sin(elapsed * 0.5) * 0.1;
            
            renderer.render(scene, camera);
        }
        animate();
        
        // Start Ambient falling Sakura flowers
        this.initAmbientSakura();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },

    initAmbientSakura() {
        const canvas = document.getElementById('ambient-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let width, height;
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        resize();
        window.addEventListener('resize', resize);
        
        const petals = [];
        for (let i = 0; i < 40; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height,
                s: Math.random() * 2.5 + 2.0, // Size
                dx: Math.random() * 1.5 - 0.75, // Wind X
                dy: Math.random() * 1.5 + 1.0, // Gravity Y
                a: Math.random() * Math.PI * 2, // Base rotation
                da: (Math.random() - 0.5) * 0.05, // Spin speed
                flip: Math.random() * Math.PI * 2, // 3D flip angle
                dFlip: (Math.random() * 0.05) + 0.02, // 3D flip speed
                type: Math.random() > 0.8 ? 'flower' : 'petal' // Some full flowers, some individual petals
            });
        }
        
        function render() {
            ctx.clearRect(0, 0, width, height);
            
            petals.forEach(p => {
                // Natural wind and falling physics
                p.x += p.dx + Math.sin(p.y * 0.01) * 1.5; 
                p.y += p.dy;
                p.a += p.da;
                p.flip += p.dFlip;
                
                // Screen wrap
                if (p.y > height + 40) { p.y = -40; p.x = Math.random() * width; }
                if (p.x > width + 40) p.x = -40;
                if (p.x < -40) p.x = width + 40;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.a);
                // 3D rotation illusion on 2D canvas
                ctx.scale(Math.max(0.2, Math.abs(Math.sin(p.flip))), 1); 
                
                if (p.type === 'flower') {
                    ctx.fillStyle = 'rgba(255, 183, 197, 0.85)';
                    // Draw 5-petal Sakura Flower
                    for(let i=0; i<5; i++) {
                        ctx.rotate((Math.PI * 2) / 5);
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(p.s*2, p.s, p.s*1.2, p.s*3.5);
                        ctx.lineTo(0, p.s*2.5); // Cleft
                        ctx.lineTo(-p.s*1.2, p.s*3.5);
                        ctx.quadraticCurveTo(-p.s*2, p.s, 0, 0);
                        ctx.fill();
                    }
                    // Flower center
                    ctx.fillStyle = 'rgba(255, 100, 150, 0.9)';
                    ctx.beginPath();
                    ctx.arc(0, 0, p.s * 0.6, 0, Math.PI*2);
                    ctx.fill();
                } else {
                    // Draw beautiful single Sakura cleft-petal
                    ctx.fillStyle = 'rgba(255, 183, 197, 0.9)';
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(p.s*2.5, p.s*1.5, p.s*1.5, p.s*4);
                    ctx.lineTo(0, p.s*3); // Cleft
                    ctx.lineTo(-p.s*1.5, p.s*4);
                    ctx.quadraticCurveTo(-p.s*2.5, p.s*1.5, 0, 0);
                    ctx.fill();
                }
                ctx.restore();
            });
            requestAnimationFrame(render);
        }
        render();
    },

    triggerFireworks(isMiniGame = false) {
        const container = isMiniGame ? document.getElementById('page-game-2') : document.getElementById('page-6');
        if (!container) return;
        
        const colors = ['#ffb7c5', '#fff', '#ffd700', '#ff8fa3', '#a0c4ff'];
        
        for (let i = 0; i < 50; i++) {
            let f = document.createElement('div');
            f.style.position = 'absolute';
            f.style.left = '50%';
            f.style.top = '50%';
            f.style.width = '8px';
            f.style.height = '8px';
            f.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
            f.style.borderRadius = '50%';
            f.style.zIndex = '100';
            f.style.boxShadow = `0 0 10px ${f.style.backgroundColor}`;
            
            let angle = Math.random() * Math.PI * 2;
            let dist = Math.random() * 250 + 50;
            let tx = Math.cos(angle) * dist;
            let ty = Math.sin(angle) * dist;
            
            f.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 800,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                fill: 'forwards'
            });
            
            container.appendChild(f);
            setTimeout(() => { if (f.parentNode) f.remove(); }, 2000);
        }
    }
};
