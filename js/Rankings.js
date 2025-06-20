const Rankings = ({ setScreen, rankingsRef }) => {
    return (
        <div className="rankings-container">
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
