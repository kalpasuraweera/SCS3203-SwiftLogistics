// order-api/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());



const { sequelize, Order } = require('./models');
const keycloakAuth = require('./auth');
const EVENT_QUEUES = {
  created: 'order.created',
  updated: 'order.updated',
  deleted: 'order.deleted',
};
let channel;


// Connect to DB and RabbitMQ
async function init() {
  try {
    await sequelize.authenticate();
    await Order.sync();
    console.log('Connected to Postgres');
  } catch (err) {
    console.error('Postgres connection error:', err);
    process.exit(1);
  }
  try {
    const conn = await amqp.connect(RABBIT_URL);
    channel = await conn.createChannel();
    for (const q of Object.values(EVENT_QUEUES)) {
      await channel.assertQueue(q, { durable: true });
    }
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


// CRUD endpoints (now using Postgres)
// Get all orders
app.get('/orders', async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
});

// Get order by id
app.get('/orders/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Create order
app.post('/orders', async (req, res) => {
  const data = req.body;
  if (!data || !data.id) {
    return res.status(400).json({ error: 'Order must have an id' });
  }
  try {
    const order = await Order.create({ ...data, createdAt: new Date(), updatedAt: new Date() });
    if (channel) {
      channel.sendToQueue(EVENT_QUEUES.created, Buffer.from(JSON.stringify(order)), { persistent: true });
      console.log('Order created & published:', order.toJSON());
    }
    res.status(201).json({ status: 'Order created', order });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Order with this id already exists' });
    }
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
app.put('/orders/:id', async (req, res) => {
  const id = req.params.id;
  const update = req.body;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update({ ...update, updatedAt: new Date() });
    if (channel) {
      channel.sendToQueue(EVENT_QUEUES.updated, Buffer.from(JSON.stringify(order)), { persistent: true });
      console.log('Order updated & published:', order.toJSON());
    }
    res.json({ status: 'Order updated', order });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
app.delete('/orders/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.destroy();
    if (channel) {
      channel.sendToQueue(EVENT_QUEUES.deleted, Buffer.from(JSON.stringify(order)), { persistent: true });
      console.log('Order deleted & published:', order.toJSON());
    }
    res.json({ status: 'Order deleted', order });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.listen(PORT, () => console.log(`Order API running on port ${PORT}`));
