// delivery/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';

// ...add your driver actions logic here...

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`Delivery service running on port ${PORT}`));
