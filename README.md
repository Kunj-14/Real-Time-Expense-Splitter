# Real-Time Expense Splitter

A full-stack web application to split expenses with friends or roommates in real-time. 

## Features
- **User Authentication**: Secure JWT-based login and registration.
- **Group Management**: Create groups and invite users by username.
- **Expense Tracking**: Add expenses, split them equally or use custom amounts.
- **Real-Time Sync**: WebSockets ensure expenses and settlements are synced live across all clients.
- **Debt Simplification**: Advanced algorithm calculates the minimum number of transactions needed to settle all debts.
- **Beautiful UI**: Built with Tailwind CSS.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, Mongoose
- **Database**: MongoDB (Local)

## Setup Instructions

1. Ensure you have **MongoDB** running locally on `localhost:27017`. The database `expense-splitter` will be created automatically.
2. In the root directory of this project, run:
   ```bash
   npm install
   ```
   *Note: This will automatically install dependencies for both the `client` and `server` folders via a postinstall script.*

3. Start both development servers concurrently:
   ```bash
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173` (or similar Vite port) and the backend runs on `http://localhost:5000`.

### Environment Variables
The server uses standard variables (already configured in `server/.env.example`). If you need to change them, rename `.env.example` to `.env` in the `server` directory:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense-splitter
JWT_SECRET=super_secret_jwt_key_here
```
