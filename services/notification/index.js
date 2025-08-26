// notification/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';

// ...add your WebSocket push logic here...

app.get('/health', (req, res) => res.send('OK'));

server.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));
