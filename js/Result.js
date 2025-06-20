const Result = ({ winner, nameRef, setScreen }) => {
    const getResultMessage = () => {
        if (winner === 'tie') return '¡Empate!';
        if (winner === 'Desconectado') return 'Partida cancelada - Jugador desconectado';
        if (winner === nameRef.current) return '¡Ganaste!';
        return 'Perdiste';
    };

    const getResultClass = () => {
        if (winner === 'tie') return 'tie';
        if (winner === 'Desconectado') return 'disconnected';
        if (winner === nameRef.current) return 'win';
        return 'lose';
    };

    return (
        <div className="result-container">
            <h1 className={`result-message ${getResultClass()}`}>{getResultMessage()}</h1>
            <button className="result-button" onClick={() => setScreen('rooms')}>
                Volver
            </button>
        </div>
    );
};
