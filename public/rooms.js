const Rooms = ({ setScreen, wsRef, roomStatusRef }) => {
    const joinRoom = (roomName) => {
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'join', room: roomName, name }));
        }
    };

    return (
        <div className="rooms-container">
            <h1 className="rooms-title">Salas de Baloncesto</h1>
            <div className="court-lines">
                <div className="court-line court-line-1"></div>
                <div className="court-line court-line-2"></div>
                <div className="court-line court-line-3"></div>
            </div>
            <div className="basketball-animation">
                <div className="basketball-ball ball-1"></div>
                <div className="basketball-ball ball-2"></div>
                <div className="basketball-ball ball-3"></div>
            </div>
            <div className="hoop-animation hoop-left">
                <div className="hoop-ring"></div>
                <div className="hoop-net"></div>
            </div>
            <div className="hoop-animation hoop-right">
                <div className="hoop-ring"></div>
                <div className="hoop-net"></div>
            </div>
            <div className="crowd-animation">
                <div className="crowd-person crowd-person-1"></div>
                <div className="crowd-person crowd-person-2"></div>
                <div className="crowd-person crowd-person-3"></div>
                <div className="crowd-person crowd-person-4"></div>
            </div>
            <div className="rooms-list">
                <div className="room-card" id="room1-card">
                    <div className="room-header">
                        <span className="room-name">Cancha 1</span>
                        <span className="room-status">
                            ({roomStatusRef.current.room1.players}/2)
                        </span>
                    </div>
                    <div className="room-content">
                        <p className="room-info">¡Dribla, encesta y triunfa!</p>
                        <button 
                            className={`room-button ${roomStatusRef.current.room1.players >= 2 ? 'disabled' : ''}`}
                            onClick={() => joinRoom('room1')} 
                            disabled={roomStatusRef.current.room1.players >= 2}
                        >
                            Jugar
                        </button>
                    </div>
                </div>
                <div className="room-card" id="room2-card">
                    <div className="room-header">
                        <span className="room-name">Cancha 2</span>
                        <span className="room-status">
                            ({roomStatusRef.current.room2.players}/2)
                        </span>
                    </div>
                    <div className="room-content">
                        <p className="room-info">¡Anota el punto ganador!</p>
                        <button 
                            className={`room-button ${roomStatusRef.current.room2.players >= 2 ? 'disabled' : ''}`}
                            onClick={() => joinRoom('room2')} 
                            disabled={roomStatusRef.current.room2.players >= 2}
                        >
                            Jugar
                        </button>
                    </div>
                </div>
            </div>
            <button className="back-button" onClick={() => setScreen('home')}>
                Volver a la Cancha Principal
            </button>
        </div>
    );
};