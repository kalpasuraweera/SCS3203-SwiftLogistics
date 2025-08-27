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


const { keycloakSocketAuth } = require('./auth');
const EVENT_QUEUES = [
	'order.created',
	'order.updated',
	'order.deleted',
	'cms.updated',
	'wms.updated',
	'ros.updated',
	// Add more as needed
];

let channel;

// Connect to RabbitMQ and broadcast events to WebSocket clients
async function init() {
	try {
		const conn = await amqp.connect(RABBIT_URL);
		channel = await conn.createChannel();
		for (const q of EVENT_QUEUES) {
			await channel.assertQueue(q, { durable: true });
			channel.consume(q, msg => {
				if (msg) {
					const payload = JSON.parse(msg.content.toString());
					io.emit(q, payload); // Broadcast to all connected clients
				}
			}, { noAck: true });
		}
		console.log('Notification service: listening for events:', EVENT_QUEUES.join(', '));
	} catch (err) {
		console.error('RabbitMQ connection error:', err);
		setTimeout(init, 5000);
	}
}
init();

// WebSocket authentication
io.use(keycloakSocketAuth);

io.on('connection', socket => {
	console.log('WebSocket client connected:', socket.user?.sub || 'unknown');
	socket.emit('connected', { message: 'WebSocket connection established' });
});

app.get('/health', (req, res) => res.send('OK'));

server.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));
