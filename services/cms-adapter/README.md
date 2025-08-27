# CMS Adapter (Production Ready)

This service bridges order events to the CMS SOAP system, stores mappings in Postgres, and exposes CRUD endpoints. All endpoints are protected by Keycloak JWT authentication.

## Environment Variables
- `PORT` - Service port (default: 3000)
- `RABBIT_URL` - RabbitMQ connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` - Postgres connection
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` - Keycloak OIDC config
- `CMS_SOAP_WSDL_URL` - URL to CMS SOAP WSDL (default: mock server)

## Running Locally
```powershell
npm install
npm start
```

## How it Works
- Listens for `order.created` events from RabbitMQ
- Calls the CMS SOAP service to create an order
- Stores the mapping (orderId → cmsRef) in Postgres

## Endpoints (all require Bearer token)
- `GET /cms-orders` - List all CMS mappings
- `GET /cms-orders/:id` - Get mapping by orderId
- `DELETE /cms-orders/:id` - Delete mapping

## Auth
- Obtain a JWT from Keycloak (see project docs)
- Pass as `Authorization: Bearer <token>`

## Notes
- Uses Sequelize for DB access
- All data is stored in Postgres
- See `.env` for config
