/**
 * SciTech Kids - Lógica e Interactividad Principal
 * Desarrollado con Javascript Puro (ES6+) y la API de Audio Web
 */

document.addEventListener('DOMContentLoaded', () => {
    // SYSTEM STATE
    const state = {
        currentTheme: 'dark',
        score: 0,
        gameActive: false,
        gameTimer: null,
        gameTimeLeft: 45,
        quizIndex: 0,
        matterInterval: null,
        soundEnabled: true
    };

    // DOM ELEMENTS
    const body = document.body;
    const btnThemeToggle = document.getElementById('theme-toggle-btn');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewAppContainer = document.getElementById('view-app-container');
    const appViewportContent = document.getElementById('app-viewport-content');
    const btnBackToDashboard = document.getElementById('btn-back-to-dashboard');
    const btnHomeLogo = document.getElementById('btn-home-logo');
    const appTagLabel = document.getElementById('app-tag-label');
    const appTitleLabel = document.getElementById('app-title-label');

    // 1. SOUND SYNTHESIZER (Web Audio API)
    let audioCtx = null;
    
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        try {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } 
            else if (type === 'success') {
                // Sparkling major chord
                osc.type = 'triangle';
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                
                // Arpeggio
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
                osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
                
                osc.start(now);
                osc.stop(now + 0.4);
            } 
            else if (type === 'fail') {
                // Descending error sound
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(70, now + 0.3);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            }
            else if (type === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            }
            else if (type === 'gameover') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(120, now + 0.6);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
            }
        } catch (e) {
            console.log('Audio is not supported or was blocked by browser autoplay policies.', e);
        }
    }

    // 2. THEME SWITCHER
    btnThemeToggle.addEventListener('click', () => {
        playSound('click');
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            state.currentTheme = 'light';
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            state.currentTheme = 'dark';
        }
    });

    // 3. SPA ROUTER (Navegación dinámica)
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        card.addEventListener('click', () => {
            const appName = card.getAttribute('data-app');
            openApp(appName);
        });
    });

    function openApp(appName) {
        playSound('click');
        
        // Esconder todos los contenidos de sub-apps
        document.querySelectorAll('.subapp-content').forEach(sub => {
            sub.classList.remove('active');
        });

        // Configurar meta datos y activar sub-app
        let tag = '';
        let title = '';
        let subAppElement = null;

        switch (appName) {
            case 'solar-system':
                tag = 'Astronomía 🪐';
                title = 'Viaje por el Sistema Solar';
                subAppElement = document.getElementById('subapp-solar-system');
                initSolarQuiz();
                break;
            case 'matter-lab':
                tag = 'Química y Física 🧪';
                title = 'Laboratorio de la Materia';
                subAppElement = document.getElementById('subapp-matter-lab');
                initMatterLab();
                break;
            case 'recycling-game':
                tag = 'Ecología y Tecnología ♻️';
                title = 'Eco-Clasificador';
                subAppElement = document.getElementById('subapp-recycling-game');
                initRecyclingGame();
                break;
            case 'human-body':
                tag = 'Biología Humana 🫁';
                title = 'Explorador del Cuerpo';
                subAppElement = document.getElementById('subapp-human-body');
                initHumanBodyApp();
                break;
        }

        if (subAppElement) {
            appTagLabel.innerText = tag;
            appTitleLabel.innerText = title;
            
            viewDashboard.classList.remove('active');
            viewAppContainer.classList.add('active');
            subAppElement.classList.add('active');
            
            // Scroll a la parte superior
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function closeActiveApp() {
        playSound('click');
        
        // Detener simulaciones / juegos en curso
        stopMatterSimulation();
        stopRecyclingGame();

        viewAppContainer.classList.remove('active');
        viewDashboard.classList.add('active');
    }

    btnBackToDashboard.addEventListener('click', closeActiveApp);
    btnHomeLogo.addEventListener('click', closeActiveApp);

    // ==========================================================================
    // MINI-APP 1: VIAJE POR EL SISTEMA SOLAR - Lógica
    // ==========================================================================
    const planetData = {
        mercurio: {
            nombre: 'Mercurio',
            icono: '🪨',
            color: '#a1a1a1',
            distancia: '58 millones de km',
            temperatura: '-180°C a 430°C',
            lunas: '0 lunas',
            hecho: '¡Es el planeta más cercano al Sol! Aunque está cerca, no es el más caliente porque no tiene atmósfera que atrape el calor.'
        },
        venus: {
            nombre: 'Venus',
            icono: '🪐',
            color: '#e3bb76',
            distancia: '108 millones de km',
            temperatura: '460°C (¡Muy caliente!)',
            lunas: '0 lunas',
            hecho: 'Venus es el planeta más caliente de todos. Gira en sentido contrario a la mayoría de los planetas, ¡el Sol allí sale por el oeste!'
        },
        tierra: {
            nombre: 'Tierra',
            icono: '🌍',
            color: '#3b82f6',
            distancia: '150 millones de km',
            temperatura: '15°C (Promedio)',
            lunas: '1 luna (La Luna 🌙)',
            hecho: 'Es nuestro hogar y el único planeta conocido que tiene agua líquida y vida. El 70% de su superficie está cubierta por océanos.'
        },
        marte: {
            nombre: 'Marte',
            icono: '🔴',
            color: '#ef4444',
            distancia: '228 millones de km',
            temperatura: '-60°C',
            lunas: '2 lunas pequeñas',
            hecho: 'Le llamamos el "Planeta Rojo" por el óxido de hierro en su suelo. ¡Tiene el volcán más grande de todo el sistema solar: el Monte Olimpo!'
        },
        jupiter: {
            nombre: 'Júpiter',
            icono: '🪐',
            color: '#d4a373',
            distancia: '778 millones de km',
            temperatura: '-110°C',
            lunas: '¡Más de 90 lunas!',
            hecho: 'Es un gigante de gas y el planeta más grande de todos (¡cabrían 1,300 Tierras dentro!). Tiene una tormenta gigante llamada la Gran Mancha Roja.'
        }
    };

    const planetsElements = document.querySelectorAll('.planet');
    const planetDetailsContainer = document.getElementById('solar-planet-details');

    planetsElements.forEach(p => {
        p.addEventListener('click', (e) => {
            e.stopPropagation();
            const pId = p.getAttribute('data-planet');
            const data = planetData[pId];
            if (data) {
                displayPlanetDetails(data);
            }
        });
    });

    function displayPlanetDetails(data) {
        playSound('beep');
        planetDetailsContainer.innerHTML = `
            <div class="planet-detail-card">
                <div class="planet-detail-header">
                    <span style="font-size: 3rem; filter: drop-shadow(0 0 10px ${data.color})">${data.icono}</span>
                    <h3 class="planet-detail-title">${data.nombre}</h3>
                </div>
                <div class="planet-info-grid">
                    <div class="planet-info-item">
                        <strong>Distancia al Sol</strong>
                        <span>${data.distancia}</span>
                    </div>
                    <div class="planet-info-item">
                        <strong>Temperatura</strong>
                        <span>${data.temperatura}</span>
                    </div>
                    <div class="planet-info-item" style="grid-column: span 2">
                        <strong>Satélites</strong>
                        <span>${data.lunas}</span>
                    </div>
                </div>
                <div class="planet-description">
                    <strong>💡 Dato Espacial:</strong> ${data.hecho}
                </div>
            </div>
        `;
    }

    // TRIVIA INTERACTIVA DEL ESPACIO
    const spaceTrivia = [
        {
            q: '¿Cuál es el planeta más caliente de nuestro Sistema Solar?',
            a: ['Mercurio', 'Venus', 'Tierra'],
            correct: 1, // Venus
            fact: '¡Correcto! Venus tiene una densa capa de nubes ácidas que atrapan el calor como un invernadero.'
        },
        {
            q: '¿Qué planeta es conocido como el "Planeta Rojo"?',
            a: ['Marte', 'Júpiter', 'Mercurio'],
            correct: 0, // Marte
            fact: '¡Excelente! Marte tiene suelo rojizo debido al óxido de hierro (óxido).'
        },
        {
            q: '¿Cuál es la estrella central de nuestro sistema orbital?',
            a: ['La Luna', 'El Sol', 'Sirio'],
            correct: 1, // El Sol
            fact: '¡Gran trabajo! El Sol contiene el 99.8% de toda la masa de nuestro Sistema Solar.'
        },
        {
            q: '¿Cuántas lunas (satélites) tiene el planeta Tierra?',
            a: ['Ninguna', 'Dos', 'Una'],
            correct: 2, // Una
            fact: '¡Exacto! Nuestra única luna tarda unos 28 días en orbitar la Tierra por completo.'
        }
    ];

    function initSolarQuiz() {
        state.quizIndex = Math.floor(Math.random() * spaceTrivia.length);
        loadQuizQuestion();
    }

    function loadQuizQuestion() {
        const quiz = spaceTrivia[state.quizIndex];
        const qEl = document.getElementById('quiz-question');
        const feedbackEl = document.getElementById('quiz-feedback');
        
        qEl.innerText = quiz.q;
        feedbackEl.innerText = '';
        feedbackEl.className = 'quiz-feedback-text';

        const optionsContainer = document.querySelector('.quiz-options');
        optionsContainer.innerHTML = '';

        quiz.a.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz-option';
            btn.innerText = opt;
            btn.addEventListener('click', () => {
                // Deshabilitar otros clicks
                const allButtons = optionsContainer.querySelectorAll('.btn-quiz-option');
                allButtons.forEach(b => b.disabled = true);

                if (idx === quiz.correct) {
                    btn.classList.add('correct');
                    feedbackEl.innerText = quiz.fact;
                    feedbackEl.classList.add('correct');
                    playSound('success');
                    
                    // Siguiente pregunta después de 4.5 segundos
                    setTimeout(() => {
                        state.quizIndex = (state.quizIndex + 1) % spaceTrivia.length;
                        loadQuizQuestion();
                    }, 4500);
                } else {
                    btn.classList.add('incorrect');
                    feedbackEl.innerText = '❌ Inténtalo de nuevo. ¡El espacio está lleno de misterios!';
                    feedbackEl.classList.add('incorrect');
                    playSound('fail');

                    // Habilitar de nuevo para que intente
                    setTimeout(() => {
                        allButtons.forEach(b => {
                            b.disabled = false;
                            b.classList.remove('incorrect');
                        });
                        feedbackEl.innerText = '';
                    }, 2000);
                }
            });
            optionsContainer.appendChild(btn);
        });
    }


    // ==========================================================================
    // MINI-APP 2: LABORATORIO DE LA MATERIA - Lógica
    // ==========================================================================
    let matterCanvas = null;
    let matterCtx = null;
    let particles = [];
    const maxParticles = 65;

    class Molecule {
        constructor(width, height) {
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.radius = 8;
            this.reset();
        }

        reset() {
            this.x = Math.random() * (this.canvasWidth - 30) + 15;
            this.y = Math.random() * (this.canvasHeight - 60) + 30;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
        }

        update(temp) {
            // Adaptar comportamiento al estado
            let speedMultiplier = 1;

            if (temp <= 0) {
                // SÓLIDO: Vibración en una red cristalina
                if (!this.baseX) {
                    this.baseX = this.x;
                    this.baseY = Math.max(this.y, this.canvasHeight - 120);
                }
                // Menor vibración a menor temperatura
                const amp = Math.max(0.5, (temp + 50) / 10); 
                this.x = this.baseX + (Math.sin(Date.now() * 0.05 + this.radius) * amp * 0.5);
                this.y = this.baseY + (Math.cos(Date.now() * 0.05 + this.radius) * amp * 0.5);
                return;
            } else {
                // Limpiar coordenadas fijas de sólido si pasa a líquido/gas
                this.baseX = null;
                this.baseY = null;
            }

            if (temp > 0 && temp < 100) {
                // LÍQUIDO: Fluyen abajo, chocando lentamente
                speedMultiplier = 1 + (temp / 35);
                
                // Gravedad suave para mantenerlas abajo en el vaso
                this.vy += 0.15;
                
                this.x += this.vx * speedMultiplier;
                this.y += this.vy * speedMultiplier;

                // Límites inferiores y rebotes
                const bottomLimit = this.canvasHeight - 20;
                const waterLevel = this.canvasHeight - 150; // Nivel de líquido

                if (this.y > bottomLimit - this.radius) {
                    this.y = bottomLimit - this.radius;
                    this.vy *= -0.4; // Rebote suave amortiguado
                }
                if (this.y < waterLevel) {
                    // Si sale flotando, rebota hacia abajo
                    this.y = waterLevel;
                    this.vy *= -0.5;
                }
            } 
            else if (temp >= 100) {
                // GASEOSO: Gran energía, rebotando por todo el espacio libre
                speedMultiplier = 4 + ((temp - 100) / 10);
                this.x += this.vx * speedMultiplier;
                this.y += this.vy * speedMultiplier;

                // Colisiones elásticas contra toda la botella
                const bottomLimit = this.canvasHeight - 20;
                if (this.y > bottomLimit - this.radius) {
                    this.y = bottomLimit - this.radius;
                    this.vy *= -1;
                }
                if (this.y < this.radius + 15) {
                    this.y = this.radius + 15;
                    this.vy *= -1;
                }
            }

            // Paredes laterales
            const leftLimit = 20;
            const rightLimit = this.canvasWidth - 20;
            if (this.x < leftLimit + this.radius) {
                this.x = leftLimit + this.radius;
                this.vx *= -1;
            }
            if (this.x > rightLimit - this.radius) {
                this.x = rightLimit - this.radius;
                this.vx *= -1;
            }
        }

        draw(ctx, temp) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            // Color según la temperatura y estado
            let fill = 'rgba(56, 189, 248, 0.7)'; // Celeste Líquido
            let stroke = '#0284c7';

            if (temp <= 0) {
                fill = 'rgba(186, 230, 253, 0.8)'; // Blanco Hielo Sólido
                stroke = '#bae6fd';
            } else if (temp >= 100) {
                fill = 'rgba(244, 63, 94, 0.4)'; // Rojo Vapor Gas
                stroke = '#f43f5e';
            }

            ctx.fillStyle = fill;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();

            // Dibujar pequeños puentes de hidrógeno virtuales entre moléculas en estado Sólido
            if (temp <= 0 && Math.random() < 0.05) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + (Math.random() - 0.5) * 30, this.y + (Math.random() - 0.5) * 30);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    const tempSlider = document.getElementById('range-temperature');
    const txtTemperature = document.getElementById('txt-temperature');
    const lblMatterState = document.getElementById('lbl-matter-state');
    const lblMatterExplanation = document.getElementById('lbl-matter-explanation');
    const burnerFlame = document.getElementById('flame-element');

    tempSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        updateMatterStateUI(val);
    });

    const presetButtons = document.querySelectorAll('.btn-state-preset');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tempVal = parseInt(btn.getAttribute('data-temp'));
            tempSlider.value = tempVal;
            updateMatterStateUI(tempVal);
        });
    });

    function updateMatterStateUI(temp) {
        txtTemperature.innerText = temp;
        
        // Cambiar color de la temperatura
        if (temp <= 0) {
            txtTemperature.style.background = 'linear-gradient(135deg, #3b82f6, #60a5fa)';
            txtTemperature.style.webkitBackgroundClip = 'text';
            lblMatterState.innerText = 'Sólido (Hielo) ❄️';
            lblMatterState.style.color = '#60a5fa';
            lblMatterState.style.borderColor = '#60a5fa';
            lblMatterExplanation.innerHTML = 'En el estado <strong>Sólido</strong>, las moléculas de agua están fuertemente unidas en una red ordenada. Solo vibran un poquito en su lugar y tienen volumen y forma fijos.';
            
            // Flama apagada
            burnerFlame.style.opacity = '0.05';
            burnerFlame.style.transform = 'scale(0.3)';
        } 
        else if (temp > 0 && temp < 100) {
            txtTemperature.style.background = 'linear-gradient(135deg, #06b6d4, #3b82f6)';
            txtTemperature.style.webkitBackgroundClip = 'text';
            lblMatterState.innerText = 'Líquido (Agua) 💧';
            lblMatterState.style.color = '#06b6d4';
            lblMatterState.style.borderColor = '#06b6d4';
            lblMatterExplanation.innerHTML = 'En el estado <strong>Líquido</strong>, las moléculas de agua están juntas pero se mueven y resbalan unas sobre otras. Tienen volumen fijo pero toman la forma del recipiente.';
            
            // Flama templada
            const flameIntensity = (temp / 100);
            burnerFlame.style.opacity = 0.15 + (flameIntensity * 0.35);
            burnerFlame.style.transform = `scale(${0.5 + (flameIntensity * 0.4)})`;
        } 
        else {
            txtTemperature.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
            txtTemperature.style.webkitBackgroundClip = 'text';
            lblMatterState.innerText = 'Gaseoso (Vapor) 💨';
            lblMatterState.style.color = '#f59e0b';
            lblMatterState.style.borderColor = '#f59e0b';
            lblMatterExplanation.innerHTML = 'En el estado <strong>Gaseoso</strong>, las moléculas tienen tanta energía que vencen toda atracción entre ellas. Vuelan libres a gran velocidad y se expanden por todo el espacio disponible.';
            
            // Flama al máximo
            burnerFlame.style.opacity = '0.85';
            burnerFlame.style.transform = 'scale(1.35)';
        }
    }

    function initMatterLab() {
        matterCanvas = document.getElementById('matter-canvas');
        matterCtx = matterCanvas.getContext('2d');
        
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Molecule(matterCanvas.width, matterCanvas.height));
        }

        // Activar loop de animación a 60fps
        if (state.matterInterval) clearInterval(state.matterInterval);
        
        function drawFrame() {
            if (!document.getElementById('subapp-matter-lab').classList.contains('active')) return;
            
            const tempVal = parseInt(tempSlider.value);
            
            matterCtx.clearRect(0, 0, matterCanvas.width, matterCanvas.height);
            
            // Dibujar fondo de calor en canvas si la temp es muy alta
            if (tempVal > 100) {
                const heatGlow = matterCtx.createLinearGradient(0, matterCanvas.height, 0, 0);
                heatGlow.addColorStop(0, 'rgba(239, 68, 68, 0.08)');
                heatGlow.addColorStop(1, 'transparent');
                matterCtx.fillStyle = heatGlow;
                matterCtx.fillRect(0, 0, matterCanvas.width, matterCanvas.height);
            }

            particles.forEach(p => {
                p.update(tempVal);
                p.draw(matterCtx, tempVal);
            });

            requestAnimationFrame(drawFrame);
        }

        requestAnimationFrame(drawFrame);
        updateMatterStateUI(parseInt(tempSlider.value));
    }

    function stopMatterSimulation() {
        particles = [];
    }


    // ==========================================================================
    // MINI-APP 3: ECO-CLASIFICADOR (Juego de Reciclaje) - Lógica
    // ==========================================================================
    const wasteDatabase = [
        { name: 'Manzana mordida', icon: '🍎', bin: 'organic', sound: 'organic' },
        { name: 'Cáscara de Plátano', icon: '🍌', bin: 'organic', sound: 'organic' },
        { name: 'Hueso de pollo', icon: '🍗', bin: 'organic', sound: 'organic' },
        { name: 'Bolsa de Plástico', icon: '🛍️', bin: 'plastic', sound: 'plastic' },
        { name: 'Botella de refresco', icon: '🍾', bin: 'plastic', sound: 'plastic' },
        { name: 'Lata de refresco', icon: '🥤', bin: 'plastic', sound: 'plastic' },
        { name: 'Caja de cartón', icon: '📦', bin: 'paper', sound: 'paper' },
        { name: 'Periódico viejo', icon: '📰', bin: 'paper', sound: 'paper' },
        { name: 'Cuaderno roto', icon: '📚', bin: 'paper', sound: 'paper' }
    ];

    const btnStartGame = document.getElementById('btn-start-game');
    const scoreBoard = document.getElementById('game-score');
    const timerBoard = document.getElementById('game-timer-val');
    const wasteContainer = document.getElementById('waste-item-container');
    const gameOverlay = document.getElementById('game-overlay');
    const trashBins = document.querySelectorAll('.trash-bin');

    let currentWasteElement = null;
    let currentWasteData = null;

    btnStartGame.addEventListener('click', startGame);

    function startGame() {
        playSound('success');
        state.score = 0;
        state.gameTimeLeft = 45;
        state.gameActive = true;
        scoreBoard.innerText = state.score;
        timerBoard.innerText = state.gameTimeLeft;

        // Ocultar pantalla de intro
        gameOverlay.style.display = 'none';
        btnStartGame.innerText = '¡Reiniciar Juego! 🔄';

        if (state.gameTimer) clearInterval(state.gameTimer);
        
        state.gameTimer = setInterval(() => {
            state.gameTimeLeft--;
            timerBoard.innerText = state.gameTimeLeft;

            if (state.gameTimeLeft <= 0) {
                endGame();
            }
        }, 1000);

        spawnWasteItem();
    }

    function spawnWasteItem() {
        // Limpiar el contenedor excepto si hay un overlay
        const oldItems = wasteContainer.querySelectorAll('.waste-item');
        oldItems.forEach(i => i.remove());

        if (!state.gameActive) return;

        // Elegir desecho aleatorio
        const randIndex = Math.floor(Math.random() * wasteDatabase.length);
        const data = wasteDatabase[randIndex];
        currentWasteData = data;

        const wasteEl = document.createElement('div');
        wasteEl.className = 'waste-item';
        wasteEl.setAttribute('draggable', 'true');
        
        // Efecto visual al crearse
        wasteEl.style.left = 'calc(50% - 35px)';
        wasteEl.style.top = '25px';

        wasteEl.innerHTML = `
            <span class="waste-item-icon">${data.icon}</span>
            <span class="waste-item-label">${data.name}</span>
        `;

        // Añadir lógica de arrastrar (Drag and Drop nativo)
        wasteEl.addEventListener('dragstart', (e) => {
            if (!state.gameActive) return;
            e.dataTransfer.setData('text/plain', data.bin);
            wasteEl.style.opacity = '0.5';
        });

        wasteEl.addEventListener('dragend', () => {
            wasteEl.style.opacity = '1';
        });

        // Habilitar soporte táctil / clicks alternativos (para móviles o Chromebooks de primaria)
        wasteEl.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('beep');
            // Resaltar elemento seleccionado
            const allItems = wasteContainer.querySelectorAll('.waste-item');
            allItems.forEach(i => i.style.borderColor = 'var(--border-glass)');
            wasteEl.style.borderColor = 'var(--accent-primary)';
            wasteEl.classList.add('selected-touch');
        });

        wasteContainer.appendChild(wasteEl);
        currentWasteElement = wasteEl;
    }

    // Configurar zonas de soltar (Contenedores)
    trashBins.forEach(bin => {
        bin.addEventListener('dragover', (e) => {
            e.preventDefault();
            bin.classList.add('drag-over');
        });

        bin.addEventListener('dragleave', () => {
            bin.classList.remove('drag-over');
        });

        bin.addEventListener('drop', (e) => {
            e.preventDefault();
            bin.classList.remove('drag-over');
            const expectedBin = e.dataTransfer.getData('text/plain');
            const targetBin = bin.getAttribute('data-bin');

            evaluateRecycle(expectedBin, targetBin);
        });

        // Clicks alternativos en el contenedor para facilitar a niños de primaria
        bin.addEventListener('click', () => {
            if (!state.gameActive || !currentWasteElement) return;
            
            const expectedBin = currentWasteData.bin;
            const targetBin = bin.getAttribute('data-bin');

            evaluateRecycle(expectedBin, targetBin);
        });
    });

    function evaluateRecycle(expectedBin, targetBin) {
        if (!state.gameActive) return;

        if (expectedBin === targetBin) {
            // ¡Correcto!
            state.score += 10;
            scoreBoard.innerText = state.score;
            playSound('success');
            
            // Animación del contenedor que salta de alegría
            const binEl = document.querySelector(`.bin-${targetBin}`);
            binEl.style.transform = 'scale(1.15)';
            setTimeout(() => binEl.style.transform = 'scale(1)', 200);

            // Eliminar elemento con animación hacia el tacho
            if (currentWasteElement) {
                currentWasteElement.style.transform = 'scale(0) translateY(100px)';
                currentWasteElement.style.opacity = '0';
                setTimeout(() => {
                    spawnWasteItem();
                }, 300);
            }
        } else {
            // Incorrecto
            state.score = Math.max(0, state.score - 5);
            scoreBoard.innerText = state.score;
            playSound('fail');

            // Sacudir elemento incorrecto
            if (currentWasteElement) {
                currentWasteElement.style.transform = 'translateX(-20px)';
                setTimeout(() => currentWasteElement.style.transform = 'translateX(20px)', 80);
                setTimeout(() => currentWasteElement.style.transform = 'translateX(-10px)', 160);
                setTimeout(() => currentWasteElement.style.transform = 'translateX(10px)', 240);
                setTimeout(() => currentWasteElement.style.transform = 'translateX(0)', 320);
            }
        }
    }

    function endGame() {
        state.gameActive = false;
        clearInterval(state.gameTimer);
        playSound('gameover');

        // Mostrar resumen en overlay
        gameOverlay.style.display = 'flex';
        gameOverlay.innerHTML = `
            <h3>♻️ ¡Tiempo terminado!</h3>
            <p>Has hecho un increíble esfuerzo salvando el medio ambiente.</p>
            <h4 style="font-size: 2.2rem; color: var(--accent-success); margin: 1rem 0;">Puntuación final: ${state.score} puntos</h4>
            <button class="btn-game-action" id="btn-restart-game-over">¡Jugar otra vez! 🔄</button>
        `;

        // Volver a enlazar evento del nuevo botón
        document.getElementById('btn-restart-game-over').addEventListener('click', () => {
            // Re-instanciar pantalla original
            gameOverlay.innerHTML = `
                <h3>♻️ ¡Bienvenido al Eco-Clasificador!</h3>
                <p>Arrastra los desechos que aparecen en la cinta transportadora hacia el tacho correcto, o haz clic en el objeto y luego en el tacho para reciclar.</p>
                <p><strong>¡Consigue la mayor puntuación antes de que se acabe el tiempo!</strong></p>
            `;
            startGame();
        });
    }

    function stopRecyclingGame() {
        state.gameActive = false;
        clearInterval(state.gameTimer);
        const oldItems = wasteContainer.querySelectorAll('.waste-item');
        oldItems.forEach(i => i.remove());
        gameOverlay.style.display = 'flex';
        btnStartGame.innerText = '¡Empezar Juego! 🎮';
    }


    // ==========================================================================
    // MINI-APP 4: EXPLORADOR DEL CUERPO HUMANO - Lógica
    // ==========================================================================
    const organData = {
        cerebro: {
            nombre: 'El Cerebro',
            icono: '🧠',
            subtitle: 'Sistema Nervioso y Computadora Central',
            hecho: 'El cerebro es la computadora de tu cuerpo. Controla tus pensamientos, tu memoria, tus movimientos y todo lo que sientes. ¡Incluso trabaja mientras estás profundamente dormido!',
            curiosidad: 'El cerebro produce suficiente electricidad como para encender una pequeña bombilla de luz LED. ¡Y nunca descansa!'
        },
        pulmones: {
            nombre: 'Los Pulmones',
            icono: '🫁',
            subtitle: 'Sistema Respiratorio y Filtro de Aire',
            hecho: 'Los pulmones se encargan de recibir el oxígeno del aire que respiras y pasarlo a tu sangre. Luego expulsan el dióxido de carbono cuando exhalas.',
            curiosidad: 'Tu pulmón izquierdo es un poquito más pequeño que el derecho. ¿Por qué? ¡Para dejarle un espacio cómodo a tu corazón!'
        },
        corazon: {
            nombre: 'El Corazón',
            icono: '❤️',
            subtitle: 'Sistema Circulatorio y Motor de Vida',
            hecho: 'El corazón es un músculo especial que funciona como una bomba de agua. Envía sangre rica en nutrientes y oxígeno a todas las partes del cuerpo, desde la cabeza hasta los deditos de tus pies.',
            curiosidad: 'El corazón late unas 100,000 veces al día. Si juntas tus manos haciendo un puño, ¡ese es exactamente el tamaño de tu corazón!'
        },
        estomago: {
            nombre: 'El Estómago',
            icono: '🍕',
            subtitle: 'Sistema Digestivo y Licuadora Nutritiva',
            hecho: 'El estómago actúa como una licuadora. Mezcla todos los alimentos deliciosos que comes con unos jugos muy ácidos para convertirlos en una papilla y absorber sus energías.',
            curiosidad: 'El estómago tiene un revestimiento especial para protegerse de sus propios ácidos fuertes. ¡Es capaz de digerir cosas súper duras!'
        }
    };

    const organGroups = document.querySelectorAll('.organ-interactive');
    const organDetailsContainer = document.getElementById('organ-details');
    const anatomyFunFactBox = document.getElementById('anatomy-fun-fact-box');
    const anatomyFactText = document.getElementById('anatomy-fact-text');

    function initHumanBodyApp() {
        // Reset a placeholder
        organDetailsContainer.innerHTML = `
            <div class="info-placeholder">
                <span class="info-placeholder-icon">𫫁</span>
                <h3>Explorador del Cuerpo</h3>
                <p>Haz clic en los puntos brillantes (latientes) del cuerpo humano para realizar una biopsia de conocimiento y revelar datos fantásticos sobre cada órgano vital.</p>
            </div>
        `;
        anatomyFunFactBox.style.display = 'none';
    }

    organGroups.forEach(org => {
        org.addEventListener('click', (e) => {
            e.stopPropagation();
            const organId = org.getAttribute('data-organ');
            const data = organData[organId];

            if (data) {
                displayOrganDetails(data);
            }
        });
    });

    function displayOrganDetails(data) {
        playSound('success');
        
        organDetailsContainer.innerHTML = `
            <div class="organ-detail-card">
                <div class="organ-detail-title-wrapper">
                    <span style="font-size: 3rem;">${data.icono}</span>
                    <div>
                        <h3 class="organ-detail-title">${data.nombre}</h3>
                        <span class="organ-detail-subtitle">${data.subtitle}</span>
                    </div>
                </div>
                <p class="organ-detail-desc">${data.hecho}</p>
            </div>
        `;

        // Mostrar cuadro de curiosidad
        anatomyFactText.innerText = data.curiosidad;
        anatomyFunFactBox.style.display = 'block';
    }
});
