const { useState, useEffect, useRef } = React;

const Gameplay = ({
    name,
    wsRef,
    gameStarted,
    playerIndexRef,
    turnRef,
    ballRef,
    hoopXRef,
    scoresRef,
    roundRef,
    playersRef,
    playerIconsRef,
    timerRef,
    attemptsRef,
    currentRoom,
}) => {
    const [forceUpdate, setForceUpdate] = useState(0);
    const sketchRef = useRef(null);
    const p5Instance = useRef(null);
    const isMounted = useRef(false);
    const updateCounterRef = useRef(0);

    const setupSketch = (p) => {
        let ballImg, hoopBaseImg, hoopRingImg;
        let dragging = false;
        let dragStartX, dragStartY;
        let ballScale = 1;

        p.preload = () => {
            ballImg = p.loadImage('img/balon/ball.png');
            hoopBaseImg = p.loadImage('img/arco/hoop_base.png');
            hoopRingImg = p.loadImage('img/arco/hoop_ring.png');
            console.log("Recursos cargados exitosamente");
        };

        p.setup = () => {
            p.createCanvas(600, 490);
            p.frameRate(62);
        };

        p.draw = () => {
            p.clear();
            
            if (!ballRef.current) {
                ballRef.current = { x: 300, y: 405, r: 30, vx: 0, vy: 0, thrown: false, rotation: 0 };
            }
            if (!ballRef.current.r) ballRef.current.r = 30;
            if (!hoopXRef.current) hoopXRef.current = 300;

            const hoopBaseWidth = 240;
            const hoopBaseHeight = hoopBaseWidth * (3464 / 2598);
            const hoopRingWidth = 75;
            const hoopRingHeight = hoopRingWidth * (499 / 788);

            if (ballImg && hoopBaseImg && hoopRingImg) {
                p.image(hoopBaseImg, hoopXRef.current - hoopBaseWidth / 1.98, 40, hoopBaseWidth, hoopBaseHeight);
                
                ballScale = p.map(ballRef.current.y, 405, 113, 1, 0.8);
                ballScale = p.constrain(ballScale, 0.8, 1);

                const drawRotatedBall = () => {
                    p.push();
                    p.translate(ballRef.current.x, ballRef.current.y);
                    p.rotate(ballRef.current.rotation || 0);
                    p.image(
                        ballImg,
                        -ballRef.current.r * ballScale,
                        -ballRef.current.r * ballScale,
                        ballRef.current.r * 2 * ballScale,
                        ballRef.current.r * 2 * ballScale
                    );
                    p.pop();
                };

                if (ballRef.current.vy > 0) {
                    drawRotatedBall();
                    p.image(hoopRingImg, hoopXRef.current - hoopRingWidth / 2.2, 113, hoopRingWidth, hoopRingHeight);
                } else {
                    p.image(hoopRingImg, hoopXRef.current - hoopRingWidth / 2.2, 113, hoopRingWidth, hoopRingHeight);
                    drawRotatedBall();
                }
            } else {
                p.fill(255, 165, 0);
                p.ellipse(ballRef.current.x, ballRef.current.y, ballRef.current.r * 2 * ballScale);
                
                p.fill(255, 0, 0);
                p.rect(hoopXRef.current - 37.5, 113, 75, 20);
                
                p.fill(255);
                p.text("Imágenes no cargadas - modo debug", 10, 20);
            }
        };

        p.mousePressed = () => {
            if (
                gameStarted &&
                turnRef.current === playerIndexRef.current &&
                !ballRef.current.thrown &&
                attemptsRef.current[playerIndexRef.current] < 5
            ) {
                const ballCenterX = ballRef.current.x;
                const ballCenterY = ballRef.current.y;
                const ballRadius = ballRef.current.r * ballScale;
                
                const distance = Math.sqrt(
                    Math.pow(p.mouseX - ballCenterX, 2) + 
                    Math.pow(p.mouseY - ballCenterY, 2)
                );
                
                if (distance <= ballRadius) {
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
                const power = Math.min(Math.max(Math.sqrt(dx * dx + dy * dy) / 10, 0.2), 15.5);
                const angle = Math.atan2(dy, dx);
                const vx = power * Math.cos(angle);
                const vy = power * Math.sin(angle);

                if (wsRef.current && wsRef.current.readyState === 1) {
                    wsRef.current.send(
                        JSON.stringify({
                            type: 'shot',
                            room: currentRoom || 'room1',
                            playerIndex: playerIndexRef.current,
                            ballVX: vx,
                            ballVY: vy,
                        })
                    );
                }

                dragging = false;
            }
        };

        p.mouseDragged = () => {
            if (dragging) {
                // Opcional: mostrar línea de trayectoria
            }
        };
    };

    useEffect(() => {
        if (!isMounted.current && sketchRef.current && gameStarted) {
            p5Instance.current = new window.p5(setupSketch, sketchRef.current);
            isMounted.current = true;
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (['update', 'newRound', 'scoreUpdate', 'start', 'joined'].includes(data.type)) {
                if (data.ball) {
                    ballRef.current = { ...ballRef.current, ...data.ball };
                    if (!ballRef.current.r) ballRef.current.r = 30;
                }
                if (data.hoopX !== undefined) hoopXRef.current = data.hoopX;
                if (data.timer !== undefined) timerRef.current = data.timer;
                if (data.attempts) attemptsRef.current = data.attempts;
                if (data.playerIcons) playerIconsRef.current = data.playerIcons;
                if (data.scores) scoresRef.current = data.scores;
                if (data.turn !== undefined) turnRef.current = data.turn;
                if (data.round !== undefined) roundRef.current = data.round;
                if (data.players) playersRef.current = data.players;
                if (data.playerIndex !== undefined) playerIndexRef.current = data.playerIndex;
                
                setForceUpdate((prev) => prev + 1);
            }
        };

        if (wsRef.current) {
            wsRef.current.addEventListener('message', handleMessage);
        }

        return () => {
            if (p5Instance.current) {
                p5Instance.current.remove();
                p5Instance.current = null;
                isMounted.current = false;
            }
            if (wsRef.current) {
                wsRef.current.removeEventListener('message', handleMessage);
            }
        };
    }, [gameStarted]);

    return (
        <div className={`gameplay ${gameStarted ? 'in-game' : 'waiting'}`}>

            <div className="game-container">
                <div ref={sketchRef}></div>

                <div className="score-container">
                    <div className="score-player player1-score">{scoresRef.current[0]}</div>
                    <div className="score-player player2-score">{scoresRef.current[1]}</div>
                </div>

                <div className="turn">Turno: {playersRef.current[turnRef.current] || 'Esperando...'}</div>
                <div className="round">Ronda {roundRef.current}/3</div>

                {playersRef.current[0] && (
                    <React.Fragment>
                        <div className="player-icon player1">
                            <img src={playerIconsRef.current[0]} alt="Player 1" />
                        </div>
                        <div className="player-name player1-name">{playersRef.current[0]}</div>
                    </React.Fragment>
                )}

                {playersRef.current[1] && (
                    <React.Fragment>
                        <div className="player-icon player2">
                            <img src={playerIconsRef.current[1]} alt="Player 2" />
                        </div>
                        <div className="player-name player2-name">{playersRef.current[1]}</div>
                    </React.Fragment>
                )}

                {gameStarted && (
                    <React.Fragment>
                        <div className={`timer player1-timer ${turnRef.current === 0 ? 'active' : ''}`}>
                            <div className="timer-bar" style={{ width: `${timerRef.current * 12.5}%` }}></div>
                        </div>
                        <div className={`timer player2-timer ${turnRef.current === 1 ? 'active' : ''}`}>
                            <div className="timer-bar" style={{ width: `${timerRef.current * 12.5}%` }}></div>
                        </div>
                    </React.Fragment>
                )}

                {!gameStarted && <div className="waiting-message">Esperando al segundo jugador...</div>}
            </div>
        </div>
    );
};
