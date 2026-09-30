const IconSelection = ({ onSelect, onBack }) => {
    const { useState } = React;
    const [category, setCategory] = useState('Gatos');

    const catIcons = [
        { path: 'img/iconos/gatos/cat1.png', name: 'Josy' },
        { path: 'img/iconos/gatos/cat2.png', name: 'Je Je Je' },
        { path: 'img/iconos/gatos/cat3.png', name: 'Gochi' },
        { path: 'img/iconos/gatos/cat4.png', name: 'Peaky Mich' },
        { path: 'img/iconos/gatos/cat5.png', name: 'SospechMich' },
        { path: 'img/iconos/gatos/cat6.png', name: 'KheMich' },
        { path: 'img/iconos/gatos/cat7.png', name: 'Lukerito' },
        { path: 'img/iconos/gatos/cat8.png', name: 'Anezito' },
        { path: 'img/iconos/gatos/cat9.png', name: 'Lucky' },
        { path: 'img/iconos/gatos/cat10.png', name: 'Risitas' },
        { path: 'img/iconos/gatos/cat11.png', name: 'Serin' },
        { path: 'img/iconos/gatos/cat12.png', name: 'Rocky' },
        { path: 'img/iconos/gatos/cat13.png', name: 'Yety' },
        { path: 'img/iconos/gatos/cat14.png', name: 'Rex' },
    ];

    const icons = catIcons;

    return (
        <div className="icon-selection-container">
            <h1 className="icon-selection-title">Elige tu Icono</h1>

            <div className="category-tabs">
            
                <button
                    className={`category-tab ${category === 'Gatos' ? 'active' : ''}`}
                    onClick={() => setCategory('Gatos')}
                >
                    Gatos
                </button>
                
            </div>

            <div className="icon-grid">
                {icons.map((icon, index) => (
                    <div key={index} className="icon-card" onClick={() => onSelect(icon.path)}>
                        <img src={icon.path} alt={icon.name} className="icon-image" />
                        <span className="icon-name">{icon.name}</span>
                    </div>
                ))}
            </div>

            <button className="back-button" onClick={onBack}>
                Regresar
            </button>
        </div>
    );
};
