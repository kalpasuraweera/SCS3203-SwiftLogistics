# API Gateway Infrastructure

This folder is for API Gateway configuration (e.g., NGINX, Traefik).

- Place your gateway config files here (e.g., `nginx.conf`).
- The gateway can be added to `docker-compose.yml` to route traffic to services.

## Example: NGINX Config
You can mount a config file in `docker-compose.yml` like this:

```yaml
gateway:
  image: nginx:alpine
  volumes:
    - ./infra/gateway/nginx.conf:/etc/nginx/nginx.conf
  ports:
    - "8080:80"
```
