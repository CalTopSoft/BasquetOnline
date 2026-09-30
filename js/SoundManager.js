const SoundManager = (() => {
  let backgroundSound = null;
  let bounceSound = null;
  let hoopHitSound = null;
  let wheelsSound = null;
  let scoreSound = null;
  let scoreAddSound = null;
  let winSound = null;
  let loseSound = null;
  let chatNotificationSound = null;
  let isSoundPlaying = false;
  let isWheelsPlaying = false;

  const init = () => {
    backgroundSound = new Audio('sound/background.mp3');
    backgroundSound.loop = false; // Desactivar loop para evitar comportamiento de "música"
    backgroundSound.volume = 0.4;
    // Marcar como sonido no persistente para móviles
    backgroundSound.preload = 'auto';
    backgroundSound.muted = false;

    bounceSound = new Audio('sound/ball_bounce.mp3');
    hoopHitSound = new Audio('sound/hoop_hit.mp3');
    wheelsSound = new Audio('sound/wheels.mp3');
    wheelsSound.volume = 0.3;
    wheelsSound.loop = false; // Desactivar loop

    scoreSound = new Audio('sound/score.mp3');
    scoreAddSound = new Audio('sound/score_add.mp3');
    winSound = new Audio('sound/win.mp3');
    loseSound = new Audio('sound/lose.mp3');
    chatNotificationSound = new Audio('sound/chat_notification.mp3');
    chatNotificationSound.volume = 0.6;

    const allSounds = [
      backgroundSound,
      bounceSound,
      hoopHitSound,
      wheelsSound,
      scoreSound,
      scoreAddSound,
      winSound,
      loseSound,
      chatNotificationSound,
    ];

    allSounds.forEach((sound) => {
      sound.onerror = () => console.error(`Error al cargar ${sound.src}`);
      sound.onloadeddata = () => console.log(`${sound.src} cargado`);
      // Asegurar que los sonidos no se registren como música
      sound.preload = 'auto';
      sound.muted = false;
    });

    // Detener el fondo al terminar
    backgroundSound.onended = () => {
      isSoundPlaying = false;
      console.log("Sonido de fondo terminado");
    };

    wheelsSound.onended = () => {
      isWheelsPlaying = false;
      console.log("Sonido wheels terminado");
    };

    console.log("SoundManager inicializado con API de audio nativa");
  };

  const playBackground = () => {
    if (backgroundSound && !isSoundPlaying) {
      backgroundSound.play().catch((err) =>
        console.error("Error al reproducir el sonido de fondo:", err)
      );
      isSoundPlaying = true;
      console.log("Se inició el sonido de fondo.");
    }
  };

  const stopBackground = () => {
    if (backgroundSound && isSoundPlaying) {
      backgroundSound.pause();
      backgroundSound.currentTime = 0;
      isSoundPlaying = false;
      console.log("El sonido de fondo se detuvo");
    }
  };

  const playWheels = () => {
    if (wheelsSound && !isWheelsPlaying) {
      wheelsSound.play().catch((err) =>
        console.error("Error al reproducir wheels:", err)
      );
      isWheelsPlaying = true;
      console.log("Sonido wheels iniciado");
    }
  };

  const stopWheels = () => {
    if (wheelsSound && isWheelsPlaying) {
      wheelsSound.pause();
      wheelsSound.currentTime = 0;
      isWheelsPlaying = false;
      console.log("Sonido wheels detenido");
    }
  };

  const playSound = (soundType) => {
    const soundMap = {
      bounce: bounceSound,
      hoopHit: hoopHitSound,
      score: scoreSound,
      scoreAdd: scoreAddSound,
      win: winSound,
      lose: loseSound,
      chatNotification: chatNotificationSound,
    };

    const sound = soundMap[soundType];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((err) =>
        console.error(`Error al reproducir ${soundType} sonido:`, err)
      );
      console.log(`${soundType} sonido reproducido`);
    }
  };

  const stopAll = () => {
    stopBackground();
    stopWheels();
    const allSounds = [
      bounceSound,
      hoopHitSound,
      scoreSound,
      scoreAddSound,
      winSound,
      loseSound,
      chatNotificationSound,
    ];
    allSounds.forEach((sound) => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    console.log("Todos los sonidos detenidos");
  };

  const cleanup = () => {
    stopAll();
  };

  return {
    init,
    playBackground,
    stopBackground,
    playWheels,
    stopWheels,
    playSound,
    stopAll,
    cleanup,
  };
})();
