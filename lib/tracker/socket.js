import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Check if your Vite/React port is 3000 or 5173
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-order', (orderId) => {
        socket.join(orderId);
        console.log(`User joined order room: ${orderId}`);
    });

    socket.on('send-location', (data) => {
        const { orderId, latitude, longitude } = data;
        io.to(orderId).emit('location-update', { latitude, longitude });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Tracking Server running on port ${PORT}`);
});
