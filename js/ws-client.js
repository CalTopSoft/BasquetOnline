const wsUrl = window.location.hostname === 'localhost'
  ? 'ws://localhost:8080'
  : 'wss://basquetonline-servidor.onrender.com';

let ws = null;
let messageCallback = null;

window.connectWebSocket = (onMessage) => {
  ws = new WebSocket(wsUrl);
  messageCallback = onMessage;

  ws.onopen = () => {
    console.log('Conectado al servidor WebSocket');
    window.sendMessage({ type: 'getRooms' });
    window.sendMessage({ type: 'getRankings' });
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (messageCallback) {
      messageCallback(data);
    }
  };

  ws.onclose = () => {
    console.log('Desconectado del servidor WebSocket');
    setTimeout(() => window.connectWebSocket(messageCallback), 5000);
  };

  ws.onerror = (error) => {
    console.error('Error en WebSocket:', error);
  };

  return ws;
};

window.sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.warn('WebSocket no está conectado');
  }
};

window.closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
