const WebSocket = require('ws');
const fs = require('fs').promises;
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = {
    room1: { 
        players: [], 
        scores: [0, 0], 
        round: 1, 
        attempts: [0, 0],
        totalAttempts: [0, 0],
        turn: 0, 
        afk: [0, 0], 
        ball: { x: 300, y: 370, vx: 0, vy: 0, thrown: false, rotation: 0 }, 
        timer: 8, 
        lastTimerUpdate: Date.now(), 
        hoopX: 300, 
        hoopDirection: 1, 
        bounceCount: 0,
        gameStarted: false,
        gameEnded: false,
        shotInProgress: false,
        lastUpdate: { scores: [0, 0], round: 1, turn: 0, attempts: [0, 0], players: [], ball: null, hoopX: 300 }
    },
    room2: { 
        players: [], 
        scores: [0, 0], 
        round: 1, 
        attempts: [0, 0], 
        totalAttempts: [0, 0],
        turn: 0, 
        afk: [0, 0], 
        ball: { x: 300, y: 370, vx: 0, vy: 0, thrown: false, rotation: 0 }, 
        timer: 8, 
        lastTimerUpdate: Date.now(), 
        hoopX: 300, 
        hoopDirection: 1, 
        bounceCount: 0,
        gameStarted: false,
        gameEnded: false,
        shotInProgress: false,
        lastUpdate: { scores: [0, 0], round: 1, turn: 0, attempts: [0, 0], players: [], ball: null, hoopX: 300 }
    }
};
let rankings = [];

const loadRankings = async () => {
    console.log("DEBUG: Loading rankings");
    try {
        const data = await fs.readFile('rankings.json', 'utf8');
        rankings = JSON.parse(data);
        console.log("DEBUG: Rankings loaded:", rankings);
    } catch (err) {
        console.error("DEBUG: Error loading rankings:", err);
        rankings = [];
    }
};

const saveRankings = async () => {
    console.log("DEBUG: Saving rankings");
    try {
        await fs.writeFile('rankings.json', JSON.stringify(rankings, null, 2));
        console.log("DEBUG: Rankings saved");
    } catch (err) {
        console.error("DEBUG: Error saving rankings:", err);
    }
};

loadRankings();

const updateGameState = () => {
    for (const roomName in rooms) {
        const room = rooms[roomName];
        if (!room.gameStarted || room.gameEnded) continue;

        console.log(`DEBUG: Updating game state for ${roomName}, round: ${room.round}, turn: ${room.turn}`);
        const now = Date.now();

        if (now - room.lastTimerUpdate >= 1000 && !room.ball.thrown && !room.shotInProgress) {
            room.timer -= 1;
            room.lastTimerUpdate = now;
            console.log(`DEBUG: Timer updated for ${roomName}: ${room.timer}`);
            if (room.timer <= 0) {
                console.log(`DEBUG: Time out for ${roomName}, passing turn`);
                passTurn(room, roomName);
            }
        }

        // Aro fijo en ronda 1, móvil en rondas 2 y 3
        if (room.round >= 2) {
            let hoopSpeed = room.round === 3 ? 1.5 : 1.2;
            room.hoopX += room.hoopDirection * hoopSpeed;
            if (room.hoopX >= 450 || room.hoopX <= 150) {
                room.hoopDirection *= -1;
                console.log(`DEBUG: Hoop direction changed for ${roomName}`);
            }
        } else {
            room.hoopX = 300; // Fijo en ronda 1
        }

        if (room.ball.thrown) {
            room.shotInProgress = true;
            console.log(`DEBUG: Ball thrown in ${roomName}, position: (${room.ball.x}, ${room.ball.y})`);

            room.ball.x += room.ball.vx;
            room.ball.y += room.ball.vy;
            room.ball.vy += 0.15;
            room.ball.vx *= 0.996;
            room.ball.vy *= 0.988;

            const totalSpeed = Math.sqrt(room.ball.vx * room.ball.vx + room.ball.vy * room.ball.vy);
            room.ball.rotation += totalSpeed * 0.05;

            if (room.ball.x - 30 <= 0 || room.ball.x + 30 >= 600) {
                if (room.ball.x - 30 <= 0) room.ball.x = 30;
                else room.ball.x = 600 - 30;
                room.ball.vx *= -0.8;
                room.ball.vy += (Math.random() - 0.5) * 1;
                console.log(`DEBUG: Ball hit wall in ${roomName}`);
            }

            if (room.ball.y + 30 >= 370 && room.bounceCount < 3) {
                room.ball.y = 370 - 30;
                room.ball.vy = -Math.abs(room.ball.vy) * 0.75;
                if (Math.abs(room.ball.vx) > 0.1) room.ball.vx *= 0.9;
                else room.ball.vx += (Math.random() - 0.5) * 3;

                const centerOffset = room.ball.x - 300;
                room.ball.vx += centerOffset * 0.03;
                room.bounceCount++;
                console.log(`DEBUG: Ball bounced ${room.bounceCount} times in ${roomName}`);

                if (room.bounceCount === 3) {
                    console.log(`DEBUG: Max bounces reached in ${roomName}, finalizing shot`);
                    finalizarTiro(room, roomName, false);
                }
            } else if (room.ball.y > 400 && room.bounceCount >= 3) {
                console.log(`DEBUG: Ball out of bounds in ${roomName}, finalizing shot`);
                finalizarTiro(room, roomName, false);
            }

            const hoopLeft = room.hoopX - 75 / 2;
            const hoopRight = room.hoopX + 75 / 2;
            const hoopTop = 113;
            const hoopBottom = hoopTop + 20;
            const hoopCenterX = room.hoopX;
            const hoopCenterY = hoopTop + 10;

            const ballInHoopArea = (
                room.ball.x + 30 >= hoopLeft &&
                room.ball.x - 30 <= hoopRight &&
                room.ball.y + 30 >= (hoopTop - 2) &&
                room.ball.y - 30 <= hoopBottom &&
                room.ball.vy > 0
            );

            if (ballInHoopArea) {
                console.log(`DEBUG: Ball in hoop area in ${roomName}`);
                const centerZoneWidth = 50;
                const centerZoneHeight = 1;
                const isInCenter = (
                    Math.abs(room.ball.x - hoopCenterX) < centerZoneWidth / 2 &&
                    Math.abs(room.ball.y - hoopCenterY) < centerZoneHeight / 2
                );

                if (isInCenter) {
                    room.scores[room.turn] += 2;
                    room.afk[room.turn] = 0;
                    console.log(`DEBUG: Score! Player ${room.turn} scored in ${roomName}, scores: ${room.scores}`);
                    finalizarTiro(room, roomName, true);
                } else {
                    const hitLeftCorner = Math.abs(room.ball.x - hoopLeft) < 15 && Math.abs(room.ball.y - hoopTop) < 15;
                    const hitRightCorner = Math.abs(room.ball.x - hoopRight) < 15 && Math.abs(room.ball.y - hoopTop) < 15;
                    if (hitLeftCorner || hitRightCorner) {
                        const bounceDirection = hitLeftCorner ? -1 : 1;
                        room.ball.vx = bounceDirection * Math.abs(room.ball.vx) * 1.3 + bounceDirection * 3;
                        room.ball.vy *= -0.7;
                        if (room.ball.vy > -2) room.ball.vy = 2;
                        console.log(`DEBUG: Ball hit hoop corner in ${roomName}`);
                    }
                }
            }
        }

        const currentState = {
            scores: room.scores,
            turn: room.turn,
            ball: room.ball,
            timer: room.timer,
            hoopX: room.hoopX,
            round: room.round,
            attempts: room.attempts,
            players: room.players.map(player => player.name)
        };

        if (JSON.stringify(currentState) !== JSON.stringify(room.lastUpdate)) {
            console.log(`DEBUG: Sending state update for ${roomName}:`, currentState);
            room.players.forEach(p => {
                if (p.ws.readyState === WebSocket.OPEN) {
                    p.ws.send(JSON.stringify({
                        type: 'update',
                        ...currentState
                    }));
                }
            });
            room.lastUpdate = { ...currentState };
        }
    }
};

const finalizarTiro = (room, roomName, wasSuccessful) => {
    console.log(`DEBUG: Finalizing shot in ${roomName}, successful: ${wasSuccessful}`);
    room.ball = { x: 300, y: 370, vx: 0, vy: 0, thrown: false, rotation: 0 };
    room.bounceCount = 0;
    room.shotInProgress = false;
    room.timer = 8;
    room.lastTimerUpdate = Date.now();

    room.attempts[room.turn]++;
    room.totalAttempts[room.turn]++;

    passTurn(room, roomName);
};

const passTurn = async (room, roomName) => {
    console.log(`DEBUG: Passing turn in ${roomName}, current attempts: ${room.attempts}`);
    if (room.attempts[room.turn] < 5) {
        room.timer = 8;
        room.lastTimerUpdate = Date.now();
        return;
    }

    const otherPlayer = (room.turn + 1) % 2;
    if (room.attempts[otherPlayer] >= 5) {
        if (room.round >= 3) {
            console.log(`DEBUG: All rounds completed in ${roomName}, ending game`);
            await endGame(room, roomName);
        } else {
            room.round++;
            room.attempts = [0, 0];
            room.turn = 0;
            room.timer = 8;
            room.lastTimerUpdate = Date.now();
            room.hoopX = 300;

            console.log(`DEBUG: Starting new round ${room.round} in ${roomName}`);
            room.players.forEach(p => {
                if (p.ws.readyState === WebSocket.OPEN) {
                    p.ws.send(JSON.stringify({
                        type: 'newRound',
                        round: room.round,
                        turn: room.turn,
                        attempts: room.attempts
                    }));
                }
            });
        }
    } else {
        room.turn = otherPlayer;
        room.timer = 8;
        room.lastTimerUpdate = Date.now();
        console.log(`DEBUG: Turn passed to player ${room.turn} in ${roomName}`);
    }
};

const endGame = async (room, roomName) => {
    console.log(`DEBUG: Ending game in ${roomName}`);
    room.gameEnded = true;

    let winner = room.scores[0] > room.scores[1] ? 0 : room.scores[1] > room.scores[0] ? 1 : -1;

    room.players.forEach(p => {
        if (p.ws.readyState === WebSocket.OPEN) {
            if (winner === -1) {
                p.ws.send(JSON.stringify({ type: 'end', winner: 'tie' }));
            } else if (room.players[winner]) {
                p.ws.send(JSON.stringify({ type: 'end', winner: room.players[winner].name }));
            } else {
                p.ws.send(JSON.stringify({ type: 'end', winner: 'Desconectado' }));
            }
        }
    });

    if (winner === -1) {
        if (room.players[0]) rankings.push({ name: room.players[0].name, score: room.scores[0] });
        if (room.players[1]) rankings.push({ name: room.players[1].name, score: room.scores[1] });
    } else if (room.players[winner]) {
        rankings.push({ name: room.players[winner].name, score: room.scores[winner] });
    }

    rankings.sort((a, b) => b.score - a.score);
    rankings = rankings.slice(0, 5);
    await saveRankings();

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'rankings', rankings }));
        }
    });

    resetRoom(room);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'rooms',
                rooms: {
                    room1: { players: rooms.room1.players.length },
                    room2: { players: rooms.room2.players.length }
                }
            }));
        }
    });
};

wss.on('connection', (ws) => {
    console.log("DEBUG: New WebSocket connection");
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
        console.log("DEBUG: Pong received");
    });

    ws.on('message', async (message) => {
        console.log("DEBUG: WebSocket message received on server");
        try {
            const data = JSON.parse(message);
            console.log("DEBUG: Server message data:", data);

            if (data.type === 'join') {
                console.log(`DEBUG: Player joining ${data.room}`);
                const room = rooms[data.room];
                if (room.players.length < 2) {
                    const playerIndex = room.players.length;
                    room.players.push({ ws, name: data.name, index: playerIndex });

                    ws.send(JSON.stringify({
                        type: 'joined',
                        room: data.room,
                        players: room.players.map(p => p.name),
                        playerIndex: playerIndex
                    }));
                    console.log(`DEBUG: Player ${data.name} joined ${data.room} as player ${playerIndex}`);

                    if (room.players.length === 2) {
                        room.gameStarted = true;
                        room.gameEnded = false;
                        room.turn = 0;
                        room.attempts = [0, 0];
                        room.totalAttempts = [0, 0];
                        room.scores = [0, 0];
                        room.round = 1;
                        room.timer = 8;
                        room.lastTimerUpdate = Date.now();
                        room.ball = { x: 300, y: 370, vx: 0, vy: 0, thrown: false, rotation: 0 };
                        room.shotInProgress = false;
                        room.hoopX = 300;
                        room.lastUpdate = {
                            scores: [0, 0],
                            round: 1,
                            turn: 0,
                            attempts: [0, 0],
                            players: room.players.map(p => p.name),
                            ball: room.ball,
                            hoopX: 300
                        };

                        console.log(`DEBUG: Game started in ${data.room}`);
                        room.players.forEach(p => {
                            if (p.ws.readyState === WebSocket.OPEN) {
                                p.ws.send(JSON.stringify({
                                    type: 'start',
                                    turn: room.turn,
                                    ball: room.ball,
                                    scores: room.scores,
                                    round: room.round,
                                    attempts: room.attempts,
                                    players: room.players.map(player => player.name)
                                }));
                            }
                        });
                    }

                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'rooms',
                                rooms: {
                                    room1: { players: rooms.room1.players.length },
                                    room2: { players: rooms.room2.players.length }
                                }
                            }));
                        }
                    });
                } else {
                    console.log(`DEBUG: Room ${data.room} is full`);
                    ws.send(JSON.stringify({ type: 'full' }));
                }
            }

            if (data.type === 'shot') {
                console.log(`DEBUG: Shot received in ${data.room} from player ${data.playerIndex}`);
                const room = rooms[data.room];

                if (room.turn !== data.playerIndex || !room.gameStarted || room.gameEnded ||
                    room.ball.thrown || room.shotInProgress || room.attempts[room.turn] >= 5) {
                    console.log(`DEBUG: Invalid shot attempt in ${data.room}`);
                    return;
                }

                room.ball.vx = data.ballVX;
                room.ball.vy = data.ballVY;
                room.ball.thrown = true;
                room.ball.rotation = 0;
                room.bounceCount = 0;
                room.shotInProgress = true;
                console.log(`DEBUG: Shot processed in ${data.room}`);
            }

            if (data.type === 'getRankings') {
                console.log("DEBUG: Sending rankings to client");
                ws.send(JSON.stringify({ type: 'rankings', rankings }));
            }

            if (data.type === 'getRooms') {
                console.log("DEBUG: Sending room status to client");
                ws.send(JSON.stringify({
                    type: 'rooms',
                    rooms: {
                        room1: { players: rooms.room1.players.length },
                        room2: { players: rooms.room2.players.length }
                    }
                }));
            }
        } catch (err) {
            console.error("DEBUG: Error processing server message:", err);
        }
    });

    ws.on('close', () => {
        console.log("DEBUG: WebSocket connection closed");
        for (const roomName in rooms) {
            const room = rooms[roomName];
            const index = room.players.findIndex(p => p.ws === ws);
            if (index !== -1) {
                console.log(`DEBUG: Player disconnected from ${roomName}`);
                room.players.splice(index, 1);

                if (room.gameStarted && room.players.length < 2) {
                    room.players.forEach(p => {
                        if (p.ws.readyState === WebSocket.OPEN) {
                            p.ws.send(JSON.stringify({ type: 'end', winner: 'Desconectado' }));
                        }
                    });
                    resetRoom(room);
                    console.log(`DEBUG: Room ${roomName} reset due to disconnection`);
                }

                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'rooms',
                            rooms: {
                                room1: { players: rooms.room1.players.length },
                                room2: { players: rooms.room2.players.length }
                            }
                        }));
                    }
                });
            }
        }
    });
};

const resetRoom = (room) => {
    console.log("DEBUG: Resetting room");
    room.players = [];
    room.scores = [0, 0];
    room.round = 1;
    room.attempts = [0, 0];
    room.totalAttempts = [0, 0];
    room.turn = 0;
    room.afk = [0, 0];
    room.ball = { x: 300, y: 370, vx: 0, vy: 0, thrown: false, rotation: 0 };
    room.timer = 8;
    room.lastTimerUpdate = Date.now();
    room.hoopX = 300;
    room.hoopDirection = 1;
    room.bounceCount = 0;
    room.gameStarted = false;
    room.gameEnded = false;
    room.shotInProgress = false;
    room.lastUpdate = { scores: [0, 0], round: 1, turn: 0, attempts: [0, 0], players: [], ball: null, hoopX: 300 };
};

const pingInterval = setInterval(() => {
    console.log("DEBUG: Sending ping to clients");
    wss.clients.forEach(ws => {
        if (!ws.isAlive) {
            console.log("DEBUG: Terminating inactive client");
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    console.log("DEBUG: WebSocket server closed");
    clearInterval(pingInterval);
});

setInterval(updateGameState, 20);

server.listen(process.env.PORT || 8080, () => {
    console.log('DEBUG: Server running on port 8080');
});
