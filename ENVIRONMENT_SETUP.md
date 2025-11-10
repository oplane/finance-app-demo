# Environment Setup Guide

## Backend Environment Variables

Create a file `backend/.env` with the following configuration:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database.db

# JWT Configuration (OPLANE_REQ-00000041)
# CRITICAL: Generate a strong secret for production!
JWT_SECRET=<REPLACE_WITH_STRONG_SECRET>
JWT_ISSUER=finance-app
JWT_AUDIENCE=finance-app-api
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Generating a Strong JWT Secret

**Never use the default `your_jwt_secret_key` in production!**

### On Linux/Mac:
```bash
openssl rand -base64 64
```

### On Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..48|ForEach-Object{Get-Random -Max 256}))
```

### On Windows (Node.js):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Copy the output and use it as your `JWT_SECRET`.

## Example Configuration

```bash
# Example (DO NOT use in production - generate your own!)
JWT_SECRET=Xk7jP2mR9vQ4nT8wL5sF1dA6hG3bY0cE9xZ4uV7iO2pM5kN8jT1qW6eR3yU4oL7sD0aG5hK2fB9cV6xZ3mN1w==
JWT_ISSUER=finance-app
JWT_AUDIENCE=finance-app-api
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Security Checklist

- [ ] Generated strong JWT_SECRET using `openssl rand -base64 64`
- [ ] Added `backend/.env` to `.gitignore`
- [ ] Never committed `.env` to version control
- [ ] Used environment variables in production (not hardcoded)
- [ ] Set `NODE_ENV=production` in production environment
- [ ] Configured different secrets for dev/staging/production

## Verifying Configuration

Start the backend and check the logs:

```bash
cd backend
npm start
```

You should see:
```
Server running on port 3000
Using JWT issuer: finance-app
Using JWT audience: finance-app-api
```

If you see `Using JWT secret: your_jwt_secret_key`, you need to set your environment variable!

## Frontend Environment (Optional)

Create `frontend/.env` if you need to customize the API URL:

```bash
VITE_API_URL=http://localhost:3000/api
```

## Production Considerations

1. **Use a Secrets Manager:** AWS Secrets Manager, HashiCorp Vault, etc.
2. **Rotate Secrets Regularly:** Change JWT_SECRET periodically
3. **Different Secrets Per Environment:** Dev, staging, and production should have different secrets
4. **Monitor Access:** Log all secret access attempts
5. **Principle of Least Privilege:** Only necessary services should access secrets


