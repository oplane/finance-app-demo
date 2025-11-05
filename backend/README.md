# Finance App - Backend

Node.js backend API for the Personal Finance Management application.

## Tech Stack

- **Framework:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## Installation

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file:**
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DB_PATH=./database.db
```

4. **Initialize the database:**
```bash
npm run init-db
```

5. **Seed demo users (optional):**
```bash
npm run seed
```

6. **Start the server:**
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Accounts (Protected)
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:id/transactions` - Get transaction history

### Transfers (Protected)
- `POST /api/transfer` - Transfer money between accounts

## Demo Users

- Username: `demo` / Password: `demo123`
- Username: `alice` / Password: `alice123`
- Username: `bob` / Password: `bob123`

Each user has:
- Checking Account: $5,000
- Savings Account: $10,000

## Database Schema

See the main README for complete schema details.

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-restart)
- `npm run init-db` - Initialize database schema
- `npm run seed` - Seed demo users

## License

ISC

