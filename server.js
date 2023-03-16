const express = require('express');
import {Server} from 'socket.io';
import path from 'path';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`);
    socket.on('sender-join', (data) => {
        socket.join(data.uid);
        console.log(`user ${socket.id} with id ${data.uid} joined`);
    });
    socket.on('receiver-join', (data) => {
        socket.join(data.uid);
        // Once a socket has joined a room, you can use the socket.in() method to send a message to all sockets in that room.
        socket.in(data.sender_uid).emit('init', data.uid);

    });

    socket.on('file-meta', (data) => {
        socket.in(data.uid).emit('fs-meta', data.metadata);

        console.log('on file-meta', data);

    });

    socket.on('fs-start', (data) => {
        socket.in(data.uid).emit('fs-share', {});

    });
    socket.on('file-raw', (data) => {
        socket.in(data.uid).emit('fs-share', data.buffer);

    });

    socket.on('disconnect', (reason) => {
        console.log(`user ${socket.id} is disconnected`);
    });


});


server.listen(PORT, () => console.log(`Server started at port ${PORT}`));
