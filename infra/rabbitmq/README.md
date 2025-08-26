# RabbitMQ Infrastructure

This folder is for RabbitMQ configuration and custom scripts.

- The main RabbitMQ service is defined in `docker-compose.yml` at the project root.
- Place any custom definitions, plugins, or initialization scripts here if needed.

## Example: Custom Definitions
You can mount a definitions file in `docker-compose.yml` like this:

```yaml
rabbitmq:
  image: rabbitmq:3-management
  volumes:
    - ./infra/rabbitmq/definitions.json:/etc/rabbitmq/definitions.json
  environment:
    RABBITMQ_LOAD_DEFINITIONS: /etc/rabbitmq/definitions.json
```
