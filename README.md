# Personal Finance Management App

A full-stack personal finance management application with a modern React frontend and Node.js backend. Features user authentication, multiple accounts per user, and money transfers between accounts.

## Features

- 🔐 User registration and login with JWT authentication
- 💰 Multiple accounts per user (checking, savings)
- 📊 View account balances with beautiful dashboard
- 📜 Transaction history for each account
- 💸 Transfer money between accounts
- 🌱 Seed data with demo users
- 🗄️ SQLite database for easy setup
- 🎨 Modern, responsive React UI with Tailwind CSS

## Tech Stack

### Backend
- **Framework:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

## Quick Start

### Option 1: Using Root Scripts (Recommended)

From the project root:

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Initialize the database
npm run init-db

# Seed demo users (optional)
npm run seed

# In one terminal, start the backend
npm run backend

# In another terminal, start the frontend
npm run frontend
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run init-db
npm run seed
npm start
```
Backend runs on `http://localhost:3000`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Access the App

Open your browser and navigate to `http://localhost:5173`

**Demo Credentials:**
- Username: `demo` / Password: `demo123`
- Username: `alice` / Password: `alice123`
- Username: `bob` / Password: `bob123`

### Environment Variables

**Backend** - Create `backend/.env`:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DB_PATH=./database.db
```

**Frontend** - Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

## API Endpoints

### Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

*Note: Upon registration, users automatically receive 2 accounts:*
- *Checking Account: $5,000*
- *Savings Account: $10,000*

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Accounts (Protected Routes)

*All account endpoints require authentication. Include the JWT token in the Authorization header:*
```
Authorization: Bearer <your_token>
```

#### Get all accounts for current user
```http
GET /api/accounts
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "accounts": [
    {
      "id": 1,
      "account_name": "Checking Account",
      "account_type": "checking",
      "balance": 5000,
      "created_at": "2024-01-15 10:30:00"
    },
    {
      "id": 2,
      "account_name": "Savings Account",
      "account_type": "savings",
      "balance": 10000,
      "created_at": "2024-01-15 10:30:00"
    }
  ]
}
```

#### Get transaction history for an account
```http
GET /api/accounts/:id/transactions
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "amount": 1000,
      "type": "debit",
      "description": "Transfer to savings",
      "transaction_type": "transfer",
      "from_account": "Checking Account",
      "to_account": "Savings Account",
      "created_at": "2024-01-15 11:00:00"
    }
  ]
}
```

### Transfers (Protected Route)

#### Transfer money between accounts
```http
POST /api/transfer
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 1000,
  "description": "Transfer to savings"
}
```

**Response:**
```json
{
  "message": "Transfer successful",
  "transaction": {
    "id": 1,
    "from_account_id": 1,
    "to_account_id": 2,
    "amount": 1000,
    "description": "Transfer to savings",
    "from_balance": 4000,
    "to_balance": 11000
  }
}
```

## Demo Users

If you ran the seed script, you can use these demo accounts:

| Username | Password  |
|----------|-----------|
| demo     | demo123   |
| alice    | alice123  |
| bob      | bob123    |

Each demo user has:
- Checking Account with $5,000
- Savings Account with $10,000

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Accounts Table
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_account_id INTEGER,
  to_account_id INTEGER,
  amount REAL NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);
```

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

### Get accounts (replace TOKEN with your JWT):
```bash
curl http://localhost:3000/api/accounts \
  -H "Authorization: Bearer TOKEN"
```

### Transfer money:
```bash
curl -X POST http://localhost:3000/api/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fromAccountId":1,"toAccountId":2,"amount":500,"description":"Saving money"}'
```

### Get transactions:
```bash
curl http://localhost:3000/api/accounts/1/transactions \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
finance-app-demo/
├── backend/
│   ├── config/
│   │   └── database.js         # Database connection and schema
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── accounts.js         # Account management routes
│   │   └── transfer.js         # Transfer routes
│   ├── scripts/
│   │   ├── initDb.js           # Database initialization script
│   │   └── seed.js             # Seed demo users script
│   ├── server.js               # Main application file
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── context/            # React context providers
    │   ├── pages/              # Page components
    │   ├── services/           # API service layer
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── README.md
```

## Security Notes

- Passwords are hashed using bcryptjs before storing
- JWT tokens expire after 24 hours
- All account operations verify user ownership
- Transfers use database transactions to ensure data integrity
- Change the `JWT_SECRET` in production to a secure random string

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## License

ISC

