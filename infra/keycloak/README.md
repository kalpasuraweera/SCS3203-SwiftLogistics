# Keycloak Infrastructure

This folder is for Keycloak configuration and realm exports.

- Add realm export files or custom themes here.
- The Keycloak service can be added to `docker-compose.yml` for authentication needs.

## Example: Realm Import
You can mount a realm file in `docker-compose.yml` like this:

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:24.0.1
  environment:
    KEYCLOAK_IMPORT: /opt/keycloak/data/import/realm-export.json
  volumes:
    - ./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json
```
