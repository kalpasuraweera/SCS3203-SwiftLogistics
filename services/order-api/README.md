# Order API (Production Ready)

This service manages orders using Postgres and publishes events to RabbitMQ. All endpoints are protected by Keycloak JWT authentication.

## Environment Variables
- `PORT` - Service port (default: 3000)
- `RABBIT_URL` - RabbitMQ connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` - Postgres connection
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` - Keycloak OIDC config

## Running Locally
```powershell
npm install
npm start
```

## Endpoints (all require Bearer token)
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create order (body: `{ id, customer, status, items }`)
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

## Auth
- Obtain a JWT from Keycloak (see project docs)
- Pass as `Authorization: Bearer <token>`

## Events
- Publishes to RabbitMQ: `order.created`, `order.updated`, `order.deleted`

## Notes
- Uses Sequelize for DB access
- All data is stored in Postgres
- See `.env` for config
