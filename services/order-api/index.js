// order-api/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());


const fs = require('fs');
const ORDERS_FILE = __dirname + '/orders.json';
const EVENT_QUEUES = {
  created: 'order.created',
  updated: 'order.updated',
  deleted: 'order.deleted',
};

let channel;

// Helper to read/write orders
function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// Connect to RabbitMQ
async function connectRabbit() {
  try {
    const conn = await amqp.connect(RABBIT_URL);
    channel = await conn.createChannel();
    for (const q of Object.values(EVENT_QUEUES)) {
      await channel.assertQueue(q, { durable: true });
    }
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
    setTimeout(connectRabbit, 5000);
  }
}
connectRabbit();

app.get('/health', (req, res) => res.send('OK'));

// CRUD endpoints
// Get all orders
app.get('/orders', (req, res) => {
  res.json(readOrders());
});

// Get order by id
app.get('/orders/:id', (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Create order
app.post('/orders', async (req, res) => {
  const order = req.body;
  if (!order || !order.id) {
    return res.status(400).json({ error: 'Order must have an id' });
  }
  let orders = readOrders();
  if (orders.find(o => o.id == order.id)) {
    return res.status(409).json({ error: 'Order with this id already exists' });
  }
  orders.push(order);
  writeOrders(orders);
  try {
    if (channel) {
      channel.sendToQueue(EVENT_QUEUES.created, Buffer.from(JSON.stringify(order)), { persistent: true });
      console.log('Order created & published:', order);
    }
  } catch (err) {
    console.error('Error publishing order:', err);
  }
  res.status(201).json({ status: 'Order created', order });
});

// Update order
app.put('/orders/:id', async (req, res) => {
  const id = req.params.id;
  const update = req.body;
  let orders = readOrders();
  const idx = orders.findIndex(o => o.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  orders[idx] = { ...orders[idx], ...update, id };
  writeOrders(orders);
  try {
    if (channel) {
      channel.sendToQueue(EVENT_QUEUES.updated, Buffer.from(JSON.stringify(orders[idx])), { persistent: true });
      console.log('Order updated & published:', orders[idx]);
    }
  } catch (err) {
    console.error('Error publishing order update:', err);
  }
  res.json({ status: 'Order updated', order: orders[idx] });
});

// Delete order
app.delete('/orders/:id', async (req, res) => {
  const id = req.params.id;
  let orders = readOrders();
  const idx = orders.findIndex(o => o.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const [deleted] = orders.splice(idx, 1);
  writeOrders(orders);
  try {
    if (channel) {
      channel.sendToQueue(EVENT_QUEUES.deleted, Buffer.from(JSON.stringify(deleted)), { persistent: true });
      console.log('Order deleted & published:', deleted);
    }
  } catch (err) {
    console.error('Error publishing order delete:', err);
  }
  res.json({ status: 'Order deleted', order: deleted });
});

app.listen(PORT, () => console.log(`Order API running on port ${PORT}`));
