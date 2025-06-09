const Rankings = ({ setScreen, rankingsRef }) => {
    return (
        <div className="container">
            <h1>Rankings</h1>
            {rankingsRef.current.map((entry, index) => (
                <div key={index}>
                    {index + 1}. {entry.name}: {entry.score}
                </div>
            ))}
            <button onClick={() => setScreen('home')}>Volver</button>
        </div>
    );
};