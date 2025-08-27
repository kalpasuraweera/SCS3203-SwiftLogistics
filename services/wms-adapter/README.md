# WMS Adapter (Production Ready)

This service bridges order events to the WMS TCP system, stores mappings in Postgres, and exposes CRUD endpoints. All endpoints are protected by Keycloak JWT authentication.

## Environment Variables
- `PORT` - Service port (default: 3000)
- `RABBIT_URL` - RabbitMQ connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` - Postgres connection
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` - Keycloak OIDC config
- `WMS_TCP_HOST`, `WMS_TCP_PORT` - WMS TCP server config (default: mock server)

## Running Locally
```powershell
npm install
npm start
```

## How it Works
- Listens for `order.created` events from RabbitMQ
- Calls the WMS TCP service to create a package
- Stores the mapping (orderId → wmsRef) in Postgres

## Endpoints (all require Bearer token)
- `GET /wms-packages` - List all WMS mappings
- `GET /wms-packages/:id` - Get mapping by orderId
- `DELETE /wms-packages/:id` - Delete mapping

## Auth
- Obtain a JWT from Keycloak (see project docs)
- Pass as `Authorization: Bearer <token>`

## Notes
- Uses Sequelize for DB access
- All data is stored in Postgres
- See `.env` for config
