const WebSocket = require('ws');
const fs = require('fs').promises;
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = {
    room1: { players: [], scores: [0, 0], round: 1, attempts: [0, 0], turn: 0, afk: [0, 0], ball: { x: 300, y: 350, vx: 0, vy: 0, thrown: false } },
    room2: { players: [], scores: [0, 0], round: 1, attempts: [0, 0], turn: 0, afk: [0, 0], ball: { x: 300, y: 350, vx: 0, vy: 0, thrown: false } }
};
let rankings = [];

const loadRankings = async () => {
    try {
        const data = await fs.readFile('rankings.json', 'utf8');
        rankings = JSON.parse(data);
    } catch (err) {
        rankings = [];
    }
};

const saveRankings = async () => {
    await fs.writeFile('rankings.json', JSON.stringify(rankings, null, 2));
};

loadRankings();

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            const room = rooms[data.room];
            if (room.players.length < 2) {
                room.players.push({ ws, name: data.name });
                ws.send(JSON.stringify({ type: 'joined', room: data.room, players: room.players.map(p => p.name) }));
                if (room.players.length === 1) {
                    room.turn = 0;
                    room.players.forEach(p => p.ws.send(JSON.stringify({ type: 'start', turn: room.turn, ballX: room.ball.x, ballY: room.ball.y, ballVX: room.ball.vx, ballVY: room.ball.vy, ballThrown: room.ball.thrown })));
                } else if (room.players.length === 2) {
                    room.turn = 0;
                    room.players.forEach(p => p.ws.send(JSON.stringify({ type: 'start', turn: room.turn, ballX: room.ball.x, ballY: room.ball.y, ballVX: room.ball.vx, ballVY: room.ball.vy, ballThrown: room.ball.thrown })));
                }
                // Enviar el estado actualizado de las salas a todos los clientes
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ type: 'rooms', rooms: { room1: { players: rooms.room1.players.length }, room2: { players: rooms.room2.players.length } } }));
                });
            } else {
                ws.send(JSON.stringify({ type: 'full' }));
            }
        }

        if (data.type === 'shot') {
            // Código existente para 'shot' (sin cambios)
            const room = rooms[data.room];
            const scored = data.scored;
            room.ball.x = data.ballX;
            room.ball.y = data.ballY;
            room.ball.vx = data.ballVX;
            room.ball.vy = data.ballVY;
            room.ball.thrown = data.ballThrown;
            room.attempts[room.turn]++;
            if (scored) {
                room.scores[room.turn]++;
                room.afk[room.turn] = 0;
            } else {
                room.afk[room.turn]++;
            }

            room.players.forEach(p => {
                p.ws.send(JSON.stringify({ type: 'update', scores: room.scores, turn: room.turn, scored, ballX: room.ball.x, ballY: room.ball.y, ballVX: room.ball.vx, ballVY: room.ball.vy, ballThrown: room.ball.thrown, ballHit: data.ballHit }));
            });

            if (room.afk[room.turn] >= 2) {
                const winner = room.turn === 0 ? 1 : 0;
                room.players.forEach(p => {
                    p.ws.send(JSON.stringify({ type: 'end', winner: room.players[winner].name }));
                });
                rankings.push({ name: room.players[winner].name, score: room.scores[winner] });
                rankings.sort((a, b) => b.score - a.score);
                rankings = rankings.slice(0, 5);
                await saveRankings();
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ type: 'rankings', rankings }));
                });
                resetRoom(room);
                return;
            }

            if (room.attempts[room.turn] >= 5) {
                if (room.round >= 3) {
                    let winner = room.scores[0] > room.scores[1] ? 0 : room.scores[1] > room.scores[0] ? 1 : -1;
                    room.players.forEach(p => {
                        p.ws.send(JSON.stringify({ type: 'end', winner: winner === -1 ? 'tie' : room.players[winner].name }));
                    });
                    if (winner === -1) {
                        rankings.push({ name: room.players[0].name, score: room.scores[0] });
                        rankings.push({ name: room.players[1].name, score: room.scores[1] });
                    } else {
                        rankings.push({ name: room.players[winner].name, score: room.scores[winner] });
                    }
                    rankings.sort((a, b) => b.score - a.score);
                    rankings = rankings.slice(0, 5);
                    await saveRankings();
                    wss.clients.forEach(client => {
                        client.send(JSON.stringify({ type: 'rankings', rankings }));
                    });
                    resetRoom(room);
                } else {
                    room.round++;
                    room.attempts = [0, 0];
                    room.turn = 0;
                    room.players.forEach(p => {
                        p.ws.send(JSON.stringify({ type: 'newRound', round: room.round }));
                    });
                }
            } else {
                room.turn = room.turn === 0 ? 1 : 0;
                room.ball.x = 300;
                room.ball.y = 350;
                room.ball.vx = 0;
                room.ball.vy = 0;
                room.ball.thrown = false;
                room.players.forEach(p => {
                    p.ws.send(JSON.stringify({ type: 'updateTurn', turn: room.turn, ballX: room.ball.x, ballY: room.ball.y, ballVX: room.ball.vx, ballVY: room.ball.vy, ballThrown: room.ball.thrown }));
                });
            }
        }

        if (data.type === 'getRankings') {
            ws.send(JSON.stringify({ type: 'rankings', rankings }));
        }

        // Nuevo mensaje para obtener el estado de las salas
        if (data.type === 'getRooms') {
            ws.send(JSON.stringify({ type: 'rooms', rooms: { room1: { players: rooms.room1.players.length }, room2: { players: rooms.room2.players.length } } }));
        }
    });

    ws.on('close', () => {
        for (const roomName in rooms) {
            const room = rooms[roomName];
            const index = room.players.findIndex(p => p.ws === ws);
            if (index !== -1) {
                room.players.splice(index, 1);
                resetRoom(room);
                // Enviar el estado actualizado de las salas a todos los clientes
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ type: 'rooms', rooms: { room1: { players: rooms.room1.players.length }, room2: { players: rooms.room2.players.length } } }));
                });
            }
        }
    });
});

const resetRoom = (room) => {
    room.players = [];
    room.scores = [0, 0];
    room.round = 1;
    room.attempts = [0, 0];
    room.turn = 0;
    room.afk = [0, 0];
    room.ball = { x: 300, y: 350, vx: 0, vy: 0, thrown: false };
};

server.listen(process.env.PORT || 8080, () => {
    console.log('Server running on port 8080');
});
