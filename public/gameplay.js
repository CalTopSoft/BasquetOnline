const Gameplay = ({ name, gameStarted, playersRef, scoresRef, roundRef, turnRef, playerIndexRef, wsRef, room }) => {
    const [forceUpdate, setForceUpdate] = React.useState(0);
    const [players, setPlayers] = React.useState(['', '']);
    const [scores, setScores] = React.useState([0, 0]);
    const [currentTurn, setCurrentTurn] = React.useState(0);
    const [currentRound, setCurrentRound] = React.useState(1);
    const [timer, setTimer] = React.useState(8);
    const [countdown, setCountdown] = React.useState(0);
    
    const sketchRef = React.useRef(null);
    const p5Instance = React.useRef(null);
    const timerRef = React.useRef(8);
    const ballRef = React.useRef({ x: 300, y: 370, r: 30, vx: 0, vy: 0, thrown: false, rotation: 0 });
    const hoopXRef = React.useRef(300);
    const isMounted = React.useRef(false);
    const attemptsRef = React.useRef([0, 0]);
    const updateCounterRef = React.useRef(0);
    const lastBallStateRef = React.useRef(null);

    // SoundManager remains unchanged
    const SoundManager = (() => {
        let backgroundSound = null;
        let bounceSound = null;
        let hoopHitSound = null;
        let wheelsSound = null;
        let scoreSound = null;
        let scoreAddSound = null;
        let winSound = null;
        let loseSound = null;
        let isSoundPlaying = false;

        const init = () => {
            backgroundSound = new Audio('sound/background.mp3');
            backgroundSound.loop = true;
            backgroundSound.volume = 0.4;

            bounceSound = new Audio('sound/ball_bounce.mp3');
            hoopHitSound = new Audio('sound/hoop_hit.mp3');
            wheelsSound = new Audio('sound/wheels.mp3');
            wheelsSound.volume = 0.3;
            scoreSound = new Audio('sound/score.mp3');
            scoreAddSound = new Audio('sound/score_add.mp3');
            winSound = new Audio('sound/win.mp3');
            loseSound = new Audio('sound/lose.mp3');

            console.log("SoundManager initialized with native Audio API");
        };

        const playBackground = () => {
            if (backgroundSound && !isSoundPlaying) {
                backgroundSound.play().catch(err => console.error("Error playing background sound:", err));
                isSoundPlaying = true;
                console.log("Background sound started");
            }
        };

        const stopBackground = () => {
            if (backgroundSound) {
                backgroundSound.pause();
                backgroundSound.currentTime = 0;
                isSoundPlaying = false;
                console.log("Background sound stopped");
            }
        };

        const playSound = (soundType) => {
            const soundMap = {
                bounce: bounceSound,
                hoopHit: hoopHitSound,
                wheels: wheelsSound,
                score: scoreSound,
                scoreAdd: scoreAddSound,
                win: winSound,
                lose: loseSound
            };
            const sound = soundMap[soundType];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(err => console.error(`Error playing ${soundType} sound:`, err));
                console.log(`${soundType} sound played`);
            }
        };

        const cleanup = () => {
            stopBackground();
            [bounceSound, hoopHitSound, wheelsSound, scoreSound, scoreAddSound, winSound, loseSound].forEach(sound => {
                if (sound) {
                    sound.pause();
                    sound.currentTime = 0;
                }
            });
        };

        return { init, playBackground, stopBackground, playSound, cleanup };
    })();

    React.useEffect(() => {
        SoundManager.init();
        SoundManager.playBackground();

        return () => {
            SoundManager.cleanup();
        };
    }, []);

    const setupSketch = (p) => {
        let ballImg, hoopBaseImg, hoopRingImg;
        let dragging = false;
        let dragStartX, dragStartY;
        let ballScale = 1;

        p.preload = () => {
            try {
                ballImg = p.loadImage('img/balon/ball.png');
                hoopBaseImg = p.loadImage('img/arco/hoop_base.png');
                hoopRingImg = p.loadImage('img/arco/hoop_ring.png');
                console.log("Resources loaded successfully");
            } catch (error) {
 Victor.error("Error loading resources:", error);
            }
        };

        p.setup = () => {
            p.createCanvas(600, 400);
            p.frameRate(30);
        };

        p.draw = () => {
            p.clear();
            ballRef.current.x = ballRef.current.x || 300;
            ballRef.current.y = ballRef.current.y || 370;
            hoopXRef.current = hoopXRef.current || 300;

            const hoopBaseWidth = 240;
            const hoopBaseHeight = hoopBaseWidth * (3464 / 2598);
            const hoopRingWidth = 75;
            const hoopRingHeight = hoopRingWidth * (499 / 788);

            if (ballImg && hoopBaseImg && hoopRingImg) {
                p.image(hoopBaseImg, hoopXRef.current - hoopBaseWidth / 1.98, 40, hoopBaseWidth, hoopBaseHeight);
                ballScale = p.map(ballRef.current.y, 370, 113, 1, 0.8);
                ballScale = p.constrain(ballScale, 0.8, 1);
                const drawRotatedBall = () => {
                    p.push();
                    p.translate(ballRef.current.x, ballRef.current.y);
                    p.rotate(ballRef.current.rotation || 0);
                    p.image(ballImg, -ballRef.current.r * ballScale, -ballRef.current.r * ballScale, ballRef.current.r * 2 * ballScale, ballRef.current.r * 2 * ballScale);
                    p.pop();
                };

                if (ballRef.current.vy > 0) {
                    drawRotatedBall();
                    p.image(hoopRingImg, hoopXRef.current - hoopRingWidth / 2.2, 113, hoopRingWidth, hoopRingHeight);
                } else {
                    p.image(hoopRingImg, hoopXRef.current - hoopRingWidth / 2.2, 113, hoopRingWidth, hoopRingHeight);
                    drawRotatedBall();
                }
            }

            if (gameStarted) {
                const timerWidth = p.map(timerRef.current, 0, 8, 0, 100);
                p.noStroke();
                p.fill(255, 0, 0);
                p.fill(0, 255, 0);
            }
        };

        p.mousePressed = () => {
            if (gameStarted && currentTurn === playerIndexRef.current && !ballRef.current.thrown && attemptsRef.current[playerIndexRef.current] < 5) {
                if (p.mouseX >= ballRef.current.x - ballRef.current.r && p.mouseX <= ballRef.current.x + ballRef.current.r && 
                    p.mouseY >= ballRef.current.y - ballRef.current.r && p.mouseY <= ballRef.current.y + ballRef.current.r) {
                    dragging = true;
                    dragStartX = p.mouseX;
                    dragStartY = p.mouseY;
                }
            }
        };

        p.mouseReleased = () => {
            if (dragging) {
                const dx = p.mouseX - dragStartX;
                const dy = p.mouseY - dragStartY;
                const power = Math.min(Math.max(Math.sqrt(dx * dx + dy * dy) / 10, 0.2), 15);
                const angle = Math.atan2(dy, dx);
                const vx = power * Math.cos(angle);
                const vy = power * Math.sin(angle);

                if (wsRef.current) {
                    wsRef.current.send(JSON.stringify({
                        type: 'shot',
                        room: room,
                        playerIndex: playerIndexRef.current,
                        ballVX: vx,
                        ballVY: vy
                    }));
                }

                dragging = false;
            }
        };

        p.mouseDragged = () => {
            if (dragging) console.log("Dragging in progress...");
        };
    };

    React.useEffect(() => {
        if (!isMounted.current && sketchRef.current && gameStarted) {
            p5Instance.current = new p5(setupSketch, sketchRef.current);
            isMounted.current = true;
        }

        return () => {
            if (p5Instance.current) {
                p5Instance.current.remove();
                p5Instance.current = null;
                isMounted.current = false;
            }
        };
    }, [gameStarted]);

    React.useEffect(() => {
        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'update' || data.type === 'newRound' || data.type === 'scoreUpdate' || data.type === 'start') {
                ballRef.current = { ...ballRef.current, ...data.ball };
                hoopXRef.current = data.hoopX;
                timerRef.current = data.timer;
                attemptsRef.current = data.attempts;
                
                // Actualizar estados locales para forzar re-render
                if (data.scores) {
                    setScores([...data.scores]);
                    scoresRef.current = data.scores;
                }
                if (data.round) {
                    setCurrentRound(data.round);
                    roundRef.current = data.round;
                }
                if (data.players) {
                    // Ensure players array is valid and non-empty
                    const newPlayers = data.players && Array.isArray(data.players) && data.players.length > 0 
                        ? data.players 
                        : playersRef.current || ['', ''];
                    setPlayers(newPlayers);
                    playersRef.current = newPlayers;
                    console.log("Players updated:", newPlayers); // Debug log
                }
                if (data.turn !== undefined) {
                    setCurrentTurn(data.turn);
                    turnRef.current = data.turn;
                    console.log("Turn updated:", data.turn); // Debug log
                }
                if (data.timer !== undefined) {
                    setTimer(data.timer);
                }
                
                // Actualizar countdown si viene en los datos
                if (data.countdown !== undefined) {
                    setCountdown(data.countdown);
                }

                // Lógica de sonidos del código original
                if (lastBallStateRef.current && data.ball) {
                    if (
                        lastBallStateRef.current.thrown &&
                        !data.ball.thrown &&
                        data.ball.vy === 0 &&
                        data.ball.vx === 0 &&
                        data.ball.y === 370
                    ) {
                        SoundManager.playSound('bounce');
                    }
                    if (
                        lastBallStateRef.current.y > 113 &&
                        data.ball.y <= 113 &&
                        Math.abs(data.ball.x - data.hoopX) < 15
                    ) {
                        SoundManager.playSound('hoopHit');
                    }
                    if (
                        Math.abs(lastBallStateRef.current.x - data.hoopX) > 75 &&
                        Math.abs(data.ball.x - data.hoopX) <= 75
                    ) {
                        SoundManager.playSound('wheels');
                    }
                    if (
                        lastBallStateRef.current.thrown &&
                        !data.ball.thrown &&
                        data.scores && lastBallStateRef.current.scores &&
                        data.scores[data.turn] > (lastBallStateRef.current.scores[data.turn] || 0)
                    ) {
                        SoundManager.playSound('score');
                        SoundManager.playSound('scoreAdd');
                    }
                }
                lastBallStateRef.current = { ...data.ball, scores: data.scores ? [...data.scores] : null };
                
                setForceUpdate(prev => prev + 1);
            }
        };

        if (wsRef.current) {
            wsRef.current.addEventListener('message', handleMessage);
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.removeEventListener('message', handleMessage);
            }
        };
    }, []);

    return (
        <div className="gameplay">
            <div className="game-container">
                <div ref={sketchRef}></div>
                <div className="score-container">
                    <div className="score-player player1-score">{scores[0]}</div>
                    <div className="score-player player2-score">{scores[1]}</div>
                </div>
                <div className="turn">
                    Turno: {players[currentTurn] && players[currentTurn].trim() ? players[currentTurn] : 'Esperando...'}
                </div>
                <div className="round">Ronda {currentRound}/3</div>
                {players[0] && players[0].trim() && (
                    <>
                        <img src="/img/iconosplayer/player1.png" alt="Player 1" className="player-icon player1" />
                        <div className="player-name player1-name">{players[0]}</div>
                    </>
                )}
                {players[1] && players[1].trim() && (
                    <>
                        <img src="/img/iconosplayer/player2.png" alt="Player 2" className="player-icon player2" />
                        <div className="player-name player2-name">{players[1]}</div>
                    </>
                )}
                <div className="turn-indicator" style={{ display: 'none' }}>Modo Edición - Sin Turnos</div>
                {gameStarted && (
                    <>
                        <div className={`timer player1-timer ${currentTurn === 0 ? 'active' : ''}`}>
                            <div className="timer-bar" style={{ width: `${timer * 12.5}%` }}></div>
                        </div>
                        <div className={`timer player2-timer ${currentTurn === 1 ? 'active' : ''}`}>
                            <div className="timer-bar" style={{ width: `${timer * 12.5}%` }}></div>
                        </div>
                    </>
                )}
                {countdown > 0 && <div className="countdown">{countdown}</div>}
                {!gameStarted && <div className="waiting-message">Esperando al segundo jugador...</div>}
            </div>
        </div>
    );
};
