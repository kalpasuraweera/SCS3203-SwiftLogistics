// mocks/wms-tcp-server/index.js
const net = require('net');

const server = net.createServer(socket => {
  socket.on('data', data => {
    const msg = JSON.parse(data.toString());
    if (msg.op === 'createPackage') {
      socket.write(JSON.stringify({ event: 'packageReady', ref: 'WMS-456' }));
    }
  });
});

server.listen(4000, () => console.log('WMS TCP mock running on :4000'));
