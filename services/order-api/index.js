// order-api/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';
const QUEUE = 'order.created';

let channel;

// Connect to RabbitMQ
async function connectRabbit() {
  try {
    const conn = await amqp.connect(RABBIT_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
    setTimeout(connectRabbit, 5000); // Retry after 5s
  }
}

connectRabbit();

app.get('/health', (req, res) => res.send('OK'));

// Example order creation endpoint
app.post('/orders', async (req, res) => {
  const order = req.body;
  if (!order || !order.id) {
    return res.status(400).json({ error: 'Order must have an id' });
  }
  try {
    if (channel) {
      channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(order)), { persistent: true });
      console.log('Order published:', order);
      res.status(201).json({ status: 'Order created', order });
    } else {
      res.status(503).json({ error: 'RabbitMQ not connected' });
    }
  } catch (err) {
    console.error('Error publishing order:', err);
    res.status(500).json({ error: 'Failed to publish order' });
  }
});

app.listen(PORT, () => console.log(`Order API running on port ${PORT}`));
