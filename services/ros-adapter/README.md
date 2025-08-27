# ROS Adapter (Production Ready)

This service bridges order events to the ROS REST system, stores mappings in Postgres, and exposes CRUD endpoints. All endpoints are protected by Keycloak JWT authentication.

## Environment Variables
- `PORT` - Service port (default: 3000)
- `RABBIT_URL` - RabbitMQ connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` - Postgres connection
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` - Keycloak OIDC config
- `ROS_REST_URL` - ROS REST endpoint (default: mock server)

## Running Locally
```powershell
npm install
npm start
```

## How it Works
- Listens for `order.created` events from RabbitMQ
- Calls the ROS REST service to optimize a route
- Stores the mapping (orderId → routeId) in Postgres

## Endpoints (all require Bearer token)
- `GET /ros-routes` - List all ROS mappings
- `GET /ros-routes/:id` - Get mapping by orderId
- `DELETE /ros-routes/:id` - Delete mapping

## Auth
- Obtain a JWT from Keycloak (see project docs)
- Pass as `Authorization: Bearer <token>`

## Notes
- Uses Sequelize for DB access
- All data is stored in Postgres
- See `.env` for config
