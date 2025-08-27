// mocks/ros-rest-server/index.js
const express = require('express');
const app = express();
app.use(express.json());


app.post('/optimize', (req, res) => {
  const { orderId } = req.body;
  setTimeout(() => {
    const routeId = 'ROUTE-' + Math.floor(Math.random() * 100000);
    res.json({ routeId, orderId, stops: ['Colombo', 'Kandy'] });
  }, 1000);
});

app.listen(4000, () => console.log('ROS REST mock running on :4000'));
