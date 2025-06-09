const Home = ({ setScreen, name, setName }) => {
    const startSound = () => {
        SoundManager.playBackground();
    };

    React.useEffect(() => {
        const handleInteraction = () => {
            startSound();
            document.removeEventListener('click', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);
        return () => document.removeEventListener('click', handleInteraction);
    }, []);

    return (
        <div className="container">
            <h1>Juego de Baloncesto</h1>
            <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <br />
            <button onClick={() => setScreen('rooms')}>Entrar a Partida</button>
            <button onClick={() => setScreen('rankings')}>Rankings</button>
            <button onClick={() => setScreen('credits')}>Créditos v1.0</button>
        </div>
    );
};