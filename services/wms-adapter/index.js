// wms-adapter/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const net = require('net');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';


const { sequelize, WMSPackage } = require('./models');
const keycloakAuth = require('./auth');
const EVENT_QUEUE = 'order.created';
const WMS_TCP_HOST = process.env.WMS_TCP_HOST || 'wms-tcp-server';
const WMS_TCP_PORT = process.env.WMS_TCP_PORT || 4000;

let channel;

// Connect to DB and RabbitMQ
async function init() {
	try {
		await sequelize.authenticate();
		await WMSPackage.sync();
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

// Handle order.created event: call WMS TCP and store mapping
async function handleOrderCreated(msg) {
	try {
		const order = JSON.parse(msg.content.toString());
		const client = new net.Socket();
		client.connect(WMS_TCP_PORT, WMS_TCP_HOST, () => {
			client.write(JSON.stringify({ op: 'createPackage', orderId: order.id }));
		});
		client.on('data', async data => {
			const resp = JSON.parse(data.toString());
			if (resp.event === 'packageReady') {
				await WMSPackage.create({
					id: order.id,
					wmsRef: resp.ref,
					payload: order,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				console.log('WMS Adapter: Order mapped', order.id, '->', resp.ref);
				client.destroy();
			}
		});
		client.on('error', err => {
			console.error('WMS TCP error:', err);
			client.destroy();
		});
	} catch (err) {
		console.error('WMS Adapter event error:', err);
	}
}

app.get('/health', (req, res) => res.send('OK'));

// All endpoints below require authentication
app.use(keycloakAuth);

// CRUD endpoints for WMS mappings
app.get('/wms-packages', async (req, res) => {
	const pkgs = await WMSPackage.findAll();
	res.json(pkgs);
});

app.get('/wms-packages/:id', async (req, res) => {
	const pkg = await WMSPackage.findByPk(req.params.id);
	if (!pkg) return res.status(404).json({ error: 'WMS package not found' });
	res.json(pkg);
});

app.delete('/wms-packages/:id', async (req, res) => {
	const pkg = await WMSPackage.findByPk(req.params.id);
	if (!pkg) return res.status(404).json({ error: 'WMS package not found' });
	await pkg.destroy();
	res.json({ status: 'WMS package deleted', pkg });
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`WMS Adapter running on port ${PORT}`));
