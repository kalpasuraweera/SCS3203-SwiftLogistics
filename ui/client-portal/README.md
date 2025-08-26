# Client Portal UI

This is the React app for SwiftTrack clients.

## Running Locally
```powershell
npm install
npm start
# Visit http://localhost:3000
```

## Connecting to Backend Services
- API requests should be sent to the API Gateway at `http://localhost:8080/api/` (see NGINX config).
- Use environment variables or a config file to set the API base URL.

## Authentication
- Integrate with Keycloak for login/logout and token management.
- Use a library like `keycloak-js` or `@react-keycloak/web`.
- Configure the Keycloak client in the admin UI and use its settings here.

## WebSocket/Notifications
- For real-time updates, connect to the Notification service (see backend WebSocket endpoint).
- Use `socket.io-client` to connect to `ws://localhost:3005` (or via gateway if routed).

## Developer Notes
- Keep API and WebSocket URLs in a config file for easy switching between dev/prod.
- Document any new endpoints or integration patterns in this README.
