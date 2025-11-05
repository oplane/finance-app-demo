# Finance Manager - Frontend

Modern React frontend for the Personal Finance Management application.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

## Features

- 🔐 User authentication (Login/Register)
- 📊 Dashboard with account overview
- 💰 Account balance display
- 💸 Transfer money between accounts
- 📜 Transaction history viewer
- 🎨 Modern, responsive UI
- 🚀 Fast development with Vite

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AccountCard.jsx
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── TransferModal.jsx
│   │   └── TransactionsModal.jsx
│   ├── context/           # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/          # API service layer
│   │   ├── api.js
│   │   ├── accountService.js
│   │   └── authService.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Installation

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file (optional):**
```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

**Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## Architecture

### Service Layer

The application uses a clean service layer architecture:

- **api.js** - Axios configuration with interceptors
- **authService.js** - Authentication operations
- **accountService.js** - Account and transaction operations

### State Management

- **AuthContext** - Global authentication state using React Context
- Local state management with useState for component-specific data

### Protected Routes

Routes are protected using the `ProtectedRoute` component which checks authentication status before rendering.

### API Integration

The frontend communicates with the backend via a proxy configured in `vite.config.js`. All API calls to `/api/*` are proxied to `http://localhost:3000`.

## Key Components

### Pages

- **Login** - User login form with demo credentials
- **Register** - User registration with validation
- **Dashboard** - Main view showing accounts and total balance

### Components

- **Layout** - Navigation and logout functionality
- **AccountCard** - Display individual account information
- **TransferModal** - Modal for transferring money
- **TransactionsModal** - Display transaction history
- **ProtectedRoute** - Route guard for authenticated routes

## Demo Credentials

- Username: `demo` / Password: `demo123`
- Username: `alice` / Password: `alice123`
- Username: `bob` / Password: `bob123`

## Development Notes

### API Interceptors

The app uses Axios interceptors to:
- Automatically attach JWT tokens to requests
- Handle authentication errors (401/403)
- Redirect to login on token expiration

### Responsive Design

The UI is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)

### Error Handling

All API calls include proper error handling with user-friendly error messages.

## Customization

### Colors

Update the primary color palette in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### API URL

Change the API URL in `.env`:

```env
VITE_API_URL=https://your-api-url.com/api
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

