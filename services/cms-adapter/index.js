// cms-adapter/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const soap = require('strong-soap').soap;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';


const { sequelize, CMSOrder } = require('./models');
const keycloakAuth = require('./auth');
const soap = require('strong-soap').soap;
const EVENT_QUEUE = 'order.created';
const CMS_WSDL_URL = process.env.CMS_SOAP_WSDL_URL || 'http://cms-soap-server:4000/wsdl';

let channel;

// Connect to DB and RabbitMQ
async function init() {
	try {
		await sequelize.authenticate();
		await CMSOrder.sync();
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

// Handle order.created event: call CMS SOAP and store mapping
async function handleOrderCreated(msg) {
	try {
		const order = JSON.parse(msg.content.toString());
		soap.createClient(CMS_WSDL_URL, {}, (err, client) => {
			if (err) return console.error('SOAP client error:', err);
			client.CreateOrder({ orderId: order.id }, async (err, result) => {
				if (err) return console.error('SOAP call error:', err);
				// Store mapping in DB
				await CMSOrder.create({
					id: order.id,
					cmsRef: result.cmsRef,
					payload: order,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				console.log('CMS Adapter: Order mapped', order.id, '->', result.cmsRef);
			});
		});
	} catch (err) {
		console.error('CMS Adapter event error:', err);
	}
}

app.get('/health', (req, res) => res.send('OK'));

// All endpoints below require authentication
app.use(keycloakAuth);

// CRUD endpoints for CMS mappings
app.get('/cms-orders', async (req, res) => {
	const orders = await CMSOrder.findAll();
	res.json(orders);
});

app.get('/cms-orders/:id', async (req, res) => {
	const order = await CMSOrder.findByPk(req.params.id);
	if (!order) return res.status(404).json({ error: 'CMS order not found' });
	res.json(order);
});

app.delete('/cms-orders/:id', async (req, res) => {
	const order = await CMSOrder.findByPk(req.params.id);
	if (!order) return res.status(404).json({ error: 'CMS order not found' });
	await order.destroy();
	res.json({ status: 'CMS order deleted', order });
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`CMS Adapter running on port ${PORT}`));
