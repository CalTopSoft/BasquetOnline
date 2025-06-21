// Bloquear clic derecho (context menu)
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

// Bloquear combinaciones como Ctrl+U, Ctrl+S, Ctrl+I
document.addEventListener("keydown", (event) => {
    if (
        event.ctrlKey &&
        (event.key === "u" || event.key === "s" || event.key === "i")
    ) {
        event.preventDefault();
    }

    // Bloquear F12
    if (event.key === "F12") {
        event.preventDefault();
        console.log("El uso de F12 está deshabilitado.");
    }
});

// Permitir desplazamiento vertical en móviles ajustando la altura mínima
window.onload = function () {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const container = document.querySelector('.container');
    if (container) {
        container.style.minHeight = windowHeight + 'px';
    }
};
