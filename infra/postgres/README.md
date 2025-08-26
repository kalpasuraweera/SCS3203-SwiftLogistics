# Postgres Infrastructure

This folder is for Postgres configuration, migrations, and seed scripts.

- The main Postgres service is defined in `docker-compose.yml` at the project root.
- Place any custom SQL scripts or migration tools here.

## Example: Initialization Script
You can mount an init script in `docker-compose.yml` like this:

```yaml
postgres:
  image: postgres:15
  volumes:
    - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
```
