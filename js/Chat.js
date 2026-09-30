const { useState, useEffect, useRef } = React;

const Chat = ({ chatMessages, sendChatMessage, name, currentRoom }) => {
    const [chatInput, setChatInput] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(window.innerWidth > 768);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const chatContainerRef = useRef(null);
    const lastSoundTimeRef = useRef(0); // Para evitar spam de sonidos

    // Detectar nuevos mensajes del otro jugador
    useEffect(() => {
        if (chatMessages.length > 0) {
            const lastMessage = chatMessages[chatMessages.length - 1];
            if (lastMessage.username !== name) {
                setHasNewMessages(true);
                // Reproducir sonido si ha pasado al menos 1 segundo
                const now = Date.now();
                if (now - lastSoundTimeRef.current >= 1000) {
                    SoundManager.playSound('chatNotification');
                    lastSoundTimeRef.current = now;
                }
            }
        }
    }, [chatMessages, name]);

    // Reiniciar notificación al abrir el chat
    useEffect(() => {
        if (isChatOpen) {
            setHasNewMessages(false);
        }
    }, [isChatOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendChatMessage(chatInput);
            setChatInput('');
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const toggleChat = () => {
        setIsChatOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768 && (!window.visualViewport || window.visualViewport.height >= window.innerHeight)) {
                setIsChatOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <React.Fragment>
            <button
                className={`chat-toggle-btn-gameplay ${hasNewMessages ? 'new-message' : ''}`}
                onClick={toggleChat}
            >
                {isChatOpen ? '❌' : '💬'}
                {hasNewMessages && <span className="notification-dot"></span>}
            </button>

            <div className={`chat-container ${isChatOpen ? 'open' : 'closed'}`}>
                <h3>Chat</h3>
                <div className="chat-messages" ref={chatContainerRef}>
                    {chatMessages.map((msg, index) => (
                        <p key={index} className={`chat-message ${msg.username === name ? 'own' : 'other'}`}>
                            <strong>{msg.username}:</strong> {msg.message}
                        </p>
                    ))}
                </div>
                <form className="chat-form" onSubmit={handleSendMessage}>
                    <input
                        className="chat-input"
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        maxLength={60}
                    />
                    <button className="chat-send-btn" type="submit">
                        Enviar
                    </button>
                </form>
            </div>
        </React.Fragment>
    );
};
