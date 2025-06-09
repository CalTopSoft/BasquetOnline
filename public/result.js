const Result = ({ winner, name, setScreen }) => {
    return (
        <div className="container">
            <h1>{winner === 'tie' ? '¡Empate!' : winner === name ? '¡Ganaste!' : 'Perdiste'}</h1>
            <button onClick={() => setScreen('rooms')}>Volver</button>
        </div>
    );
};