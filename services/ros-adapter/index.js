// ros-adapter/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';


const { sequelize, ROSRoute } = require('./models');
const keycloakAuth = require('./auth');
const axios = require('axios');
const EVENT_QUEUE = 'order.created';
const ROS_REST_URL = process.env.ROS_REST_URL || 'http://ros-rest-server:4000/optimize';

let channel;

// Connect to DB and RabbitMQ
async function init() {
	try {
		await sequelize.authenticate();
		await ROSRoute.sync();
		console.log('Connected to Postgres');
	} catch (err) {
		console.error('Postgres connection error:', err);
		process.exit(1);
	}
	try {
		const conn = await amqp.connect(RABBIT_URL);
		channel = await conn.createChannel();
		await channel.assertQueue(EVENT_QUEUE, { durable: true });
		channel.consume(EVENT_QUEUE, handleOrderCreated, { noAck: true });
		console.log('Connected to RabbitMQ and listening for order.created');
	} catch (err) {
		console.error('RabbitMQ connection error:', err);
		setTimeout(init, 5000);
	}
}
init();

// Handle order.created event: call ROS REST and store mapping
async function handleOrderCreated(msg) {
	try {
		const order = JSON.parse(msg.content.toString());
		const resp = await axios.post(ROS_REST_URL, { orderId: order.id });
		const { routeId, stops } = resp.data;
		await ROSRoute.create({
			id: order.id,
			routeId,
			stops,
			payload: order,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		console.log('ROS Adapter: Order mapped', order.id, '->', routeId);
	} catch (err) {
		console.error('ROS Adapter event error:', err);
	}
}

app.get('/health', (req, res) => res.send('OK'));

// All endpoints below require authentication
app.use(keycloakAuth);

// CRUD endpoints for ROS mappings
app.get('/ros-routes', async (req, res) => {
	const routes = await ROSRoute.findAll();
	res.json(routes);
});

app.get('/ros-routes/:id', async (req, res) => {
	const route = await ROSRoute.findByPk(req.params.id);
	if (!route) return res.status(404).json({ error: 'ROS route not found' });
	res.json(route);
});

app.delete('/ros-routes/:id', async (req, res) => {
	const route = await ROSRoute.findByPk(req.params.id);
	if (!route) return res.status(404).json({ error: 'ROS route not found' });
	await route.destroy();
	res.json({ status: 'ROS route deleted', route });
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`ROS Adapter running on port ${PORT}`));
