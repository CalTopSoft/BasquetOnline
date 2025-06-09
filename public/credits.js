const Credits = ({ setScreen }) => {
    return (
        <div className="container">
            <h1>Créditos</h1>
            <p>Juego creado por Byron pro</p>
            <p>Arte y diseño: Byron Pro</p>
            <p>Sonidos: Ney Bot</p>
            <p>Gracias a Byron pro</p>
            <button onClick={() => setScreen('home')}>Volver</button>
        </div>
    );
};