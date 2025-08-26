// cms-adapter/index.js
require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const soap = require('strong-soap').soap;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';

// ...add your SOAP bridge logic here...

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`CMS Adapter running on port ${PORT}`));
