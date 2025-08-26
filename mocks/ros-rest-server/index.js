// mocks/ros-rest-server/index.js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/optimize', (req, res) => {
  setTimeout(() => {
    res.json({ routeId: 'ROUTE-789', stops: ['Colombo', 'Kandy'] });
  }, 1000);
});

app.listen(4000, () => console.log('ROS REST mock running on :4000'));
