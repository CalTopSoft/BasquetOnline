const { useState, useEffect, useRef } = React;

const App = () => {
  console.log("Componente de aplicación renderizado");

  const [screen, setScreen] = useState('home');
  const [chatMessages, setChatMessages] = useState([]);
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
  const isPlayingEndSound = useRef(false); // Bandera para sonidos win/lose

  const ballRef = useRef(null);
  const hoopXRef = useRef(null);
  const timerRef = useRef(null);
  const attemptsRef = useRef(null);

  useEffect(() => {
    SoundManager.init();

    wsRef.current = window.connectWebSocket((data) => {
      if (data.type === 'chat') {
        setChatMessages((prev) => [
          ...prev,
          { username: data.username, message: data.message, timestamp: data.timestamp }
        ]);
        SoundManager.playSound('chatNotification');
        return;
      }

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
        ballRef.current = data.ball;
        hoopXRef.current = data.hoopX;
        timerRef.current = data.timer;
        attemptsRef.current = data.attempts;
        playerIconsRef.current = data.playerIcons || playerIconsRef.current;
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
        setGameStarted(false);
        setChatMessages([]);
        SoundManager.stopWheels();
        SoundManager.stopBackground();
        if (data.winner === nameRef.current) {
          isPlayingEndSound.current = true;
          SoundManager.playSound('win');
        } else if (data.winner !== 'tie' && data.winner !== 'Desconectado') {
          isPlayingEndSound.current = true;
          SoundManager.playSound('lose');
        }
        setScreen('result');
      }

      if (data.type === 'rankings') {
        rankingsRef.current = data.rankings;
      }

      if (data.type === 'full') {
        alert("La sala está llena. Por favor, elige otra sala.");
        setScreen('rooms');
        setChatMessages([]);
      }
    });

    // Escuchar cuando win o lose terminan para resetear la bandera
    const handleEndSoundFinished = () => {
      isPlayingEndSound.current = false;
    };

    window.addEventListener('endSoundFinished', handleEndSoundFinished);

    return () => {
      SoundManager.cleanup();
      window.closeWebSocket();
      window.removeEventListener('endSoundFinished', handleEndSoundFinished);
    };
  }, []);

  useEffect(() => {
    // Detener sonidos en pantallas que no sean gameplay, pero no si win/lose están sonando
    if (screen !== 'gameplay' && !isPlayingEndSound.current) {
      SoundManager.stopAll();
    }
  }, [screen]);

  const sendChatMessage = (message) => {
    if (message.trim()) {
      window.sendMessage({
        type: 'chat',
        room: room || 'room1',
        username: nameRef.current,
        message: message.trim()
      });
    }
  };

  const handleSetScreen = (newScreen) => {
    if (['home', 'rooms', 'result'].includes(newScreen)) {
      setChatMessages([]);
    }
    // Resetear la bandera al cambiar de pantalla manualmente
    if (newScreen !== 'result') {
      isPlayingEndSound.current = false;
    }
    setScreen(newScreen);
  };

  return (
    <div id="root">
      {screen === 'home' && <Home setScreen={handleSetScreen} nameRef={nameRef} />}
      {screen === 'rooms' && <Rooms setScreen={handleSetScreen} wsRef={wsRef} roomStatusRef={roomStatusRef} nameRef={nameRef} />}
      {screen === 'gameplay' && (
        <React.Fragment>
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
            currentRoom={room}
          />
          <Chat
            chatMessages={chatMessages}
            sendChatMessage={sendChatMessage}
            name={nameRef.current}
            currentRoom={room}
          />
        </React.Fragment>
      )}
      {screen === 'rankings' && <Rankings setScreen={handleSetScreen} rankingsRef={rankingsRef} />}
      {screen === 'credits' && <Credits setScreen={handleSetScreen} />}
      {screen === 'result' && <Result winner={winner} nameRef={nameRef} setScreen={handleSetScreen} />}
    </div>
  );
};
