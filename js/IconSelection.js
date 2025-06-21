const IconSelection = ({ onSelect, onBack }) => {
    const { useState } = React;
    const [category, setCategory] = useState('Memes');

    const memeIcons = [
        { path: 'img/iconos/memes/meme1.png', name: 'Tralalero' },
        { path: 'img/iconos/memes/meme2.png', name: 'Tun Tun Sahur' },
        { path: 'img/iconos/memes/meme3.png', name: 'Bailarina Cpuchina' },
        { path: 'img/iconos/memes/meme4.png', name: 'Cocodrilo Bombardino' },
        { path: 'img/iconos/memes/meme5.png', name: 'Liri Li La' },
        { path: 'img/iconos/memes/meme6.png', name: 'Horangutini' },
        { path: 'img/iconos/memes/meme7.png', name: 'Bananini' },
        { path: 'img/iconos/memes/meme8.png', name: 'Udin Din Din' },
    ];

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

    const caricatureIcons = [
        { path: 'img/iconos/caricaturas/cartoon1.png', name: 'Mazinger Z' },
        { path: 'img/iconos/caricaturas/cartoon2.png', name: 'Bugs Bunny' },
        { path: 'img/iconos/caricaturas/cartoon3.png', name: 'Chavo Del 8' },
        { path: 'img/iconos/caricaturas/cartoon4.png', name: 'Jerry' },
        { path: 'img/iconos/caricaturas/cartoon5.png', name: 'Bob Esponja' },
        { path: 'img/iconos/caricaturas/cartoon6.png', name: 'Inspector Gadget' },
        { path: 'img/iconos/caricaturas/cartoon7.png', name: 'Homero Simpson' },
        { path: 'img/iconos/caricaturas/cartoon8.png', name: 'Scooby Doo' },
        { path: 'img/iconos/caricaturas/cartoon9.png', name: 'Pikachu' },
        { path: 'img/iconos/caricaturas/cartoon10.png', name: 'Pedro Picapiedra' },
        { path: 'img/iconos/caricaturas/cartoon11.png', name: 'Popeye' },
        { path: 'img/iconos/caricaturas/cartoon12.png', name: 'Micky' },
        { path: 'img/iconos/caricaturas/cartoon13.png', name: 'Pajaro Loco' },
        { path: 'img/iconos/caricaturas/cartoon14.png', name: 'Goku' },
    ];

    const icons = category === 'Memes' ? memeIcons : category === 'Gatos' ? catIcons : caricatureIcons;

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
                <button
                    className={`category-tab ${category === 'Caricaturas' ? 'active' : ''}`}
                    onClick={() => setCategory('Caricaturas')}
                >
                    Caricaturas
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