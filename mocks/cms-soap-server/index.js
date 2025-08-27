// mocks/cms-soap-server/index.js
const express = require('express');
const soap = require('soap');
const http = require('http');
const fs = require('fs');

const service = {
  CMSService: {
    CMSPort: {
      CreateOrder(args, cb) {
        // Echo back orderId and generate a random CMS ref
        const cmsRef = 'CMS-' + Math.floor(Math.random() * 100000);
        return { status: 'OK', cmsRef, orderId: args.orderId };
      }
    }
  }
};

const xml = fs.readFileSync(__dirname + '/cms.wsdl', 'utf8');
const app = express();
const server = http.createServer(app);
soap.listen(server, '/wsdl', service, xml);

server.listen(4000, () => console.log('CMS SOAP mock running on :4000'));
