// delivery/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';


const { sequelize, Delivery } = require('./models');
const keycloakAuth = require('./auth');
const { v4: uuidv4 } = require('uuid');
const EVENT_QUEUE = 'delivery.event';

let channel;

// Connect to DB and RabbitMQ
async function init() {
	try {
		await sequelize.authenticate();
		await Delivery.sync();
		console.log('Connected to Postgres');
	} catch (err) {
		console.error('Postgres connection error:', err);
		process.exit(1);
	}
	try {
		const conn = await amqp.connect(RABBIT_URL);
		channel = await conn.createChannel();
		await channel.assertQueue(EVENT_QUEUE, { durable: true });
		console.log('Connected to RabbitMQ');
	} catch (err) {
		console.error('RabbitMQ connection error:', err);
		setTimeout(init, 5000);
	}
}
init();

app.get('/health', (req, res) => res.send('OK'));

// All endpoints below require authentication
app.use(keycloakAuth);

// CRUD endpoints for delivery actions
app.get('/deliveries', async (req, res) => {
	const deliveries = await Delivery.findAll();
	res.json(deliveries);
});

app.get('/deliveries/:id', async (req, res) => {
	const delivery = await Delivery.findByPk(req.params.id);
	if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
	res.json(delivery);
});

// Driver marks package as delivered or failed
app.post('/deliveries', async (req, res) => {
	const { orderId, status, reason, signature, photo } = req.body;
	if (!orderId || !status) {
		return res.status(400).json({ error: 'orderId and status are required' });
	}
	try {
		const delivery = await Delivery.create({
			id: uuidv4(),
			driverId: req.user.sub,
			orderId,
			status,
			reason: reason || null,
			signature: signature || null,
			photo: photo || null,
			timestamp: new Date(),
			payload: req.body,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		if (channel) {
			channel.sendToQueue(EVENT_QUEUE, Buffer.from(JSON.stringify(delivery)), { persistent: true });
			console.log('Delivery event published:', delivery.toJSON());
		}
		res.status(201).json({ status: 'Delivery event created', delivery });
	} catch (err) {
		console.error('Error creating delivery event:', err);
		res.status(500).json({ error: 'Failed to create delivery event' });
	}
});

app.delete('/deliveries/:id', async (req, res) => {
	const delivery = await Delivery.findByPk(req.params.id);
	if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
	await delivery.destroy();
	res.json({ status: 'Delivery deleted', delivery });
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`Delivery service running on port ${PORT}`));
