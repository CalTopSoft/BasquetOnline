const Credits = ({ setScreen }) => {
  return (
    <div className="credits-container">
      {/* Luces de estadio */}
      <div className="spotlight-animation">
        <div className="spotlight spotlight-1"></div>
        <div className="spotlight spotlight-2"></div>
      </div>

      {/* Pelotas animadas */}
      <div className="basketball-animation">
        <div className="basketball-ball ball-1"></div>
        <div className="basketball-ball ball-2"></div>
        <div className="basketball-ball ball-3"></div>
      </div>

      {/* Aros de baloncesto */}
      <div className="hoop-animation hoop-left">
        <div className="hoop-ring"></div>
        <div className="hoop-net"></div>
      </div>
      <div className="hoop-animation hoop-right">
        <div className="hoop-ring"></div>
        <div className="hoop-net"></div>
      </div>

      {/* Jugadores animados */}
      <div className="player-animation">
        <div className="player player-1"></div>
        <div className="player player-2"></div>
      </div>

      {/* Público animado */}
      <div className="crowd-animation">
        <div className="crowd-person crowd-person-1"></div>
        <div className="crowd-person crowd-person-2"></div>
        <div className="crowd-person crowd-person-3"></div>
        <div className="crowd-person crowd-person-4"></div>
        <div className="crowd-person crowd-person-5"></div>
        <div className="crowd-person crowd-person-6"></div>
      </div>

      {/* Confeti animado */}
      <div className="confetti-animation">
        <div className="confetti confetti-1"></div>
        <div className="confetti confetti-2"></div>
        <div className="confetti confetti-3"></div>
        <div className="confetti confetti-4"></div>
      </div>

      {/* Título principal */}
      <h1 className="credits-title">🎖️ Créditos Oficiales 🎖️</h1>

      {/* Tarjetas de créditos en grid */}
      <div className="credits-cards">
        <div className="credit-card">
          <h2>👾 Programación</h2>
          <p>
            <strong>Byron Pro</strong>
          </p>
        </div>
        <div className="credit-card">
          <h2>🎨 Arte Digital</h2>
          <p>
            <strong>Byron Pro</strong>
          </p>
        </div>
        <div className="credit-card">
          <h2>🔊 Diseño de Audio</h2>
          <p>
            <strong>Ney Nuv</strong>
          </p>
        </div>
        <div className="credit-card">
          <h2>🚀 Producción</h2>
          <p>
            <strong>Equipo & Colaboradores</strong>
          </p>
        </div>
      </div>

      {/* Botón de regreso */}
      <button className="back-button" onClick={() => setScreen("home")}>
         Regresar
      </button>
    </div>
  );
};
