const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// This keeps track of all players
let players = {};

io.on('connection', (socket) => {
    console.log('A student connected:', socket.id);
    
    // Create a new player
    players[socket.id] = { x: 200, y: 200, color: '#' + Math.floor(Math.random()*16777215).toString(16) };

    // Tell everyone about the new player
    io.emit('currentPlayers', players);

    // When a player moves, update their position
    socket.on('playerMovement', (movementData) => {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        socket.broadcast.emit('playerMoved', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
