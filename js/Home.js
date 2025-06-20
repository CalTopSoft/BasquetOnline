const Home = ({ setScreen, nameRef }) => {
    const { useState } = React;
    const [localName, setLocalName] = useState(nameRef.current);

    const handleChange = (e) => {
        const value = e.target.value;
        setLocalName(value);
        nameRef.current = value;
    };

    return (
        <div className="home-container">
            <h1 className="home-title">BasketLine Multijugador</h1>

            <div className="court-lines">
                <div className="court-line court-line-1"></div>
                <div className="court-line court-line-2"></div>
                <div className="court-line court-line-3"></div>
                <div className="court-line court-line-4"></div>
                <div className="court-line court-line-5"></div>
            </div>

            <div className="basketball-animation">
                <div className="basketball-ball ball-1"></div>
                <div className="basketball-ball ball-2"></div>
                <div className="basketball-ball ball-3"></div>
                <div className="basketball-ball ball-4"></div>
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
                <div className="crowd-person crowd-person-5"></div>
                <div className="crowd-person crowd-person-6"></div>
            </div>

            <div className="spotlight-animation">
                <div className="spotlight spotlight-1"></div>
                <div className="spotlight spotlight-2"></div>
            </div>

            <div className="home-content">
                <input
                    type="text"
                    className="name-input"
                    placeholder="Ingresa tu nombre"
                    value={localName}
                    maxLength="10"
                    onChange={handleChange}
                />
                <div className="button-group">
                    <button className="action-button" onClick={() => setScreen('rooms')}>
                        Entrar a Partida
                    </button>
                    <button className="action-button" onClick={() => setScreen('rankings')}>
                        Rankings
                    </button>
                    <button className="action-button" onClick={() => setScreen('credits')}>
                        Créditos v1.0
                    </button>
                </div>
            </div>
        </div>
    );
};
