# Driver App UI

This is the React app for SwiftTrack drivers.

## Running Locally
```powershell
npm install
npm start
# Visit http://localhost:3000
```

## Connecting to Backend Services
- API requests should be sent to the API Gateway at `http://localhost:8080/api/`.
- Use environment variables or a config file to set the API base URL.

## Authentication
- Integrate with Keycloak for driver login and token management.
- Use a library like `keycloak-js` or `@react-keycloak/web`.
- Configure the Keycloak client in the admin UI and use its settings here.

## WebSocket/Notifications
- For real-time delivery updates, connect to the Notification service using `socket.io-client`.
- Connect to `ws://localhost:3005` (or via gateway if routed).

## Developer Notes
- Store API and WebSocket URLs in a config file for easy switching.
- Document any new endpoints or integration patterns in this README.
