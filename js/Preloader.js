const Preloader = () => {
    // Lista de todas las imágenes que vamos a precargar
    const imagesToLoad = [
        'img/balon/ball.png',
        'img/arco/hoop_base.png',
        'img/arco/hoop_ring.png',
        'img/fondo/background.png',
        
        // Íconos de gatos
        'img/iconos/gatos/cat1.png',
        'img/iconos/gatos/cat2.png',
        'img/iconos/gatos/cat3.png',
        'img/iconos/gatos/cat4.png',
        'img/iconos/gatos/cat5.png',
        'img/iconos/gatos/cat6.png',
        'img/iconos/gatos/cat7.png',
        'img/iconos/gatos/cat8.png',
        'img/iconos/gatos/cat9.png',
        'img/iconos/gatos/cat10.png',
        'img/iconos/gatos/cat11.png',
        'img/iconos/gatos/cat12.png',
        'img/iconos/gatos/cat13.png',
        'img/iconos/gatos/cat14.png',
        
    ];

    // Contamos cuántas imágenes ya se cargaron
    let loadedImages = 0;
    const totalImages = imagesToLoad.length;

    // Crear el root de React 18 una sola vez
    let root = null;

    // Actualizamos la barra de progreso
    const updateProgress = () => {
        const progress = (loadedImages / totalImages) * 100;
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `Cargando datos... ${Math.round(progress)}%`;
        }

        // SOLO cuando todas las imágenes estén cargadas
        if (loadedImages === totalImages) {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.display = 'none';
            }
            
            // Usar React 18 API
            const container = document.getElementById('root');
            if (container) {
                // Crear root solo si no existe
                if (!root) {
                    root = ReactDOM.createRoot(container);
                }
                root.render(<App />);
            }
        }
    };

    // Cargamos cada imagen
    imagesToLoad.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            updateProgress();
        };
        img.onerror = () => {
            console.error(`Error al cargar la imagen: ${src}`);
            loadedImages++;
            updateProgress();
        };
    });

    // Limpiar el contenedor
    const container = document.getElementById('root');
    if (container) {
        container.innerHTML = '';
    }
};