# Setting Up Webhook for Keycloak

This guide provides detailed instructions on how to configure a webhook in Keycloak to handle specific events such as user registration, login, and more.

## Prerequisites

- Keycloak server installed and running.
- Admin access to the Keycloak instance.
- A valid webhook URL to receive the events.

---

## Step 1: Start Keycloak in Development Mode

1. Grant execute permissions to the startup script:

   ```bash
   chmod +x start-dev.sh
   ```

2. Start the Keycloak server:

   ```bash
   ./start-dev.sh
   ```

## Step 2: Create a New Realm and Client

1. Log in to the Keycloak admin console (e.g., http://localhost:8080/admin).

2. Create a new realm:

- Navigate to the `Master Realm` > `Create Realm`.
- Enter a realm name (e.g., dev) and save.

3. Create a new client:

- In the dev realm, go to `Clients` > `Create`.
- Provide a client ID (e.g., dev-client) and configure as needed.

## Step 3: Create an Admin User and Assign Roles

1. Create a new admin user:

- Go to `Users` > `Add User`.
- Fill in the required fields (e.g., username) and save.

2. Assign roles to the admin user:

- Navigate to the user's Role Mappings tab.
- Assign the following roles:
  - realm-admin
  - view-events
  - manage-events

## Step 4: Add Event Listeners

Go to `Realm settings` > `Events` > `Event listeners`, add options:
- `ext-event-http`
- `ext-event-webhook`
- `ext-event-script`

## Step 5: Obtain Admin Access Token

1. Send a POST request to retrieve the admin access token:

```bash
POST {{ KEYCLOAK_URL }}/realms/dev/protocol/openid-connect/token
Headers: {
  Content-Type: application/x-www-form-urlencoded
}
Payload: {
  "client_id": "{{ client_id }}",
  "username": "{{ username }}",
  "password": "{{ password }}",
  "grant_type": "password"
}
```

2. Store the `access_token` from the response for the next steps.

## Step 6: Add a Webhook to Keycloak

1. Send a POST request to configure the webhook:

```bash
POST {{ KEYCLOAK_URL }}/realms/dev/webhooks
Headers: {
  Authorization: Bearer {{ ACCESS_TOKEN }}
  Content-Type: application/json
}
Payload: {
  "enabled": "true",
  "url": "{{ WEBHOOK_URL }}",
  "eventTypes": ["*"]
}
```

- Replace `{{ WEBHOOK_URL }}` with your webhook endpoint.
- Use specific event types if needed (e.g., Register, Login).

## Examples

Webhook Response for `Register Request`:

```bash
Webhook Body: {
  time: 1737307806510,
  realmId: '66a220e7-ae8b-4dbb-9648-8f07f40e67f3',
  uid: 'c209c7ca-5568-4b77-8b86-d9dcde7fb830',
  authDetails: {
    realmId: 'dev',
    clientId: 'account-console',
    userId: 'd6d4bbff-a7f1-4fcc-b04e-2d42cd76b1ed',
    ipAddress: '192.168.97.1',
    username: 'test-user',
    sessionId: 'a199b2ac-6cd1-4f30-bcde-59eb0cd03eae'
  },
  details: {
    auth_method: 'openid-connect',
    auth_type: 'code',
    register_method: 'form',
    last_name: 'user',
    redirect_uri: 'http://localhost:8080/realms/dev/account/#',
    first_name: 'test',
    code_id: 'a199b2ac-6cd1-4f30-bcde-59eb0cd03eae',
    email: 'test-user@gmail.com',
    username: 'test-user'
  },
  type: 'access.REGISTER'
}
```

## References

- [Keycloak Events Plugin Documentation](https://github.com/p2-inc/keycloak-events/tree/main)
- [GitHub Issue #5: Event Support Discussion](https://github.com/p2-inc/keycloak-events/issues/5)
