# Keycloak Setup Guide

Keycloak provides authentication and authorization for the SwiftTrack platform.

## Running Keycloak
- Keycloak is enabled in `docker-compose.yml`.
- Access the admin UI at [http://localhost:8081](http://localhost:8081) (user: `admin`, password: `admin`).
- By default, Keycloak uses the Postgres DB defined in compose.

## Importing a Realm
- To pre-load users, clients, and roles, export a realm from Keycloak and place it as `infra/keycloak/realm-export.json`.
- Uncomment the `KEYCLOAK_IMPORT` and `volumes` lines in `docker-compose.yml` to auto-import on startup.

## Developer Notes
- After Keycloak is running, create a realm, clients (for each UI/app), and users as needed.
- Update your frontend apps to use Keycloak for login (OIDC/OAuth2). See the UI README files for integration tips.
- For production, change admin credentials and secure the instance.
