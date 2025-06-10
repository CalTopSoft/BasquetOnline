const { useState, useEffect, useRef } = React;

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

const App = () => {
    console.log("App component rendered");

    const [screen, setScreen] = useState('home');
    const [name, setName] = useState('Jugador1');
    const [room, setRoom] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const playersRef = useRef([]);
    const scoresRef = useRef([0, 0]);
    const roundRef = useRef(1);
    const turnRef = useRef(0);
    const countdownRef = useRef(0);
    const rankingsRef = useRef([]);
    const roomStatusRef = useRef({ room1: { players: 0 }, room2: { players: 0 } });
    const playerIndexRef = useRef(null);
    const wsRef = useRef(null);
    const lastBallStateRef = useRef(null);

    useEffect(() => {
        SoundManager.init();
        const wsUrl = 'wss://basquetonline.onrender.com';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log("Connected to WebSocket server");
            wsRef.current.send(JSON.stringify({ type: 'getRooms' }));
            wsRef.current.send(JSON.stringify({ type: 'getRankings' }));
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'rooms') {
                roomStatusRef.current = data.rooms;
                setScreen(screen => screen);
            }
            if (data.type === 'joined') {
                setRoom(data.room);
                playersRef.current = data.players;
                playerIndexRef.current = data.playerIndex;
                setScreen('gameplay');
            }
            if (data.type === 'start') {
                setGameStarted(true);
                playersRef.current = data.players;
                scoresRef.current = data.scores;
                roundRef.current = data.round;
                turnRef.current = data.turn;
            }
            if (data.type === 'update') {
                scoresRef.current = data.scores;
                roundRef.current = data.round;
                playersRef.current = data.players;
                turnRef.current = data.turn;
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
                        data.scores[data.turn] > (lastBallStateRef.current.scores?.[data.turn] || 0)
                    ) {
                        SoundManager.playSound('score');
                        SoundManager.playSound('scoreAdd');
                    }
                }
                lastBallStateRef.current = { ...data.ball, scores: [...data.scores] };
            }
            if (data.type === 'newRound') {
                roundRef.current = data.round;
                scoresRef.current = data.scores;
                playersRef.current = data.players;
                turnRef.current = data.turn;
                setScreen(screen => screen);
            }
            if (data.type === 'scoreUpdate') {
                scoresRef.current = data.scores;
                setScreen(screen => screen);
            }
            if (data.type === 'end') {
                setWinner(data.winner);
                setScreen('result');
                setGameStarted(false);
                if (data.winner === name) {
                    SoundManager.playSound('win');
                } else if (data.winner !== 'tie') {
                    SoundManager.playSound('lose');
                }
            }
            if (data.type === 'rankings') {
                rankingsRef.current = data.rankings;
            }
            if (data.type === 'full') {
                alert("La sala está llena. Por favor, elige otra sala.");
                setScreen('rooms');
            }
        };

        wsRef.current.onclose = () => {
            console.log("Disconnected from WebSocket server");
            SoundManager.stopBackground();
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            SoundManager.cleanup();
        };
    }, []);

    return (
        <div>
            {screen === 'home' && <Home setScreen={setScreen} name={name} setName={setName} />}
            {screen === 'rooms' && <Rooms setScreen={setScreen} wsRef={wsRef} roomStatusRef={roomStatusRef} />}
            {screen === 'gameplay' && (
                <Gameplay 
                    name={name} 
                    gameStarted={gameStarted} 
                    playersRef={playersRef} 
                    scoresRef={scoresRef} 
                    roundRef={roundRef} 
                    turnRef={turnRef} 
                    playerIndexRef={playerIndexRef} 
                    wsRef={wsRef} 
                    room={room}
                />
            )}
            {screen === 'rankings' && <Rankings setScreen={setScreen} rankingsRef={rankingsRef} />}
            {screen === 'credits' && <Credits setScreen={setScreen} />}
            {screen === 'result' && <Result winner={winner} name={name} setScreen={setScreen} />}
        </div>
    );
};
