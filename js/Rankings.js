const Rankings = ({ setScreen, rankingsRef }) => {
    return (
        <div className="rankings-container">
            {/* Luces del estadio */}
            <div className="spotlight-animation">
                <div className="spotlight spotlight-1"></div>
                <div className="spotlight spotlight-2"></div>
            </div>

            {/* Líneas de la cancha */}
            <div className="court-lines">
                <div className="court-line court-line-1"></div>
                <div className="court-line court-line-2"></div>
                <div className="court-line court-line-3"></div>
                <div className="court-line court-line-4"></div>
                <div className="court-line court-line-5"></div>
            </div>

            {/* Pelotas animadas */}
            <div className="basketball-animation">
                <div className="basketball-ball ball-1"></div>
                <div className="basketball-ball ball-2"></div>
                <div className="basketball-ball ball-3"></div>
            </div>

            {/* Aros con red */}
            <div className="hoop-animation hoop-left">
                <div className="hoop-ring"></div>
                <div className="hoop-net"></div>
            </div>
            <div className="hoop-animation hoop-right">
                <div className="hoop-ring"></div>
                <div className="hoop-net"></div>
            </div>

            {/* Jugadores */}
            <div className="player-animation">
                <div className="player player-1"></div>
                <div className="player player-2"></div>
            </div>

            {/* Fans animados */}
            <div className="crowd-animation">
                <div className="crowd-person crowd-person-1"></div>
                <div className="crowd-person crowd-person-2"></div>
                <div className="crowd-person crowd-person-3"></div>
                <div className="crowd-person crowd-person-4"></div>
                <div className="crowd-person crowd-person-5"></div>
                <div className="crowd-person crowd-person-6"></div>
            </div>

            {/* Trofeos decorativos */}
            <div className="trophy-animation">
                <div className="trophy trophy-1"></div>
                <div className="trophy trophy-2"></div>
            </div>

            {/* Contenido principal de rankings */}
            <h1 className="rankings-title">Rankings</h1>
            <div className="rankings-list">
                {rankingsRef.current.map((entry, index) => (
                    <div key={index} className="ranking-item">
                        <span className="ranking-position">{index + 1}</span>
                        <span className="ranking-name">{entry.name}</span>
                        <span className="ranking-score">{entry.score}</span>
                    </div>
                ))}
            </div>
            <button className="back-button" onClick={() => setScreen('home')}>Volver</button>
        </div>
    );
};
