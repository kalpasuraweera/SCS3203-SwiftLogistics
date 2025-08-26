// mocks/cms-soap-server/index.js
const express = require('express');
const soap = require('soap');
const http = require('http');
const fs = require('fs');

const service = {
  CMSService: {
    CMSPort: {
      CreateOrder(args, cb) {
        return { status: 'OK', cmsRef: 'CMS-123' };
      }
    }
  }
};

const xml = fs.readFileSync(__dirname + '/cms.wsdl', 'utf8');
const app = express();
const server = http.createServer(app);
soap.listen(server, '/wsdl', service, xml);

server.listen(4000, () => console.log('CMS SOAP mock running on :4000'));
