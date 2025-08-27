// Keycloak JWT validation middleware
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

function keycloakAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.split(' ')[1];
  jwt.verify(token, getKey, {
    audience: process.env.KEYCLOAK_CLIENT_ID,
    issuer: process.env.KEYCLOAK_URL.replace(/\/$/, '') + '/realms/' + process.env.KEYCLOAK_REALM,
    algorithms: ['RS256'],
  }, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token', details: err.message });
    req.user = decoded;
    next();
  });
}

module.exports = keycloakAuth;
