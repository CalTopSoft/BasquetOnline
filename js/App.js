const { useState, useEffect, useRef } = React;

const App = () => {
    console.log("Componente de aplicación renderizado");

    const [screen, setScreen] = useState('home');
    const nameRef = useRef('Jugador1');
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
    const selectedIconRef = useRef('img/iconos/memes/meme1.png');
    const playerIconsRef = useRef(['img/iconos/memes/meme1.png', 'img/iconos/memes/meme1.png']);

    const ballRef = useRef(null);
    const hoopXRef = useRef(null);
    const timerRef = useRef(null);
    const attemptsRef = useRef(null);

    useEffect(() => {
        SoundManager.init();

        const wsUrl = window.location.hostname === 'localhost'
            ? 'ws://localhost:8080'
            : 'wss://basquetonline.onrender.com';

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log("Conectado al servidor WebSocket");
            wsRef.current.send(JSON.stringify({ type: 'getRooms' }));
            wsRef.current.send(JSON.stringify({ type: 'getRankings' }));
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'rooms') {
                roomStatusRef.current = data.rooms;
            }

            if (data.type === 'joined') {
                setRoom(data.room);
                playersRef.current = data.players;
                playerIndexRef.current = data.playerIndex;
                playerIconsRef.current = data.playerIcons || ['img/iconos/memes/meme1.png', 'img/iconos/memes/meme1.png'];
                setScreen('gameplay');
            }

            if (data.type === 'start') {
                setGameStarted(true);
                playersRef.current = data.players;
                scoresRef.current = data.scores;
                roundRef.current = data.round;
                turnRef.current = data.turn;
                playerIconsRef.current = data.playerIcons || ['img/iconos/memes/meme1.png', 'img/iconos/memes/meme1.png'];
                SoundManager.playBackground();
                SoundManager.stopWheels();
            }

            if (data.type === 'update') {
                scoresRef.current = data.scores;
                roundRef.current = data.round;
                playersRef.current = data.players;
                turnRef.current = data.turn;
                playerIconsRef.current = data.playerIcons || playerIconsRef.current;
                if (lastBallStateRef.current && data.ball) {
                    // lógica opcional
                }
                lastBallStateRef.current = { ...data.ball, scores: [...data.scores] };
            }

            if (data.type === 'bounce') {
                SoundManager.playSound('bounce');
            }

            if (data.type === 'hoopHit') {
                SoundManager.playSound('hoopHit');
            }

            if (data.type === 'newRound') {
                roundRef.current = data.round;
                scoresRef.current = data.scores;
                playersRef.current = data.players;
                turnRef.current = data.turn;
                playerIconsRef.current = data.playerIcons || playerIconsRef.current;
                if (data.round === 2 || data.round === 3) {
                    SoundManager.playWheels();
                } else {
                    SoundManager.stopWheels();
                }
            }

            if (data.type === 'scoreUpdate') {
                scoresRef.current = data.scores;
                playerIconsRef.current = data.playerIcons || playerIconsRef.current;
                SoundManager.playSound('score');
                SoundManager.playSound('scoreAdd');
            }

            if (data.type === 'end') {
                setWinner(data.winner);
                setScreen('result');
                setGameStarted(false);
                SoundManager.stopWheels();
                if (data.winner === nameRef.current) {
                    SoundManager.playSound('win');
                } else if (data.winner !== 'tie' && data.winner !== 'Desconectado') {
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
            console.log("Desconectado del servidor WebSocket");
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
            {screen === 'home' && <Home setScreen={setScreen} nameRef={nameRef} />}
            {screen === 'rooms' && <Rooms setScreen={setScreen} wsRef={wsRef} roomStatusRef={roomStatusRef} nameRef={nameRef} />}
            {screen === 'gameplay' && (
                <Gameplay
                    name={nameRef.current}
                    wsRef={wsRef}
                    gameStarted={gameStarted}
                    playerIndexRef={playerIndexRef}
                    turnRef={turnRef}
                    ballRef={ballRef}
                    hoopXRef={hoopXRef}
                    scoresRef={scoresRef}
                    roundRef={roundRef}
                    playersRef={playersRef}
                    playerIconsRef={playerIconsRef}
                    timerRef={timerRef}
                    attemptsRef={attemptsRef}
                    currentRoom={room}  // <-- Aquí la agregas
                />
            )}

            {screen === 'rankings' && <Rankings setScreen={setScreen} rankingsRef={rankingsRef} />}
            {screen === 'credits' && <Credits setScreen={setScreen} />}
            {screen === 'result' && <Result winner={winner} nameRef={nameRef} setScreen={setScreen} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
