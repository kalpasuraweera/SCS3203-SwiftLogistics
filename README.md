# 🚚 SwiftTrack Logistics Platform

A modern, modular logistics orchestration system built with Node.js microservices, Docker Compose, and React UIs.

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS/Linux)
- [Node.js](https://nodejs.org/) (for local development of services/UI)

### Quick Start (All Services)

```powershell
# In the project root
# Build and start all services, mocks, and infrastructure
# (First run may take a few minutes)
docker compose up --build
```

- RabbitMQ UI: [http://localhost:15672](http://localhost:15672) (guest/guest)
- Postgres: `localhost:5432` (swift/swift)
- API Gateway: [http://localhost:8080](http://localhost:8080)
- Order API: [http://localhost:3001/orders](http://localhost:3001/orders)
- Client Portal UI: (see below)
- Driver App UI: (see below)

### Running UI Apps (Dev Mode)

```powershell
cd ui/client-portal
npm install
npm start
# Visit http://localhost:3000

cd ../driver-app
npm install
npm start
# Visit http://localhost:3000
```

---

## 🏗️ Project Architecture

```
root/
  docker-compose.yml
  services/
    order-api/        # REST API for orders
    cms-adapter/      # SOAP bridge to CMS
    wms-adapter/      # TCP bridge to WMS
    ros-adapter/      # REST bridge to ROS
    notification/     # WebSocket push service
    delivery/         # Driver actions/events
  mocks/
    cms-soap-server/  # Mock CMS SOAP server
    wms-tcp-server/   # Mock WMS TCP server
    ros-rest-server/  # Mock ROS REST server
  ui/
    client-portal/    # React app for clients
    driver-app/       # React app for drivers
  infra/
    rabbitmq/         # RabbitMQ config/scripts
    postgres/         # Postgres config/scripts
    keycloak/         # Keycloak config (optional)
    gateway/          # NGINX API gateway config
```

- **All services communicate via RabbitMQ for events.**
- **API Gateway (NGINX) routes external HTTP traffic to backend services.**
- **Mocks** simulate external systems for local development/testing.
- **Keycloak** can be enabled for authentication (see infra/keycloak).

---

## 👩‍💻 Developer Guide

### Service Conventions
- Each service is a standalone Node.js app (see `services/`).
- Use Express for HTTP APIs, `amqplib` for RabbitMQ, and `.env` for config.
- All services expose `/health` for health checks.
- Use the provided `index.js` skeletons as a starting point.

### Messaging/Event Flow
- Use RabbitMQ queues for inter-service events (e.g., `order.created`).
- Services should publish/consume events as needed for decoupling.
- See `order-api/index.js` for a publishing example.

### API Gateway
- NGINX config in `infra/gateway/nginx.conf` routes `/api/*` to services.
- Update this config to add new routes or change service ports.

### Mocks
- Mocks in `mocks/` simulate external systems (SOAP, TCP, REST).
- Use these for local development and integration testing.

### UI Apps
- React apps in `ui/client-portal` and `ui/driver-app`.
- Use `npm start` for local dev, or build and serve statically in production.

### Infra
- Place custom config/scripts for RabbitMQ, Postgres, Keycloak, and Gateway in `infra/`.
- See each infra folder's README for mounting instructions.

### Authentication (Optional)
- Keycloak can be enabled for OAuth2/OpenID Connect.
- Add realm exports to `infra/keycloak` and enable the service in `docker-compose.yml`.

---

## 📝 Notes
- Use Docker Compose for a consistent, reproducible dev environment.
- Keep service dependencies minimal and use environment variables for config.
- Document any new services, events, or API routes in this README.

---

Happy hacking! 🚚✨
