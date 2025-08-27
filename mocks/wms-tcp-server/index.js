// mocks/wms-tcp-server/index.js
const net = require('net');

const server = net.createServer(socket => {
  socket.on('data', data => {
    const msg = JSON.parse(data.toString());
    if (msg.op === 'createPackage') {
      const wmsRef = 'WMS-' + Math.floor(Math.random() * 100000);
      socket.write(JSON.stringify({ event: 'packageReady', ref: wmsRef, orderId: msg.orderId }));
    }
  });
});

server.listen(4000, () => console.log('WMS TCP mock running on :4000'));
