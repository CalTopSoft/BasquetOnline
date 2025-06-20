const Credits = ({ setScreen }) => {
    return (
        <div className="credits-container">
            <h1 className="credits-title">Créditos</h1>
            <div className="credits-list">
                <p className="credits-item">Juego creado por Byron pro</p>
                <p className="credits-item">Arte y diseño: Byron Pro</p>
                <p className="credits-item">Sonidos: Ney Bot</p>
                <p className="credits-item">Gracias a Byron pro</p>
            </div>
            <button className="back-button" onClick={() => setScreen('home')}>
                Volver
            </button>
        </div>
    );
};
