# Notification Service (WebSocket Push)

This service broadcasts backend events (order, adapter, etc.) to frontend clients via WebSocket. All connections require Keycloak JWT authentication.

## Environment Variables
- `PORT` - Service port (default: 3000)
- `RABBIT_URL` - RabbitMQ connection string
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` - Keycloak OIDC config

## Running Locally
```powershell
npm install
npm start
```

## How it Works
- Listens for events on RabbitMQ queues (e.g., `order.created`, `order.updated`)
- Broadcasts each event to all connected WebSocket clients
- All WebSocket connections require a valid Keycloak JWT

## WebSocket Integration (Frontend)
- Use `socket.io-client` in your React app
- Connect to: `ws://localhost:3005` (or via gateway)
- Pass the Keycloak access token as `auth.token`:

```js
import { io } from 'socket.io-client';
const socket = io('ws://localhost:3005', {
  auth: { token: keycloak.token },
});

socket.on('order.created', data => {
  // handle new order event
});

socket.on('connected', msg => {
  // handle connection confirmation
});
```

- You can listen for any event in the `EVENT_QUEUES` list (see code).
- If using the API gateway, connect to `ws://localhost:8080/api/notify/`.

## Auth
- Obtain a JWT from Keycloak (see project docs)
- Pass as `auth.token` when connecting

## Notes
- All events are broadcast to all connected clients
- Extend `EVENT_QUEUES` in code to add more event types
- See `.env` for config
