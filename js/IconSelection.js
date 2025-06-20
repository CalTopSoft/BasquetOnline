const IconSelection = ({ onSelect, onBack }) => {
    const { useState } = React;
    const [category, setCategory] = useState('Memes');

    const memeIcons = [
        { path: 'img/iconos/memes/meme1.png', name: 'Meme 1' },
        { path: 'img/iconos/memes/meme2.png', name: 'Meme 2' },
        { path: 'img/iconos/memes/meme3.png', name: 'Meme 3' },
        { path: 'img/iconos/memes/meme4.png', name: 'Meme 4' },
        { path: 'img/iconos/memes/meme5.png', name: 'Meme 5' },
        { path: 'img/iconos/memes/meme6.png', name: 'Meme 6' },
        { path: 'img/iconos/memes/meme7.png', name: 'Meme 7' },
        { path: 'img/iconos/memes/meme8.png', name: 'Meme 8' },
    ];

    const catIcons = [
        { path: 'img/iconos/gatos/cat1.png', name: 'Gato 1' },
        { path: 'img/iconos/gatos/cat2.png', name: 'Gato 2' },
        { path: 'img/iconos/gatos/cat3.png', name: 'Gato 3' },
        { path: 'img/iconos/gatos/cat4.png', name: 'Gato 4' },
        { path: 'img/iconos/gatos/cat5.png', name: 'Gato 5' },
        { path: 'img/iconos/gatos/cat6.png', name: 'Gato 6' },
        { path: 'img/iconos/gatos/cat7.png', name: 'Gato 7' },
        { path: 'img/iconos/gatos/cat8.png', name: 'Gato 8' },
        { path: 'img/iconos/gatos/cat9.png', name: 'Gato 9' },
        { path: 'img/iconos/gatos/cat10.png', name: 'Gato 10' },
        { path: 'img/iconos/gatos/cat11.png', name: 'Gato 11' },
        { path: 'img/iconos/gatos/cat12.png', name: 'Gato 12' },
        { path: 'img/iconos/gatos/cat13.png', name: 'Gato 13' },
        { path: 'img/iconos/gatos/cat14.png', name: 'Gato 14' },
    ];

    const icons = category === 'Memes' ? memeIcons : catIcons;

    return (
        <div className="icon-selection-container">
            <h1 className="icon-selection-title">Elige tu Icono</h1>

            <div className="category-tabs">
                <button
                    className={`category-tab ${category === 'Memes' ? 'active' : ''}`}
                    onClick={() => setCategory('Memes')}
                >
                    Memes
                </button>
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
