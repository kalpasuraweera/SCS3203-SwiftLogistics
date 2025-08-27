// Keycloak JWT validation for WebSocket and HTTP
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_URL.replace(/\/$/, '') + '/realms/' + process.env.KEYCLOAK_REALM + '/protocol/openid-connect/certs',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function keycloakSocketAuth(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
  if (!token) return next(new Error('Missing token'));
  jwt.verify(token, getKey, {
    audience: process.env.KEYCLOAK_CLIENT_ID,
    issuer: process.env.KEYCLOAK_URL.replace(/\/$/, '') + '/realms/' + process.env.KEYCLOAK_REALM,
    algorithms: ['RS256'],
  }, (err, decoded) => {
    if (err) return next(new Error('Invalid token: ' + err.message));
    socket.user = decoded;
    next();
  });
}

module.exports = { keycloakSocketAuth };
