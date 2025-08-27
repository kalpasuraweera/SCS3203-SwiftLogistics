# Delivery Service (Driver Actions/Events)

This service manages driver delivery actions (delivered, failed, etc.), stores them in Postgres, and publishes events to RabbitMQ. All endpoints are protected by Keycloak JWT authentication.

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

## How it Works
- Drivers (via mobile app) submit delivery actions (delivered, failed, etc.)
- Each action is stored in Postgres and published to RabbitMQ (`delivery.event`)
- Real-time updates are pushed to clients via the Notification Service

## Endpoints (all require Bearer token)
- `GET /deliveries` - List all delivery actions
- `GET /deliveries/:id` - Get delivery action by ID
- `POST /deliveries` - Create delivery action (body: `{ orderId, status, reason?, signature?, photo? }`)
- `DELETE /deliveries/:id` - Delete delivery action

## Auth
- Obtain a JWT from Keycloak (see project docs)
- Pass as `Authorization: Bearer <token>`

## Event Flow
- Publishes to RabbitMQ: `delivery.event`
- Notification Service broadcasts to all connected clients (see its README for WebSocket integration)

## Notes
- Uses Sequelize for DB access
- All data is stored in Postgres
- See `.env` for config
